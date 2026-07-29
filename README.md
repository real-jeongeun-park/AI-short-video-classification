# 아이즈온 (AI's on) - React Native (Expo)

디자인 PDF 기반으로 만든 프론트엔드 스캐폴드입니다. **모든 데이터는 하드코딩(mock)** 되어 있으며,
`src/data/mockData.js` 파일만 수정하면 화면 전체에 반영됩니다.

## 실행 방법
```bash
npm install
npx expo start
```

## 폴더 구조
```
App.js
src/
  theme/colors.js       # 컬러/타이포/간격 토큰
  data/mockData.js       # ⭐ 하드코딩 목데이터 (모델 연동 시 여기부터 교체)
  components/            # 공용 컴포넌트 (버튼, 뱃지, 카드)
  screens/
    SplashScreen.js
    LoginScreen.js
    SignupScreen.js
    HomeScreen.js
    AnalyzingScreen.js
    ResultScreen.js
    RankingScreen.js
    HistoryScreen.js
    ProfileScreen.js
    EditProfileScreen.js
    SavedResultsScreen.js
  navigation/index.js     # Stack + Bottom Tab 네비게이션 구조
```

## 화면 흐름
- Splash → Login/Signup → Main(Bottom Tabs: 홈/랭킹/기록/프로필)
- 홈 → 링크 분석(분석중) → 분석 결과
- 프로필 → 프로필 수정 / 저장된 결과

## 모델 연동 시 할 일 (TODO 표시된 곳)
1. `HomeScreen.js`의 `handleAnalyze` — 실제 분석 API 호출 후 `Analyzing` 화면으로 이동
2. `AnalyzingScreen.js` — setTimeout 대신 polling/websocket으로 진행 상태 갱신, 완료 시 실제 결과로 `Result` 이동
3. `LoginScreen.js` / `SignupScreen.js` — 실제 인증 API 연동 및 에러 처리
4. `mockData.js` 전체 — 로그인 사용자 정보, 랭킹, 기록, 저장 결과를 서버 응답으로 교체

## 참고
- 아이콘: `@expo/vector-icons` (Feather)
- 그라데이션: `expo-linear-gradient`
- 진행률 원형 바: `react-native-progress`
- 이미지: 임시로 picsum.photos 플레이스홀더 사용 (실제 썸네일 URL로 교체 필요)
