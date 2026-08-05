//임시 데이터
export const mockUser = {
  nickname: '아이즈온',
  email: 'aizeon@email.com',
  password: '12345678',
  avatarUrl: null,
  stats: {
    totalJudgements: 18,
    aiDetected: 13,
    realConfirmed: 5,
  },
};

// aiScore에 따라 label과 description을 자동 생성해주는 공통 변환 함수
export const getAiJudgement = (aiScore) => {
  const isAi = aiScore >= 50;
  return {
    label: isAi ? 'AI' : 'Real',
    description: isAi
      ? '이 숏폼은 AI가 생성했을 확률이 높아요'
      : '이 숏폼은 AI가 생성했을 확률이 낮아요',
  };
};

export const mockRecentResults = [
  {
    id: 'r1',
    thumbnail: 'https://picsum.photos/seed/strawberry/300/400',
    label: 'AI',
    aiScore: 98,
    url: 'instagram.com/reel/abc',
    title: '가면을 쓴 딸기1',
    keywords: ['딸기', '캐릭터'],
    date: '2026.01.04',
    description: '이 숏폼은 AI가 생성했을 확률이 높아요',
    count: 2847,
    saved: true,
    
  },
  {
    id: 'r2',
    thumbnail: 'https://picsum.photos/seed/namsan/300/400',
    label: 'Real',
    aiScore: 11,
    url: 'instagram.com/reel/abc',
    title: '남산타워 야경1',
    keywords: ['남산타워', '서울', '풍경'],
    date: '2026.02.06',
    description: '이 숏폼은 AI가 생성했을 확률이 낮아요',
    count: 1234,
    saved: true,
    
  },
  {
    id: 'r3',
    thumbnail: 'https://picsum.photos/seed/girl/300/400',
    label: 'AI',
    aiScore: 85,
    url: 'instagram.com/reel/abc',
    title: '고양이 소녀1',
    keywords: ['여자', '고양이'],
    date: '2026.03.02',
    description: '이 숏폼은 AI가 생성했을 확률이 높아요',
    count: 1963,
    saved: false,
    
  },
];

export const mockAnalysisResult = {
  id: 'analysis-1',
  thumbnail: 'https://picsum.photos/seed/strawberry/300/400',
  label: 'AI',
  aiScore: 97,
  url: 'instagram.com/reel/abc123xyz',
  title: '가면을 쓴 딸기2',
  keywords: ['딸기', '캐릭터'],
  date: '2026.04.04',
  description: '이 숏폼은 AI가 생성했을 확률이 높아요',
  count: 2847,
  saved: true,
 
};

export const mockAnalysisSteps = [
  { key: 'download', label: '영상 다운로드 완료', done: true },
  { key: 'data', label: '데이터 분석', done: true },
  { key: 'ai', label: 'AI 패턴 분석 중...', done: false },
];

export const mockRanking = [
  {
    id: 'rank1',
    thumbnail: 'https://picsum.photos/seed/strawberry/300/400',
    label: 'AI',
    aiScore: 95,
    url: 'instagram.com/reel/abc123...',
    title: '가면을 쓴 딸기3',
    keywords: ['딸기', '캐릭터'],
    date: '2026.05.04',
    description: '이 숏폼은 AI가 생성했을 확률이 높아요',
    count: 2847,
    saved: true,
    rank: 1,
  },
  {
    id: 'rank2',
    thumbnail: 'https://picsum.photos/seed/catgirl/300/400',
    label: 'AI',
    aiScore: 85,
    url: 'tiktok.com/@creator/vid',
    title: '고양이 소녀2',
    keywords: ['여자', '고양이'],
    date: '2026.06.02',
    description: '이 숏폼은 AI가 생성했을 확률이 높아요',
    count: 1963,
    saved: false,
    rank: 2,
  },
  {
    id: 'rank3',
    thumbnail: 'https://picsum.photos/seed/namsan/300/400',
    label: 'Real',
    aiScore: 11,
    url: 'instagram.com/reel/abc123...',
    title: '남산타워 야경2',
    keywords: ['남산타워', '서울', '풍경'],
    date: '2026.07.03',
    description: '이 숏폼은 AI가 생성했을 확률이 낮아요',
    count: 1234,
    saved: true,
    rank: 3,
  },
  {
    id: 'rank4',
    thumbnail: 'https://picsum.photos/seed/monalisa1/300/400',
    label: 'AI',
    aiScore: 92,
    url: 'tiktok.com/@user2/vid',
    title: '모나리자 AI 버전',
    keywords: ['모나리자', '얼굴'],
    date: '2026.08.28',
    description: '이 숏폼은 AI가 생성했을 확률이 높아요',
    count: 1023,
    saved: false,
    rank: 4,
  },
  {
    id: 'rank5',
    thumbnail: 'https://picsum.photos/seed/monalisa2/300/400',
    label: 'Real',
    aiScore: 8,
    url: 'instagram.com/reel/abc123...',
    title: '모나리자 실사본',
    keywords: ['모나리자', '얼굴'],
    date: '2026.09.25',
    description: '이 숏폼은 AI가 생성했을 확률이 낮아요',
    count: 536,
    saved: false,
    rank: 5,
  },
];

export const mockHistoryAI = Array.from({ length: 13 }).map((_, i) => ({
  id: `hist-ai-${i}`,
  thumbnail: 'https://picsum.photos/seed/strawberry/300/400',
  label: 'AI',
  aiScore: 90,
  url: 'instagram.com/reel/abc',
  title: '가면을 쓴 딸기4',
  keywords: ['딸기', '캐릭터'],
  date: '2026.10.25',
  description: '이 숏폼은 AI가 생성했을 확률이 높아요',
  count: 2847,
  saved: i < 2,
}));

export const mockHistoryReal = Array.from({ length: 5 }).map((_, i) => ({
  id: `hist-real-${i}`,
  thumbnail: 'https://picsum.photos/seed/namsan/300/400',
  label: 'Real',
  aiScore: 11,
  url: 'instagram.com/reel/abc',
  title: '남산타워 야경3',
  keywords: ['남산타워', '서울', '풍경'],
  date: '2026.11.25',
  description: '이 숏폼은 AI가 생성했을 확률이 낮아요',
  count: 1234,
  saved: true,
}));

export const mockSavedAI = Array.from({ length: 2 }).map((_, i) => ({
  id: `saved-ai-${i}`,
  thumbnail: 'https://picsum.photos/seed/strawberry/300/400',
  label: 'AI',
  aiScore: 92,
  url: 'instagram.com/reel/abc',
  title: '가면을 쓴 딸기5',
  keywords: ['딸기', '캐릭터'],
  date: '2026.12.25',
  description: '이 숏폼은 AI가 생성했을 확률이 높아요',
  count: 2847,
  saved: true,
}));

export const mockSavedReal = Array.from({ length: 5 }).map((_, i) => ({
  id: `saved-real-${i}`,
  thumbnail: 'https://picsum.photos/seed/namsan/300/400',
  label: 'Real',
  aiScore: 11,
  url: 'instagram.com/reel/abc',
  title: '남산타워 야경4',
  keywords: ['남산타워', '서울', '풍경'],
  date: '2026.12.30',
  description: '이 숏폼은 AI가 생성했을 확률이 낮아요',
  count: 1234,
  saved: true,
}));