from fastapi import APIRouter, Query, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from pydantic import BaseModel, Field

from app.database import get_db
from app.models import Video, DetectionLog

router = APIRouter()

class RankingRequest(BaseModel):
    filter: str = Field(default="ALL")
    search_text: Optional[str] = Field(default=None)
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=99999, ge=1)

@router.post("")
def get_popular_rankings(data: RankingRequest, db: Session = Depends(get_db)):
    # 필터 값 검증
    valid_filters = ["ALL", "AI", "REAL"]
    if data.filter not in valid_filters:
        return JSONResponse(
            status_code=400,
            content={
                "isSuccess": False,
                "code": "RANK400_01",
                "message": "올바르지 않은 필터 파라미터 값입니다.",
                "result": None
            }
        )

    # video별 분석 횟수(analysis_count)와 가장 최근 분석 시각(latest_detected_at)을 집계
    stats_subq = (
        db.query(
            DetectionLog.video_id.label("video_id"),
            func.count(DetectionLog.id).label("analysis_count"),
            func.max(DetectionLog.detected_at).label("latest_detected_at"),
        )
        .group_by(DetectionLog.video_id)
        .subquery()
    )

    query = (
        db.query(
            Video,
            stats_subq.c.analysis_count,
            stats_subq.c.latest_detected_at,
        )
        .join(stats_subq, stats_subq.c.video_id == Video.id)
    )

    if data.search_text:
        cleaned_search_text = data.search_text.split("?")[0]
        query = query.filter(
            Video.title.ilike(f"%{data.search_text}%")
            | Video.keyword.ilike(f"%{data.search_text}%")
            | Video.url.ilike(f"%{cleaned_search_text}%")
        )

    if data.filter == "AI":
        query = query.filter(Video.is_ai_generated == True)
    elif data.filter == "REAL":
        query = query.filter(Video.is_ai_generated == False)

    # 판별 횟수가 높은 순으로 내림차순 정렬 (횟수가 같으면 최신순)
    query = query.order_by(
        desc(stats_subq.c.analysis_count),
        desc(stats_subq.c.latest_detected_at),
    )

    rows = query.all()

    total_count = len(rows)

    rankings_result = []
    for index, (video, analysis_count, latest_detected_at) in enumerate(rows):
        rankings_result.append({
            "rank": index + 1,
            "video_id": video.id,
            "title": video.title,
            "url": video.url,
            "date": latest_detected_at,
            "thumbnail_url": video.thumbnail if video.thumbnail else "https://dummy-image-url.com/thumb.jpg",
            "analysis_count": analysis_count,
            "result_type": "AI" if video.is_ai_generated else "REAL",
            "ai_probability": video.ai_probability,
            "keywords": video.keyword.split(",") if video.keyword else []
        })

    return {
        "isSuccess": True,
        "code": "COMMON200",
        "message": "요청에 성공했습니다.",
        "result": {
            "rankings": rankings_result,
            "total_count": total_count
        }
    }