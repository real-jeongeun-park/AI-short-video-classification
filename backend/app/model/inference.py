import os
import re
import uuid
import tempfile
import cv2
import torch
import numpy as np
from PIL import Image
from torchvision import transforms
import yt_dlp
from app.model.classifier import get_model, DEVICE

IMG_SIZE = 224
NUM_FRAMES = 8

transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def download_video(url: str) -> str:
    """URL로부터 영상을 다운로드하고 로컬 파일 경로를 반환한다."""
    tmp_dir = tempfile.gettempdir()
    filename = f"{uuid.uuid4()}.mp4"
    output_path = os.path.join(tmp_dir, filename)

    ydl_opts = {
        "outtmpl": output_path,
        "format": "mp4/best",
        "quiet": True,
        "noplaylist": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    if not os.path.exists(output_path):
        raise FileNotFoundError("영상 다운로드에 실패했습니다.")

    return output_path


def extract_frames(video_path: str, num_frames: int = NUM_FRAMES) -> list[Image.Image]:
    """영상에서 num_frames개를 균등한 간격으로 추출한다."""
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if total_frames <= 0:
        cap.release()
        raise ValueError("영상에서 프레임을 읽을 수 없습니다.")

    indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
    frames = []

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret:
            continue
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frames.append(Image.fromarray(frame_rgb))

    cap.release()

    if len(frames) < num_frames:
        # 프레임이 부족하면 마지막 프레임을 반복해서 채움
        while len(frames) < num_frames:
            frames.append(frames[-1])

    return frames

def run_inference(url: str) -> dict:
    """URL -> 다운로드 -> 프레임 추출 -> 전처리 -> 모델 추론까지 전체 파이프라인"""
    video_path = None
    try:
        video_path = download_video(url)
        frames = extract_frames(video_path, NUM_FRAMES)

        tensors = [transform(frame) for frame in frames]
        input_tensor = torch.stack(tensors).unsqueeze(0).to(DEVICE)  # (1, T, C, H, W)

        model = get_model()

        with torch.no_grad():
            logit = model(input_tensor)
            probability = torch.sigmoid(logit).item()

        is_ai_generated = probability > 0.5

        return {
            "ai_probability": round(probability, 3),
            "is_ai_generated": is_ai_generated,
        }

    finally:
        # 다운로드한 임시 영상 파일 정리
        if video_path and os.path.exists(video_path):
            os.remove(video_path)


def extract_metadata(url: str) -> dict:
    ydl_opts = {
        "quiet": True,
        "skip_download": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    return {
        "title": info.get("title"),
        "thumbnail": info.get("thumbnail"),       # 플랫폼이 자체 생성한 대표 썸네일 URL
        "description": info.get("description"),   # 보통 캡션(해시태그 포함)
        "tags": info.get("tags", []),              # 플랫폼이 제공하는 태그 (있으면)
        "uploader": info.get("uploader"),
    }


def extract_hashtags(*texts: str) -> list[str]:
    hashtags = []
    for text in texts:
        if not text:
            continue
        hashtags.extend(re.findall(r"#(\w+)", text))

    # 중복 제거하면서 순서 유지
    seen = set()
    unique_hashtags = []
    for tag in hashtags:
        if tag not in seen:
            seen.add(tag)
            unique_hashtags.append(tag)

        if len(unique_hashtags) >= 5:
            break

    return ",".join(unique_hashtags)