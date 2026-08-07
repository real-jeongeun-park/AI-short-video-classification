from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DetectionLog
from app.models import Video
from app.models import Bookmark

router = APIRouter()

class DefaultRequest(BaseModel):
    user_id: int

@router.post("/home/recent-results")
def get_recent_results(data: DefaultRequest, db: Session = Depends(get_db)):
    try:
        rows = (
            db.query(DetectionLog, Video, Bookmark)
            .join(Video, DetectionLog.video_id == Video.id)
            .outerjoin(
                Bookmark,
                (Bookmark.detection_id == DetectionLog.id) & (Bookmark.user_id == data.user_id)
            )
            .order_by(DetectionLog.detected_at.desc())
            .limit(5)
            .all()
        )

        results = [
            {
                "log_id": log.id,
                "video_id": video.id,
                "title": video.title,
                "url": video.url,
                "thumbnail_url": video.thumbnail,
                "keywords": video.keyword,
                "ai_probability": log.ai_probability,
                "is_ai_generated": log.is_ai_generated,
                "date": log.detected_at,
                "is_bookmarked": bookmark is not None,
            }
            for log, video, bookmark in rows
        ]

        return {"results": results}

    except HTTPException:
        raise
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))
    