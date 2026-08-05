import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights
from pathlib import Path

# ---------------------------
# 모델 아키텍처
# ---------------------------
class EfficientNetTinyGRUClassifier(nn.Module):
    def __init__(self, backbone_name="efficientnet_b0", hidden_dim=128, gru_layers=1, dropout=0.5, pretrained=False, freeze_backbone=False):
        super().__init__()

        # 추론 시점에는 ImageNet 사전학습 가중치를 새로 받을 필요 없음
        # (어차피 우리가 학습시킨 state_dict로 덮어씌울 거라서)
        weights = EfficientNet_B0_Weights.IMAGENET1K_V1 if pretrained else None
        model = efficientnet_b0(weights=weights)

        feat_dim = model.classifier[1].in_features
        self.features = model.features
        self.avgpool = model.avgpool
        self.feat_dim = feat_dim

        if freeze_backbone:
            for p in self.features.parameters():
                p.requires_grad = False

        self.gru = nn.GRU(
            input_size=feat_dim,
            hidden_size=hidden_dim,
            num_layers=gru_layers,
            batch_first=True
        )

        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, 1),
        )

    def forward(self, x):
        B, T, C, H, W = x.shape

        x = x.view(B * T, C, H, W)
        feats = self.features(x)
        feats = self.avgpool(feats)
        feats = torch.flatten(feats, 1)

        feats = feats.view(B, T, self.feat_dim)

        out, _h = self.gru(feats)
        last_temporal_feature = out[:, -1, :]

        logit = self.classifier(last_temporal_feature).squeeze(1)
        return logit


# ---------------------------
# 모델 로더 (싱글톤)
# ---------------------------
MODEL_PATH = Path(__file__).parent / "best_model.pt"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

MODEL_CONFIG = {
    "backbone": "efficientnet_b0",
    "hidden_dim": 128,
    "gru_layers": 1,
    "dropout": 0.5,
    "freeze_backbone": False,
}

NUM_FRAMES = 8
IMG_SIZE = 224

_model = None  # 모듈 레벨 캐시 (한 번만 로드)


def load_model() -> nn.Module:
    """
    서버 시작 시 한 번만 모델을 로드하고, 이후에는 캐시된 인스턴스를 재사용한다.
    """
    global _model

    if _model is not None:
        return _model

    model = EfficientNetTinyGRUClassifier(
        backbone_name=MODEL_CONFIG["backbone"],
        hidden_dim=MODEL_CONFIG["hidden_dim"],
        gru_layers=MODEL_CONFIG["gru_layers"],
        dropout=MODEL_CONFIG["dropout"],
        pretrained=False,          # 추론 시엔 ImageNet 가중치 필요 없음
        freeze_backbone=MODEL_CONFIG["freeze_backbone"],
    )

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"모델 가중치 파일을 찾을 수 없습니다: {MODEL_PATH}")

    checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)

    # 체크포인트가 state_dict만 저장된 경우 / 딕셔너리로 감싸서 저장된 경우 둘 다 대응
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
    elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        state_dict = checkpoint["state_dict"]
    else:
        state_dict = checkpoint

    model.load_state_dict(state_dict)
    model.to(DEVICE)
    model.eval()  # 추론 모드 (Dropout, BatchNorm 등 비활성화)

    _model = model
    print(f"[model] best_model.pt 로드 완료 (device={DEVICE})")

    return _model


def get_model() -> nn.Module:
    """FastAPI Depends로 주입해서 쓸 수 있는 접근자"""
    if _model is None:
        return load_model()
    return _model