from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Video, DetectionLog
from app.model.inference import run_inference, extract_metadata, extract_hashtags

router = APIRouter()

class AnalyzeRequest(BaseModel):
    url: str
    user_id: int

@router.post("/model/detect/analyze")
def analyze(data: AnalyzeRequest, db: Session = Depends(get_db)):
    try:
        model_result = run_inference(data.url)
        metadata = extract_metadata(data.url)
        keywords = extract_hashtags(metadata["title"], metadata["description"])
        
        # Video 테이블에 기록
        video = Video(
            title=metadata["title"],
            url=data.url,
            keyword=keywords,
            thumbnail=metadata["thumbnail"],
        )
        db.add(video)
        db.commit()
        db.refresh(video)

        # DetectionLog 테이블에 기록
        log = DetectionLog(
            video_id=video.id,
            user_id=data.user_id,
            ai_probability=model_result["ai_probability"],
            is_ai_generated=model_result["is_ai_generated"],
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        return {
            "log_id": log.id,
            "video_id": video.id,
            "url": video.url,
            "title": video.title,
            "thumbnail_url": video.thumbnail,
            "keywords": video.keyword,
            "ai_probability": log.ai_probability,
            "is_ai_generated": log.is_ai_generated,
            "date": log.detected_at,
            "is_bookmarked": False,
        }

    except Exception as ex:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(ex))