from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime,
    ForeignKey, UniqueConstraint, func
)
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    """회원 정보 테이블"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    detection_logs = relationship("DetectionLog", back_populates="user")
    bookmarks = relationship("Bookmark", back_populates="user")


class Video(Base):
    """영상 테이블"""

    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    url = Column(Text, nullable=False)
    keyword = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    thumbnail = Column(String(255), nullable=True)

    detection_logs = relationship("DetectionLog", back_populates="video")
    

class DetectionLog(Base):
    """영상 AI 판독 기록 테이블"""

    __tablename__ = "detection_logs"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    ai_probability = Column(Float, nullable=False)
    is_ai_generated = Column(Boolean, nullable=False)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    # is_bookmarked 컬럼 제거 -> bookmarks 테이블로 분리

    video = relationship("Video", back_populates="detection_logs")
    user = relationship("User", back_populates="detection_logs")
    bookmark = relationship("Bookmark", back_populates="detection_log", uselist=False)


class Bookmark(Base):
    """북마크 테이블"""

    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    detection_id = Column(Integer, ForeignKey("detection_logs.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    detection_log = relationship("DetectionLog", back_populates="bookmark")
    user = relationship("User", back_populates="bookmarks")

    __table_args__ = (
        UniqueConstraint("user_id", "detection_id", name="uq_user_detection_bookmark"),
    )