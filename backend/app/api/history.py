from fastapi import APIRouter, Query, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
import logging

from app.database import get_db
from app.models import User, Video, DetectionLog, Bookmark

router = APIRouter()

class HistoryRequest(BaseModel):
    user_id: int
    api_type: str
    api_sort: str

@router.post("/history")
def get_history(data: HistoryRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.id == data.user_id).first()
        if not user:
            return JSONResponse(
                status_code=404,
                content={
                    "isSuccess": False,
                    "code": "HIST404_01",
                    "message": "분석 기록이 존재하지 않습니다.",
                    "result": None
                }
            )

        total_logs = db.query(DetectionLog).filter(DetectionLog.user_id == user.id).all()

        if not total_logs:
            return JSONResponse(
                status_code=404,
                content={
                    "isSuccess": False,
                    "code": "HIST404_01",
                    "message": "분석 기록이 존재하지 않습니다.",
                    "result": None
                }
            )

        ai_count = sum(1 for log in total_logs if log.is_ai_generated == True)
        real_count = sum(1 for log in total_logs if log.is_ai_generated == False)
        total_count = len(total_logs)

        query = db.query(
            DetectionLog.id.label("log_id"),
            Video.title,
            Video.url,
            Video.keyword,
            Video.thumbnail,
            DetectionLog.is_ai_generated,
            DetectionLog.ai_probability,
            DetectionLog.detected_at,
            Bookmark.id.label("bookmark_id"),
        ).join(Video, DetectionLog.video_id == Video.id)\
         .outerjoin(
             Bookmark,
             (Bookmark.detection_id == DetectionLog.id) & (Bookmark.user_id == user.id)
         )\
         .filter(DetectionLog.user_id == user.id)

        if data.api_type == "AI":
            query = query.filter(DetectionLog.is_ai_generated == True)
        elif data.api_type == "REAL":
            query = query.filter(DetectionLog.is_ai_generated == False)

        if data.api_sort == "LATEST":
            query = query.order_by(desc(DetectionLog.detected_at))
        elif data.api_sort == "PROBABILITY":
            # AI는 확률 높은 순(내림차순), REAL은 확률 낮은 순(오름차순)으로 정렬
            if data.api_type == "AI":
                query = query.order_by(desc(DetectionLog.ai_probability))
            elif data.api_type == "REAL":
                query = query.order_by(asc(DetectionLog.ai_probability))

        logs = query.all()

        history_list = []
        for log in logs:
            history_list.append({
                "log_id": log.log_id,
                "title": log.title,
                "url": log.url,
                "thumbnail_url": log.thumbnail if log.thumbnail else "https://dummy-image-url.com/thumb.jpg", 
                "result_type": "AI" if log.is_ai_generated else "REAL",
                "ai_probability": round(log.ai_probability * 100, 1),
                "is_saved": log.bookmark_id is not None,   
                "created_at": log.detected_at.isoformat() if log.detected_at else None, 
                "keywords": log.keyword.split(",") if log.keyword else [] 
            })

        return {
            "isSuccess": True,
            "code": "COMMON200",
            "message": "요청에 성공했습니다.",
            "result": {
                "summary": {
                    "ai_count": ai_count,
                    "real_count": real_count,
                    "total_count": total_count
                },
                "history": history_list
            }
        }

    except Exception as e:
        logging.error(f"Error fetching history: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "isSuccess": False,
                "code": "HIST500_01",
                "message": "분석 기록 목록을 불러오는 중 오류가 발생했습니다.",
                "result": None
            }
        )