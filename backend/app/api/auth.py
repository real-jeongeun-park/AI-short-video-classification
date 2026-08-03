from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/auth/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(
            User.email == data.email,
            User.password == data.password
        ).first()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="아이디 또는 비밀번호가 올바르지 않습니다."
            )

        return {
            "user_id": user.id,
            "nickname": user.nickname,
            "email": user.email
        }

    except HTTPException:
        raise
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))