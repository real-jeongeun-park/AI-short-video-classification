import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.database import engine, Base
import app.models  # 이 import가 있어야 Base가 모든 테이블을 인식함

from app.routers import auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    """서버 시작 시 테이블 자동 생성 (없으면 만들고, 있으면 그냥 넘어감)"""
    Base.metadata.create_all(bind=engine)
    print("✅ DB 테이블 준비 완료")
    yield  # ← 여기서 서버가 실행됨


app = FastAPI(title="Aizeon API", lifespan=lifespan)

app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "FastAPI is running!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)