from sqlalchemy import (
    Column, Integer, String, Text,
    DateTime, Float, Boolean, ForeignKey, func
)
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    """회원 정보 테이블"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String(50), nullable=False, unique=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password = Column(String(255), nullable=False)  # 해시된 비밀번호 저장
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 이 유저가 판독한 기록들
    detection_logs = relationship("DetectionLog", back_populates="user")


class Video(Base):
    """영상 테이블"""

    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    url = Column(Text, nullable=False)
    keyword = Column(String(255), nullable=True)   # 콤마 구분 등 자유롭게 활용
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 이 영상에 대한 판독 기록들
    detection_logs = relationship("DetectionLog", back_populates="video")


class DetectionLog(Base):
    """영상 AI 판독 기록 테이블"""

    __tablename__ = "detection_logs"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    ai_probability = Column(Float, nullable=False)   # AI 생성 확률 0.0 ~ 1.0
    is_ai_generated = Column(Boolean, nullable=False) # AI 영상 여부 (True/False)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    is_bookmarked = Column(Boolean, nullable=False, default=False)

    video = relationship("Video", back_populates="detection_logs")
    user = relationship("User", back_populates="detection_logs")