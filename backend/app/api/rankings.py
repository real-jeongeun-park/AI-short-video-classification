from fastapi import APIRouter, Query, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from pydantic import BaseModel, Field
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

from app.database import get_db
from app.models import Video, DetectionLog

router = APIRouter()

class RankingRequest(BaseModel):
    filter: str = Field(default="ALL")
    keyword: Optional[str] = Field(default=None)
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=99999, ge=1)

@router.post("")
def get_popular_rankings(data: RankingRequest, db: Session = Depends(get_db)):
    # 1. 필터 값 검증
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

    # 2. DB에서는 그룹화하지 않고 일단 전체 데이터를 가져옵니다.
    query = db.query(
        DetectionLog.id.label("log_id"),
        Video.title,
        Video.url,
        Video.keyword,
        Video.thumbnail,
        DetectionLog.is_ai_generated,
        DetectionLog.ai_probability,
        DetectionLog.detected_at
    ).select_from(Video).join(DetectionLog, DetectionLog.video_id == Video.id)

    # 3. 검색 키워드 필터 적용
    if data.keyword:
        query = query.filter(
            (Video.title.ilike(f"%{data.keyword}%")) | (Video.keyword.ilike(f"%{data.keyword}%"))
        )

    all_logs = query.all()

    # 4. 🌟 [가장 안전한 핵심 로직] 영상 '제목' + '순수 URL(공유 꼬리표 제거)' 조합으로 묶기!
    grouped_dict = {}
    for log in all_logs:
        raw_url = str(log.url).strip()
        
        # 🌟 [궁극의 안전 로직] URL을 정교하게 해체해서 불필요한 꼬리표만 제거
        parsed_url = urlparse(raw_url)
        query_params = parse_qsl(parsed_url.query)
        
        # 'si'(유튜브 공유), 'igsh'(인스타 공유) 같은 쓰레기 파라미터만 버리고 v= 같은 핵심 ID는 보존!
        safe_params = [(k, v) for k, v in query_params if k.lower() not in ['si', 'igsh', 'utm_source']]
        new_query = urlencode(safe_params)
        
        # 깔끔해진 URL 재조립 (www. 도 제거해서 완벽 통일)
        cleaned_url = urlunparse((
            parsed_url.scheme, 
            parsed_url.netloc.replace("www.", ""), 
            parsed_url.path, 
            parsed_url.params, 
            new_query, 
            parsed_url.fragment
        ))
        
        safe_title = str(log.title).strip() if log.title else "UnknownTitle"
        
        # "제목 + 정교하게 다듬어진 URL" 조합으로 완벽한 고유 키 생성
        core_key = f"{safe_title}||{cleaned_url}"
        
        if core_key not in grouped_dict:
            grouped_dict[core_key] = {
                "log_id": log.log_id,
                "title": log.title,
                "url": raw_url,
                "keyword": log.keyword,
                "thumbnail": log.thumbnail,
                "analysis_count": 0,
                "ai_true_count": 0,
                "ai_probability": log.ai_probability,
                "detected_at": log.detected_at
            }
        
        grouped_dict[core_key]["analysis_count"] += 1
        
        if log.is_ai_generated:
            grouped_dict[core_key]["ai_true_count"] += 1

        if log.detected_at and grouped_dict[core_key]["detected_at"]:
            if log.detected_at > grouped_dict[core_key]["detected_at"]:
                grouped_dict[core_key]["detected_at"] = log.detected_at
                grouped_dict[core_key]["ai_probability"] = log.ai_probability
                grouped_dict[core_key]["log_id"] = log.log_id

    # 5. 딕셔너리를 리스트로 변환하면서 AI/REAL 필터 적용
    merged_list = []
    for key, item in grouped_dict.items():
        is_ai = item["ai_true_count"] > 0
        
        if data.filter == "AI" and not is_ai:
            continue
        if data.filter == "REAL" and is_ai:
            continue
            
        merged_list.append({
            "log_id": item["log_id"],
            "title": item["title"],
            "url": item["url"],
            "keyword": item["keyword"],
            "thumbnail": item["thumbnail"],
            "analysis_count": item["analysis_count"],
            "is_ai_generated": is_ai,
            "ai_probability": item["ai_probability"],
            "detected_at": item["detected_at"]
        })

    # 6. 판별 횟수가 높은 순으로 내림차순 정렬 (횟수가 같으면 최신순)
    merged_list.sort(key=lambda x: (x["analysis_count"], x["detected_at"].isoformat() if x["detected_at"] else ""), reverse=True)

    # 7. 전체 목록(merged_list)을 그대로 사용
    total_count = len(merged_list)

    # 8. 프론트엔드 명세서 규격에 맞게 최종 가공
    rankings_result = []
    for index, item in enumerate(merged_list):
        rankings_result.append({
            "rank": index + 1,
            "log_id": item["log_id"],
            "title": item["title"],
            "url": item["url"],
            "date": item["detected_at"].isoformat() if item["detected_at"] else None,
            "thumbnail_url": item["thumbnail"] if item["thumbnail"] else "https://dummy-image-url.com/thumb.jpg",
            "analysis_count": item["analysis_count"],
            "result_type": "AI" if item["is_ai_generated"] else "REAL",
            "ai_probability": item["ai_probability"],
            "keywords": item["keyword"].split(",") if item["keyword"] else []
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