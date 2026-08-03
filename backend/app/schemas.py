from datetime import datetime
from typing import Optional, Any

from pydantic import BaseModel, ConfigDict


class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None


class ItemCreate(ItemBase):
    pass


class ItemOut(ItemBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- 공통 응답 구조 ---
class BaseResponse(BaseModel):
    isSuccess: bool
    code: str
    message: str
    result: Optional[Any] = None

# --- 회원가입 ---
class SignupRequest(BaseModel):
    nickname: str
    email: str
    password: str
    password_confirm: str
    terms_accepted: bool

class SignupResult(BaseModel):
    user_id: int
    nickname: str
    email: str
    created_at: str

# --- 로그인 ---
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResult(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    nickname: str