from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Video, DetectionLog
from app.model.inference import run_inference

router = APIRouter()

class AnalyzeRequest(BaseModel):
    url: str
    user_id: int


@router.post("/model/detect/analyze")
def analyze(data: AnalyzeRequest, db: Session = Depends(get_db)):
    try:
        result = run_inference(data.url)

        # Video 테이블에 기록
        video = Video(
            title=data.url,   # 실제 제목 추출 로직이 없다면 우선 url을 title로 사용
            url=data.url,
        )
        db.add(video)
        db.commit()
        db.refresh(video)

        # DetectionLog 테이블에 기록
        log = DetectionLog(
            video_id=video.id,
            user_id=data.user_id,
            ai_probability=result["ai_probability"],
            is_ai_generated=result["is_ai_generated"],
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        return {
            "log_id": log.id,
            "video_id": video.id,
            "url": video.url,
            "title": video.title,
            "ai_probability": log.ai_probability,
            "is_ai_generated": log.is_ai_generated,
            "date": log.detected_at,
        }

    except Exception as ex:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(ex))