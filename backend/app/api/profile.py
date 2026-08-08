from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import DetectionLog
from app.models import Video
from app.models import User
from app.models import Bookmark

router = APIRouter()

class DefaultRequest(BaseModel):
    user_id: int

class NicknameRequest(BaseModel):
    user_id: int
    nickname: str

class EmailRequest(BaseModel):
    user_id: int
    email: str

class PasswordRequest(BaseModel):
    user_id: int
    password: str

@router.patch("/profile/nickname")
def update_nickname(data: NicknameRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(
            User.id == data.user_id
        ).first()

        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

        user.nickname = data.nickname
        db.commit()
        db.refresh(user)
    
    except HTTPException:
        raise
    except Exception as ex:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(ex))


@router.patch("/profile/email")
def update_email(data: EmailRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(
            User.id == data.user_id
        ).first()

        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

        user.email = data.email
        db.commit()
        db.refresh(user)
    
    except HTTPException:
        raise
    except Exception as ex:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(ex))


@router.patch("/profile/password")
def update_password(data: PasswordRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(
            User.id == data.user_id
        ).first()

        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

        user.password = data.password
        db.commit()
        db.refresh(user)
    
    except HTTPException:
        raise
    except Exception as ex:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(ex))


@router.post("/profile/saved-results")
def saved_results(data: DefaultRequest, db: Session = Depends(get_db)):
    try:
        latest_per_video = (
            db.query(
                DetectionLog.video_id.label("video_id"),
                func.max(DetectionLog.detected_at).label("last_detected_at"),
            )
            .group_by(DetectionLog.video_id)
            .subquery()
        )

        rows = (
            db.query(Video, Bookmark, latest_per_video.c.last_detected_at)
            .join(Bookmark, Bookmark.video_id == Video.id)
            .outerjoin(latest_per_video, latest_per_video.c.video_id == Video.id)
            .filter(Bookmark.user_id == data.user_id)
            .order_by(Bookmark.created_at.desc())
            .all()
        )

        true_results = []
        false_results = []

        for video, bookmark, last_detected_at in rows:
            item = {
                "video_id": video.id,
                "ai_probability": video.ai_probability,
                "is_ai_generated": video.is_ai_generated,
                "title": video.title,
                "thumbnail_url": video.thumbnail,
                "url": video.url,
                "keywords": video.keyword,
                "bookmark_date": bookmark.created_at,
                "date": last_detected_at,
                "is_bookmarked": True,
            }

            if video.is_ai_generated:
                true_results.append(item)
            else:
                false_results.append(item)

        return {
            "true_count": len(true_results),
            "true_results": true_results,
            "false_count": len(false_results),
            "false_results": false_results,
        }

    except HTTPException:
        raise
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))


@router.post("/profile/detect-count")
def get_percentile(data: DefaultRequest, db: Session = Depends(get_db)):
    try:
        counts = (
            db.query(
                DetectionLog.user_id,
                func.count(DetectionLog.id).label("count")
            )
            .group_by(DetectionLog.user_id)
            .all()
        )

        if not counts:
            return {"count": 0, "top_percent": 100}

        my_count = next((c.count for c in counts if c.user_id == data.user_id), 0)
        total_users = len(counts)

        lower_count = sum(1 for c in counts if c.count < my_count)

        # 백분위 계산
        percentile_rank = (lower_count / total_users) * 100
        top_percent = round(100 - percentile_rank, 1)

        return {
            "count": my_count,
            "top_percent": top_percent,
        }

    except HTTPException:
        raise
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))