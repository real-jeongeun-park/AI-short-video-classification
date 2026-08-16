# 👁️ AI's on
AI's on은 소셜미디어에 업로드된 숏폼 동영상들의 AI 생성 여부를 판독하는 앱 서비스입니다.


## 🧐 서비스 기획

<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0004" src="https://github.com/user-attachments/assets/8f30d88f-e3d1-40aa-afd4-ac08d23e210c" />
<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0005" src="https://github.com/user-attachments/assets/78f51f1e-31d4-4b30-a2bf-a6ddf92b69d5" />
<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0006" src="https://github.com/user-attachments/assets/3085d6aa-b065-47b4-b386-88bdab9ab930" />

## 📱 서비스 주요 기능 및 UI

<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0008" src="https://github.com/user-attachments/assets/c22aa0b5-1b93-4f86-9bdc-737e5365c077" />
<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0009" src="https://github.com/user-attachments/assets/f1fba3e5-98be-4747-b5d0-ea20b6dfe44e" />
<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0010" src="https://github.com/user-attachments/assets/6a55cebe-b2c5-46b9-9b9f-952044dc4b24" />
<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0011" src="https://github.com/user-attachments/assets/565a818b-a481-4395-a00d-ac490b4632cf" />

## 🧠 데이터셋 및 모델 아키텍처
<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0013" src="https://github.com/user-attachments/assets/d814fa4b-ec08-4e4e-946b-8db23ffeb794" />
<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0014" src="https://github.com/user-attachments/assets/83b72475-a9f1-480b-a93f-e25bd9d0af54" />
<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0015" src="https://github.com/user-attachments/assets/a3872b56-1dff-467b-a86d-615fb355fc87" />
<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0016" src="https://github.com/user-attachments/assets/70904dae-44e4-490d-8c4e-b3c9926f07e2" />

## ⭐ 모델 성능 비교 결과

<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0018" src="https://github.com/user-attachments/assets/1d43d98b-74b3-49a5-b112-d18e897c4a94" />
<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0019" src="https://github.com/user-attachments/assets/e0c0355f-4b71-4315-b4f1-160392b9b0c9" />
<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0020" src="https://github.com/user-attachments/assets/ece8bad8-ad5d-453d-aaf2-dd30fc42ec29" />
<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0021" src="https://github.com/user-attachments/assets/dab06266-3459-4adb-88c6-0da45a1e399c" />
<img width="1920" height="1080" alt="AI생성숏폼구별서비스_발표자료_page-0022" src="https://github.com/user-attachments/assets/55d8824f-ffed-4136-b081-27e352ad782a" />



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

