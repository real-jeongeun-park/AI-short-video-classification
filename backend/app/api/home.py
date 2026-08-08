from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
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
        latest_per_video = (
            db.query(
                DetectionLog.video_id.label("video_id"),
                func.max(DetectionLog.detected_at).label("last_detected_at"),
            )
            .group_by(DetectionLog.video_id)
            .order_by(func.max(DetectionLog.detected_at).desc())
            .limit(5)
            .subquery()
        )

        rows = (
            db.query(Video, latest_per_video.c.last_detected_at, Bookmark)
            .join(latest_per_video, Video.id == latest_per_video.c.video_id)
            .outerjoin(
                Bookmark,
                (Bookmark.video_id == Video.id) & (Bookmark.user_id == data.user_id)
            )
            .order_by(latest_per_video.c.last_detected_at.desc())
            .all()
        )

        results = [
            {
                "video_id": video.id,
                "title": video.title,
                "url": video.url,
                "thumbnail_url": video.thumbnail,
                "keywords": video.keyword,
                "ai_probability": video.ai_probability,
                "is_ai_generated": video.is_ai_generated,
                "date": last_detected_at,
                "is_bookmarked": bookmark is not None,
            }
            for video, last_detected_at, bookmark in rows
        ]

        return {"results": results}

    except HTTPException:
        raise
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))