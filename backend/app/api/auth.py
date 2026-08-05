from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import (
    BaseResponse, 
    SignupRequest, SignupResult, 
    LoginRequest, LoginResult
)

router = APIRouter()

@router.post("/auth/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(User.email == data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다.")
        
        existing_nickname = db.query(User).filter(User.nickname == data.nickname).first()
        if existing_nickname:
            raise HTTPException(status_code=400, detail="이미 사용 중인 닉네임입니다.")

        if data.password != data.password_confirm:
            raise HTTPException(status_code=400, detail="비밀번호가 일치하지 않습니다.")

        new_user = User(
            nickname=data.nickname,
            email=data.email,
            password=data.password
        )
        db.add(new_user)
        db.commit()      
        db.refresh(new_user)

        return {
            "user_id": new_user.id,
            "nickname": new_user.nickname,
            "email": new_user.email,
            "created_at": new_user.created_at.strftime("%Y-%m-%dT%H:%M:%SZ") if new_user.created_at else ""
        }

    except HTTPException:
        raise
    except Exception as ex:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(ex))

    
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


@router.post("/auth/logout")
def logout():
    try:
        return {
            "message": "로그아웃에 성공했습니다."
        }
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))