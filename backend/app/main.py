import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
from app.database import engine, Base
import app.models  # 이 import가 있어야 Base가 모든 테이블을 인식함
from contextlib import asynccontextmanager

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.model import router as model_router

from app.model.classifier import load_model

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

@asynccontextmanager
async def lifespan(app: FastAPI):
    """서버 시작 시 테이블 자동 생성"""
    Base.metadata.create_all(bind=engine)
    """모델 준비"""
    load_model()
    yield

app = FastAPI(title="AI's On API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # 모든 출처(도메인) 허용
    allow_methods=["*"],   # 모든 HTTP 메서드 허용 (GET, POST, PUT, DELETE 등)
    allow_headers=["*"],   # 모든 요청 헤더 허용
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(model_router)