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

@router.patch("/users/nickname")
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


@router.patch("/users/email")
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


@router.patch("/users/password")
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



@router.post("/users/saved-results")
def saved_results(data: DefaultRequest, db: Session = Depends(get_db)):
    try:
        rows = (
            db.query(DetectionLog, Video, Bookmark)
            .join(Video, DetectionLog.video_id == Video.id)
            .join(Bookmark, Bookmark.detection_id == DetectionLog.id)
            .filter(
                DetectionLog.user_id == data.user_id,
                Bookmark.user_id == data.user_id,
            )
            .order_by(DetectionLog.detected_at.desc())
            .all()
        )

        true_results = []
        false_results = []

        for log, video, bookmark in rows:
            item = {
                "log_id": log.id,
                "video_id": video.id,
                "ai_probability": log.ai_probability,
                "is_ai_generated": log.is_ai_generated,
                "title": video.title,
                "url": video.url,
                "date": log.detected_at,
                "is_bookmarked": True,   # 이 쿼리에 나온 건 전부 북마크된 것
            }

            if log.is_ai_generated:
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
                "url": video.url,
                "ai_probability": log.ai_probability,
                "is_ai_generated": log.is_ai_generated,
                "title": video.title,
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
    

@router.post("/users/detect-count")
def get_percentile(data: DefaultRequest, db: Session = Depends(get_db)):
    try:
        # 유저별 판정 건수 집계
        counts = (
            db.query(
                DetectionLog.user_id,
                func.count(DetectionLog.id).label("count")
            )
            .group_by(DetectionLog.user_id)
            .all()
        )

        if not counts:
            return {"detect_count": 0, "percentile": 100}

        my_count = next((c.count for c in counts if c.user_id == data.user_id), 0)
        total_users = len(counts)

        # 나보다 판정 수가 적은 사람 수
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