from datetime import datetime
from typing import Optional, Any, List

from pydantic import BaseModel, ConfigDict


class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None


class ItemCreate(ItemBase):
    pass


class ItemOut(ItemBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BaseResponse(BaseModel):
    isSuccess: bool
    code: str
    message: str
    result: Optional[Any] = None

class SignupRequest(BaseModel):
    email: str
    nickname: str
    password: str
    password_confirm: str

class SignupResult(BaseModel):
    user_id: int
    nickname: str
    email: str
    created_at: str

class LoginRequest(BaseModel):
    nickname: str
    password: str

class LoginResult(BaseModel):
    user_id: int
    nickname: str
    email: str

# [수정] 분석 요청 스키마 (video_url과 nickname 필수)
class AnalysisRequest(BaseModel):
    video_url: str
    nickname: str

# [수정] 분석 결과 응답 스키마
class AnalysisResult(BaseModel):
    log_id: int
    video_id: int
    title: str
    video_url: str
    thumbnail_url: str
    result_type: str
    ai_probability: float
    keywords: List[str]
    is_saved: bool
    created_at: str

# [수정] 결과 저장 요청 스키마
class SaveResultRequest(BaseModel):
    log_id: int
    nickname: str

# [수정] 결과 저장 응답 스키마
class SaveResultResponse(BaseModel):
    is_saved: bool

# 인기 판별 랭킹 조회
class RankingItem(BaseModel):
    rank: int
    log_id: int
    title: str
    url: str               
    date: Optional[str] = None
    thumbnail_url: str
    analysis_count: int
    result_type: str
    ai_probability: float
    keywords: List[str]

class RankingResult(BaseModel):
    rankings: List[RankingItem]
    total_count: int

class RankingResponse(BaseResponse):
    result: RankingResult

# 내가 분석한 기록 목록 조회
class HistorySummary(BaseModel):
    ai_count: int
    real_count: int
    total_count: int

class HistoryItem(BaseModel):
    log_id: int
    title: str
    url: str
    thumbnail_url: str
    result_type: str
    ai_probability: float
    is_saved: bool
    created_at: datetime

class HistoryResult(BaseModel):
    summary: HistorySummary
    history: List[HistoryItem]

class HistoryResponse(BaseResponse):
    result: HistoryResult

# [수정] 저장된 결과 요약 스키마
class SavedSummary(BaseModel):
    ai_count: int
    real_count: int

# [수정] 저장된 결과 모아보기 응답 스키마
class SavedListResponse(BaseModel):
    summary: SavedSummary
    saved_list: List[HistoryItem]

# [수정] 프로필 대시보드 통계 스키마
class UserStats(BaseModel):
    total_analyzed_count: int
    top_percentage: float

# [수정] 프로필 정보 조회 응답 스키마
class UserProfileResult(BaseModel):
    user_id: int
    nickname: str
    email: str
    profile_image_url: str
    stats: UserStats

# [수정] 프로필 정보 수정 요청 스키마
class UpdateProfileRequest(BaseModel):
    target_nickname: str
    nickname: str
    email: str
    profile_image_url: str
    current_password: str
    new_password: str

# [수정] 프로필 정보 수정 응답 스키마
class UpdateProfileResult(BaseModel):
    user_id: int
    nickname: str
    email: str
    profile_image_url: str
    created_at: str