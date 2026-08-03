from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal # DB 세션 불러오기
from app.models import User
from app.schemas import (
    BaseResponse, 
    SignupRequest, SignupResult, 
    LoginRequest, LoginResult
)
from app.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/v1/auth", tags=["AUTH"])

# DB에 접속하기 위한 연결 통로 제공 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. 회원가입 API
@router.post("/signup", response_model=BaseResponse)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    # 1. 중복 이메일/닉네임 검사
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        return BaseResponse(isSuccess=False, code="AUTH400", message="이미 가입된 이메일입니다.")
    
    existing_nickname = db.query(User).filter(User.nickname == request.nickname).first()
    if existing_nickname:
        return BaseResponse(isSuccess=False, code="AUTH400", message="이미 사용 중인 닉네임입니다.")

    # 2. 비밀번호 일치 확인
    if request.password != request.password_confirm:
        return BaseResponse(isSuccess=False, code="AUTH400", message="비밀번호가 일치하지 않습니다.")

    # 3. 비밀번호 암호화 및 DB 저장
    hashed_pw = get_password_hash(request.password)
    new_user = User(
        nickname=request.nickname,
        email=request.email,
        password=hashed_pw
    )
    db.add(new_user)
    db.commit()      # DB에 확정 저장
    db.refresh(new_user) # 저장된 DB 정보(id, created_at 등)를 새로고침해서 가져옴

    # 4. 성공 응답 반환
    result_data = SignupResult(
        user_id=new_user.id,
        nickname=new_user.nickname,
        email=new_user.email,
        created_at=new_user.created_at.strftime("%Y-%m-%dT%H:%M:%SZ") if new_user.created_at else ""
    )
    
    return BaseResponse(isSuccess=True, code="COMMON200", message="회원가입에 성공했습니다.", result=result_data)


# 2. 로그인 API
@router.post("/login", response_model=BaseResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # 1. 유저 조회
    user = db.query(User).filter(User.email == request.email).first()
    
    # 2. 유저가 없거나 비밀번호가 틀린 경우
    if not user or not verify_password(request.password, user.password):
        return BaseResponse(isSuccess=False, code="AUTH401", message="이메일 또는 비밀번호가 올바르지 않습니다.")
    
    # 3. 로그인 성공 시 JWT 토큰(방문증) 발급
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    
    result_data = LoginResult(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        nickname=user.nickname
    )
    
    return BaseResponse(isSuccess=True, code="COMMON200", message="로그인에 성공했습니다.", result=result_data)

#  로그아웃 API
@router.post("/logout", response_model=BaseResponse)
def logout():
    # JWT 방식에서 로그아웃은 프론트엔드가 보관 중인 토큰을 삭제하는 것으로 처리합니다.
    return BaseResponse(isSuccess=True, code="COMMON200", message="로그아웃에 성공했습니다.", result=None)