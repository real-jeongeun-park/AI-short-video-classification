from fastapi import APIRouter, Query, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional

from app.database import get_db
from app.models import Video, DetectionLog 
from app.schemas import RankingResponse
router = APIRouter()

@router.get("/api/v1/rankings", response_model=RankingResponse)
def get_popular_rankings(
    filter: str = Query("ALL", description="필터: ALL | AI | REAL"),
    keyword: Optional[str] = Query(None, description="검색 키워드"),
    page: int = Query(1, description="페이지 번호", ge=1),
    limit: int = Query(10, description="조회 개수", ge=1),
    db: Session = Depends(get_db)
):
    # 1. 필터 값 검증 (400 에러 처리)
    valid_filters = ["ALL", "AI", "REAL"]
    if filter not in valid_filters:
        return JSONResponse(
            status_code=400,
            content={
                "isSuccess": False,
                "code": "RANK400_01",
                "message": "올바르지 않은 필터 파라미터 값입니다.",
                "result": None
            }
        )

    # 2. DB 쿼리 시작 (Video와 DetectionLog 조인 및 그룹화)
    # 영상을 기준으로 판독 기록 개수(analysis_count)를 세기
    query = db.query(
        DetectionLog.id.label("log_id"),
        Video.title,
        Video.url,
        Video.keyword,
        func.count(DetectionLog.id).over(partition_by=Video.id).label("analysis_count"),
        DetectionLog.is_ai_generated,
        DetectionLog.ai_probability,
        DetectionLog.detected_at
    ).join(Video, DetectionLog.video_id == Video.id)

    # 3. 필터 조건 적용 (is_ai_generated: True/False)
    if filter == "AI":
        query = query.filter(DetectionLog.is_ai_generated == True)
    elif filter == "REAL":
        query = query.filter(DetectionLog.is_ai_generated == False)

    # 4. 검색 키워드 조건 적용
    if keyword:
        query = query.filter(
            (Video.title.ilike(f"%{keyword}%")) | (Video.keyword.ilike(f"%{keyword}%"))
        )
    # 5. 전체 데이터 개수 구하기
    total_count = query.count()

    # 6. 정렬(분석 많은 순) 및 페이징 처리
    logs = (query.order_by(desc("analysis_count"))
                 .offset((page - 1) * limit)
                 .limit(limit)
                 .all())

    # 7. 조회된 데이터를 명세서 형식에 맞게 가공
    rankings_list = []
    for index, log in enumerate(logs):
        rankings_list.append({
            "rank": ((page - 1) * limit) + (index + 1),
            "log_id": log.log_id,
            "title": log.title,
            "url": log.url,                    
            "date": log.detected_at.isoformat() if log.detected_at else None, 
            "thumbnail_url": "https://dummy-image-url.com/thumb.jpg",
            "analysis_count": log.analysis_count,
            "result_type": "AI" if log.is_ai_generated else "REAL",
            "ai_probability": log.ai_probability, 
            "keywords": log.keyword.split(",") if log.keyword else []
        })

    return {
        "isSuccess": True,
        "code": "COMMON200",
        "message": "요청에 성공했습니다.",
        "result": {
            "rankings": rankings_list,
            "total_count": total_count
        }
    }
