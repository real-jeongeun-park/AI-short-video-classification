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
        cleaned_url = data.url.split("?")[0]
        video = db.query(Video).filter(Video.url == cleaned_url).first()

        if video is None:
            model_result = run_inference(data.url)
            metadata = extract_metadata(data.url)
            keywords = extract_hashtags(metadata["title"], metadata["description"])

            video = Video(
                title=metadata["title"],
                url=cleaned_url,
                keyword=keywords,
                thumbnail=metadata["thumbnail"],
                ai_probability=model_result["ai_probability"],
                is_ai_generated=model_result["is_ai_generated"]
            )
            db.add(video)
            db.commit()
            db.refresh(video)

        log = DetectionLog(
            video_id=video.id,
            user_id=data.user_id,
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        return {
            "video_id": video.id,
            "url": video.url,
            "title": video.title,
            "thumbnail_url": video.thumbnail,
            "keywords": video.keyword,
            "ai_probability": video.ai_probability,
            "is_ai_generated": video.is_ai_generated,
            "date": log.detected_at, # Latest
            "is_bookmarked": False,
        }

    except Exception as ex:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(ex))