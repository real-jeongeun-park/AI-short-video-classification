# 👁️ AI's On

AI's On은 인터넷 동영상의 AI 생성 여부를 판별하는 앱 서비스입니다.

## 🔥 Commit Convention 

- `Feat`: 새로운 기능을 추가한 경우
- `Fix`: 버그를 수정한 경우
- `Design`: CSS 등 사용자 UI 디자인을 변경한 경우
- `Docs`: 문서(README 등)를 수정한 경우
- `Style`: 코드 포맷 변경, 세미콜론 누락 등 기능 변경이 없는 경우
- `Refactor`: 코드를 리팩토링한 경우
- `Test`: 테스트 코드를 추가하거나 수정한 경우
- `Comment`: 주석을 추가하거나 변경한 경우
- `Chore`: 빌드 설정, 패키지 매니저 설정 등 기타 변경사항
- `Remove`: 파일 또는 코드를 삭제한 경우
- `Rename`: 파일 또는 폴더명을 수정하거나 이동한 경우
- `!HOTFIX`: 치명적인 버그를 긴급하게 수정한 경우
- `!BREAKING CHANGE`: 커다란 API 변경이 있는 경우

## 🚀 실행 방법

### 1단계 — 레포지토리 clone

```bash
git clone https://github.com/real-jeongeun-park/AI-short-video-classification
```

### 2단계 — Docker 컨테이너 빌드 및 실행

```bash
cd backend
docker compose up --build
```

> Docker Desktop이 실행 중인 상태여야 합니다.

### 3단계 — 백엔드 서버 실행 (터미널 1)

```bash
cd backend
uvicorn app.main:app --reload
```

### 4단계 — ngrok 터널 연결 (터미널 2)

```bash
ngrok http --domain={your-domain} 8000
```

> `{your-domain}` 부분은 본인의 ngrok 고정 도메인으로 교체하세요.

### 5단계 — 프론트엔드 실행 (터미널 3)

```bash
cd frontend
npx expo start --tunnel
```

> Expo Go 앱으로 QR코드를 스캔하면 앱이 실행됩니다.
