from fastapi import APIRouter, Query, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func
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

        # 이 유저가 분석한 기록이 하나라도 있는지 먼저 확인
        has_any_log = db.query(DetectionLog.id).filter(DetectionLog.user_id == user.id).first()
        if not has_any_log:
            return JSONResponse(
                status_code=404,
                content={
                    "isSuccess": False,
                    "code": "HIST404_01",
                    "message": "분석 기록이 존재하지 않습니다.",
                    "result": None
                }
            )

        # 이 유저가 분석한 적 있는 video_id 목록 (같은 영상 여러 번 분석해도 1개로 묶임)
        user_video_ids_subq = (
            db.query(DetectionLog.video_id.label("video_id"))
            .filter(DetectionLog.user_id == user.id)
            .distinct()
            .subquery()
        )

        # 전체 유저 기준, video별 가장 최근 detected_at
        global_latest_subq = (
            db.query(
                DetectionLog.video_id.label("video_id"),
                func.max(DetectionLog.detected_at).label("global_latest"),
            )
            .group_by(DetectionLog.video_id)
            .subquery()
        )

        # 로그인한 유저 기준, video별 가장 최근 detected_at
        user_latest_subq = (
            db.query(
                DetectionLog.video_id.label("video_id"),
                func.max(DetectionLog.detected_at).label("user_latest"),
            )
            .filter(DetectionLog.user_id == user.id)
            .group_by(DetectionLog.video_id)
            .subquery()
        )

        query = (
            db.query(
                Video,
                global_latest_subq.c.global_latest,
                user_latest_subq.c.user_latest,
                Bookmark.id.label("bookmark_id"),
            )
            .join(user_video_ids_subq, user_video_ids_subq.c.video_id == Video.id)
            .outerjoin(global_latest_subq, global_latest_subq.c.video_id == Video.id)
            .outerjoin(user_latest_subq, user_latest_subq.c.video_id == Video.id)
            .outerjoin(
                Bookmark,
                (Bookmark.video_id == Video.id) & (Bookmark.user_id == user.id)
            )
        )

        if data.api_type == "AI":
            query = query.filter(Video.is_ai_generated == True)
        elif data.api_type == "REAL":
            query = query.filter(Video.is_ai_generated == False)

        if data.api_sort == "LATEST":
            query = query.order_by(desc(user_latest_subq.c.user_latest))
        elif data.api_sort == "PROBABILITY":
            # AI는 확률 높은 순(내림차순), REAL은 확률 낮은 순(오름차순)으로 정렬
            if data.api_type == "AI":
                query = query.order_by(desc(Video.ai_probability))
            elif data.api_type == "REAL":
                query = query.order_by(asc(Video.ai_probability))

        rows = query.all()

        history_list = []
        for video, global_latest, user_latest, bookmark_id in rows:
            history_list.append({
                "video_id": video.id,
                "title": video.title,
                "url": video.url,
                "thumbnail_url": video.thumbnail if video.thumbnail else "https://dummy-image-url.com/thumb.jpg",
                "result_type": "AI" if video.is_ai_generated else "REAL",
                "ai_probability": round(video.ai_probability * 100, 1),
                "is_saved": bookmark_id is not None,
                "date": global_latest if global_latest else None,
                "user_date": user_latest if user_latest else None,
                "keywords": video.keyword
            })

        # 요약 통계는 필터와 무관하게, 이 유저가 분석한 전체 distinct 영상 기준
        summary_rows = (
            db.query(Video.is_ai_generated)
            .join(user_video_ids_subq, user_video_ids_subq.c.video_id == Video.id)
            .all()
        )
        ai_count = sum(1 for (is_ai,) in summary_rows if is_ai)
        real_count = sum(1 for (is_ai,) in summary_rows if not is_ai)
        total_count = len(summary_rows)

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