# GLOWSTUDIO 작업 지시서

> 이 파일을 Claude Code에 붙여넣고 "이 지시서대로 스프린트 순서대로 진행해줘. 각 스프린트 완료 후 반드시 보고하고 내 승인 받고 다음으로 넘어가"라고 말하세요.

---

## 전체 목표
1. 요금제(Pricing) 섹션 삭제
2. Apify API로 TikTok 실제 데이터 연동
3. 디스커버 페이지: 썸네일 → 클릭 시 영상 재생 → 분석 페이지 이동
4. 트렌드 탭 신규 추가 (뷰티/라이프스타일/Vlog 카테고리 + 인기 해시태그)

---

## Sprint 1. 요금제 섹션 삭제
**파일**: `src/App.tsx`
**작업**:
- Home 컴포넌트에서 Pricing 섹션 전체 제거 (`{/* Pricing */}` 블록)
- Footer 바로 위까지 깔끔하게 정리
- 다른 섹션(Hero, Features)은 건드리지 않기

**완료 기준**: 홈 페이지에 요금제 카드 3개가 완전히 사라진 것 확인
**→ 완료 후 보고 및 승인 대기**

---

## Sprint 2. 환경변수 및 Apify API 연동
**작업 순서**:

### 2-1. .env 파일 생성
프로젝트 루트에 `.env` 파일 생성:
```
VITE_APIFY_API_KEY=여기에_실제_키_입력
```
`.gitignore`에 `.env` 추가 (없으면 추가)

### 2-2. Apify TikTok 스크래퍼 연동
`src/api/tiktok.ts` 파일 신규 생성:

```typescript
// Apify TikTok Scraper Actor ID: clockworks/free-tiktok-scraper
const APIFY_TOKEN = import.meta.env.VITE_APIFY_API_KEY
const ACTOR_ID = 'clockworks~free-tiktok-scraper'
const BASE_URL = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items`

export async function searchTikTok(hashtag: string, limit = 12) {
  const url = `${BASE_URL}?token=${APIFY_TOKEN}&timeout=60`
  const body = {
    hashtags: [hashtag.replace(/^#/, '')],
    resultsPerPage: limit,
    maxProfilesPerQuery: 1,
    shouldDownloadVideos: false,
    shouldDownloadCovers: true,   // 썸네일 URL 가져오기
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(65000),
  })
  if (!res.ok) throw new Error(`Apify error ${res.status}`)
  const items = await res.json()
  // Apify 응답을 기존 Video 인터페이스 형식으로 변환
  return items.map((item: any) => ({
    id: item.id,
    text: item.text || item.desc || '',
    authorMeta: { name: item.authorMeta?.name || item.author?.uniqueId || 'unknown', avatar: item.authorMeta?.avatar },
    videoMeta: {
      duration: item.videoMeta?.duration || item.video?.duration || 0,
      coverUrl: item.videoMeta?.coverUrl || item.covers?.default || item.video?.cover || '',
    },
    playCount: item.playCount || item.stats?.playCount || 0,
    diggCount: item.diggCount || item.stats?.diggCount || 0,
    commentCount: item.commentCount || item.stats?.commentCount || 0,
    shareCount: item.shareCount || item.stats?.shareCount || 0,
    webVideoUrl: item.webVideoUrl || `https://www.tiktok.com/@${item.authorMeta?.name}/video/${item.id}`,
  }))
}

export async function getTrends(category: 'beauty' | 'lifestyle' | 'vlog', limit = 20) {
  const hashtagMap = {
    beauty: ['kbeauty', 'skincare', 'glassskin', 'grwm', 'makeuptutorial'],
    lifestyle: ['lifestyle', 'morningroutine', 'dayinmylife', 'wellness'],
    vlog: ['vlog', 'koreandaily', 'seoulvlog', 'studyvlog'],
  }
  const hashtags = hashtagMap[category]
  const url = `${BASE_URL}?token=${APIFY_TOKEN}&timeout=60`
  const body = {
    hashtags,
    resultsPerPage: Math.ceil(limit / hashtags.length),
    shouldDownloadCovers: true,
    shouldDownloadVideos: false,
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(65000),
  })
  if (!res.ok) throw new Error(`Apify error ${res.status}`)
  return res.json()
}
```

### 2-3. Discover 페이지에서 기존 fetch 교체
`src/App.tsx`의 Discover 컴포넌트:
- 기존 `fetch(${API_BASE}/tiktok/search ...)` 코드를 `searchTikTok(query)` 호출로 교체
- import 추가: `import { searchTikTok } from './api/tiktok'`
- 에러 시 샘플 데이터 폴백은 유지

**완료 기준**: 실제 TikTok 썸네일 이미지가 카드에 표시됨
**→ 완료 후 보고 및 승인 대기**

---

## Sprint 3. 썸네일 → 재생 → 분석 플로우
**파일**: `src/App.tsx` (Discover 컴포넌트)

### 현재 문제
- 썸네일이 없어서 빈 박스 표시
- 카드 클릭 시 모달이 뜨지만 영상 재생 없음

### 구현할 플로우
```
카드 (썸네일 표시)
  → 클릭
    → 모달 오픈: 썸네일 + 재생 버튼
      → 재생 버튼 클릭
        → TikTok 영상 embed 또는 webVideoUrl로 새 탭 오픈
          → 모달 하단 "이 영상 분석하기" 버튼
            → /analyze 페이지로 이동 (videoUrl 쿼리스트링으로 전달)
