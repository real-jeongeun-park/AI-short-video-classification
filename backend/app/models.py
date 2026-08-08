from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    detection_logs = relationship("DetectionLog", back_populates="user")
    bookmarks = relationship("Bookmark", back_populates="user")


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    url = Column(Text, nullable=False, unique=True)
    keyword = Column(String(255))
    thumbnail = Column(String(255))
    ai_probability = Column(Float, nullable=False)  # 0.0 ~ 1.0
    is_ai_generated = Column(Boolean, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    detection_logs = relationship("DetectionLog", back_populates="video")
    bookmarks = relationship("Bookmark", back_populates="video")


class DetectionLog(Base):
    __tablename__ = "detection_logs"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())

    video = relationship("Video", back_populates="detection_logs")
    user = relationship("User", back_populates="detection_logs")


class Bookmark(Base):
    __tablename__ = "bookmarks"
    __table_args__ = (
        UniqueConstraint("user_id", "video_id", name="uq_bookmark_user_video"),
    )

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    video = relationship("Video", back_populates="bookmarks")
    user = relationship("User", back_populates="bookmarks")