from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DetectionLog
from app.models import Video
from app.models import User

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

@router.post("/users/detect-count")
def login(data: DefaultRequest, db: Session = Depends(get_db)):
    try:
        count = db.query(DetectionLog).filter(
            DetectionLog.user_id == data.user_id
        ).count()

        return {
            "count": count,
        }
    
    except HTTPException:
        raise
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))
    

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
def see_saved_results(data: DefaultRequest, db: Session = Depends(get_db)):
    try:
        rows = (
            db.query(DetectionLog, Video)
            .join(Video, DetectionLog.video_id == Video.id)
            .filter(
                DetectionLog.user_id == data.user_id,
            )
            .all()
        )

        true_results = []
        false_results = []

        for log, video in rows:
            item = {
                "video_id": video.id,
                "ai_probability": log.ai_probability,
                "url": video.url,
                "date": log.detected_at,
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