```

### 구체적 구현
1. 카드 썸네일: `coverUrl`이 있으면 `<img>` 태그로 표시, 없으면 그라디언트 플레이스홀더
2. 모달 내부:
   - 상단: 썸네일 이미지 (16:9 비율)
   - 중앙: "▶ TikTok에서 영상 보기" 버튼 → `window.open(webVideoUrl, '_blank')`
   - 하단 통계: 조회수, 좋아요, 참여율
   - CTA 버튼: "📊 이 영상 분석하기" → `/analyze?url=${webVideoUrl}` 로 navigate
3. Analyze 페이지: URL 쿼리스트링(`useSearchParams`)으로 url 자동 입력

**완료 기준**: 카드 클릭 → 모달 → TikTok 링크 → 분석 페이지 자동 URL 입력까지 연결됨
**→ 완료 후 보고 및 승인 대기**

---

## Sprint 4. 트렌드 탭 신규 페이지
**파일**: `src/App.tsx`에 `Trends` 컴포넌트 추가, 라우트 `/trends` 추가

### UI 구성
```
상단: 카테고리 탭 [뷰티 💄 | 라이프스타일 🌿 | Vlog 🎬]
좌측 (2/3): 해당 카테고리 인기 영상 그리드 (Discover와 동일한 카드 컴포넌트 재사용)
우측 (1/3): 인기 해시태그 랭킹
  - #kbeauty  ████████░░ 2.4M
  - #glassskin ███████░░░ 1.8M
  - #grwm     ██████░░░░ 1.2M
  (조회수 기반 바 차트 스타일)
```

### 데이터
- `getTrends(category)` 함수 호출
- 로딩 중 스켈레톤 표시
- 에러 시 카테고리별 샘플 해시태그 표시

### Nav에 트렌드 탭 추가
- Nav 컴포넌트: `['/trends', '트렌드']` 추가

**완료 기준**: 3개 카테고리 탭 전환 시 각각 다른 영상/해시태그 표시
**→ 완료 후 최종 보고**

---

## 주의사항 (CLAUDE.md 규칙 적용)
- 각 스프린트 완료 후 반드시 멈추고 보고할 것
- `.env` 파일은 절대 Git에 커밋하지 않을 것
- `any` 타입 최소화, 가능하면 명시적 타입 사용
- 기존 다크 테마 컬러 시스템 유지 (`#FF6B6B`, `#FF8E53`, `#08080C`)
- 한 스프린트에서 3개 이상 파일 동시 수정 금지
