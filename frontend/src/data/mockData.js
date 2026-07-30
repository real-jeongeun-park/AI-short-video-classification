//  임시 하드코딩 데이터입니다.
// 실제 AI 모델/백엔드 연동 시 이 파일의 값들을 API 응답으로 교체하세요.

export const mockUser = {
  username: '아이즈온',
  email: 'aizeon@email.com',
  password: '12345678',
  avatarUrl: null,
  stats: {
    totalJudgements: 18,
    aiDetected: 13,
    realConfirmed: 5,
  },
};

export const mockRecentResults = [
  {
    id: 'r1',
    thumbnail: 'https://picsum.photos/seed/strawberry/300/400',
    label: 'AI',
    aiScore: 98,
    url: 'instagram.com/reel/abc',
    description: '이 숏폼은 AI가 생성했을 확률이 높아요',
    evidence: [
      { key: '움직임 패턴', score: 92 },
      { key: '텍스처 분석', score: 88 },
      { key: '메타 데이터', score: 79 },
    ],
  },
  {
    id: 'r2',
    thumbnail: 'https://picsum.photos/seed/namsan/300/400',
    label: 'Real',
    aiScore: 11,
    url: 'instagram.com/reel/abc',
    description: '이 숏폼은 AI가 생성했을 확률이 낮아요',
    evidence: [
      { key: '움직임 패턴', score: 15 },
      { key: '텍스처 분석', score: 9 },
      { key: '메타 데이터', score: 12 },
    ],
  },
  {
    id: 'r3',
    thumbnail: 'https://picsum.photos/seed/girl/300/400',
    label: 'AI',
    aiScore: 85,
    url: 'instagram.com/reel/abc',
    description: '이 숏폼은 AI가 생성했을 확률이 높아요',
    evidence: [
      { key: '움직임 패턴', score: 80 },
      { key: '텍스처 분석', score: 76 },
      { key: '메타 데이터', score: 70 },
    ],
  },
];

export const mockAnalysisResult = {
  url: 'instagram.com/reel/abc123xyz',
  thumbnail: 'https://picsum.photos/seed/strawberry/300/400',
  label: 'AI', // 'AI' | 'Real'
  aiScore: 98,
  description: '이 숏폼은 AI가 생성했을 확률이 높아요',
  evidence: [
    { key: '움직임 패턴', score: 90 },
    { key: '텍스처 분석', score: 80 },
    { key: '메타 데이터', score: 75 },
  ],
};

export const mockAnalysisSteps = [
  { key: 'download', label: '영상 다운로드 완료', done: true },
  { key: 'data', label: '데이터 분석', done: true },
  { key: 'ai', label: 'AI 패턴 분석 중...', done: false },
];

export const mockRanking = [
  {
    id: 'rank1',
    rank: 1,
    thumbnail: 'https://picsum.photos/seed/strawberry/300/400',
    url: 'instagram.com/reel/abc123...',
    count: 2847,
    label: 'AI',
    tags: ['딸기', '캐릭터'],
  },
  {
    id: 'rank2',
    rank: 2,
    thumbnail: 'https://picsum.photos/seed/catgirl/300/400',
    url: 'tiktok.com/@creator/vid',
    count: 1963,
    label: 'AI',
    tags: ['여자', '고양이'],
  },
  {
    id: 'rank3',
    rank: 3,
    thumbnail: 'https://picsum.photos/seed/namsan/300/400',
    url: 'instagram.com/reel/abc123...',
    count: 1234,
    label: 'Real',
    tags: ['남산타워', '서울', '풍경'],
  },
  {
    id: 'rank4',
    rank: 4,
    thumbnail: 'https://picsum.photos/seed/monalisa1/300/400',
    url: 'tiktok.com/@user2/vid',
    count: 1023,
    label: 'AI',
    tags: ['모나리자', '얼굴'],
  },
  {
    id: 'rank5',
    rank: 5,
    thumbnail: 'https://picsum.photos/seed/monalisa2/300/400',
    url: 'instagram.com/reel/abc123...',
    count: 536,
    label: 'Real',
    tags: ['모나리자', '얼굴'],
  },
];

export const mockHistoryAI = Array.from({ length: 13 }).map((_, i) => ({
  id: `hist-ai-${i}`,
  thumbnail: 'https://picsum.photos/seed/strawberry/300/400',
  aiScore: 98,
  url: 'instagram.com/reel/abc',
  date: '2026.06.25',
  saved: i < 2,
}));

export const mockHistoryReal = Array.from({ length: 5 }).map((_, i) => ({
  id: `hist-real-${i}`,
  thumbnail: 'https://picsum.photos/seed/namsan/300/400',
  aiScore: 11,
  url: 'instagram.com/reel/abc',
  date: '2026.06.25',
  saved: true,
}));

export const mockSavedAI = Array.from({ length: 2 }).map((_, i) => ({
  id: `saved-ai-${i}`,
  thumbnail: 'https://picsum.photos/seed/strawberry/300/400',
  aiScore: 98,
  url: 'instagram.com/reel/abc',
  date: '2026.06.25',
}));

export const mockSavedReal = Array.from({ length: 5 }).map((_, i) => ({
  id: `saved-real-${i}`,
  thumbnail: 'https://picsum.photos/seed/namsan/300/400',
  aiScore: 11,
  url: 'instagram.com/reel/abc',
  date: '2026.06.25',
}));
