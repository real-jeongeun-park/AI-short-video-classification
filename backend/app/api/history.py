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
        # 1. 닉네임으로 유저 찾기
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

        # 2. 유저의 전체 분석 기록 통계(summary) 구하기
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

        # 통계 계산
        ai_count = sum(1 for log in total_logs if log.is_ai_generated == True)
        real_count = sum(1 for log in total_logs if log.is_ai_generated == False)
        total_count = len(total_logs)

        # 3. 탭(type) 및 정렬(sort) 조건에 맞게 데이터 가져오기 (JOIN 사용)
        query = db.query(
            DetectionLog.id.label("log_id"),
            Video.title,
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

        # 탭(type) 필터링 적용
        if data.api_sort == "AI":
            query = query.filter(DetectionLog.is_ai_generated == True)
        elif data.api_sort == "REAL":
            query = query.filter(DetectionLog.is_ai_generated == False)

        # 정렬(sort) 조건 적용
        if data.api_sort == "LATEST":
            query = query.order_by(desc(DetectionLog.detected_at))
        elif data.api_sort == "PROBABILITY":
            if data.api_sort == "AI":
                query = query.order_by(desc(DetectionLog.ai_probability))
            elif data.api_sort == "REAL":
                query = query.order_by(asc(DetectionLog.ai_probability))

        # 최종 데이터 추출
        logs = query.all()

        # 4. 명세서 형식에 맞게 데이터 가공하기
        history_list = []
        for log in logs:
            history_list.append({
                "log_id": log.log_id,
                "title": log.title,
                "thumbnail_url": "https://dummy-image-url.com/thumb.jpg",
                "result_type": "AI" if log.is_ai_generated else "REAL",
                "ai_probability": round(log.ai_probability * 100, 1),
                "is_saved": log.bookmark_id is not None,   
                "created_at": log.detected_at.strftime("%Y-%m-%dT%H:%M:%SZ") if log.detected_at else None
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