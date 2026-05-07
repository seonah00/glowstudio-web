# TASK_SPRINT8.md — 트렌드 사이드바 고도화 + 크리에이터 탭

> Claude Code에 붙여넣고: "TASK_SPRINT8.md 읽고 8-A 먼저 진행해줘. 완료 후 보고하고 승인 받아."

---

## Sprint 8-A. 트렌드 사이드바 개선

### 변경 파일: `src/api/trends.ts` + `src/App.tsx`

### 1. 해시태그 30개로 확장

각 카테고리 `topHashtags` 배열을 30개로 확장.

beauty 예시:
```
#kbeauty 2.4M ↑ / #glassskin 1.8M ↑ / #grwm 1.2M — / #skincare 980K ↓
#over40 760K ↑ / #koreanmakeup 640K ↑ / #dewyskim 520K NEW
#skintok 490K ↑ / #cleanskincare 430K ↑ / #koreanskincare 410K —
#slugging 390K ↑ / #skincycling 370K NEW / #beautyover30 340K ↑
#morningroutine 320K — / #nightroutine 300K ↑ / #sunscreentok 280K NEW
#tonerup 260K ↑ / #essenceskincare 240K ↑ / #ampoule 220K —
#sheetmask 200K ↓ / #microneedling 185K ↑ / #retinolroutine 170K ↑
#ceramideskincare 155K NEW / #niacinamide 140K — / #hyaluronicacid 128K ↓
#vitamincskincare 115K ↑ / #peptides 102K NEW / #acneskincare 95K ↑
#sensitiveskim 88K — / #oilyskincare 76K ↑
```

lifestyle, vlog도 각 카테고리에 맞게 30개씩 작성.

### 2. 사이드바 UI 변경

- 해시태그 리스트 영역: `maxHeight: 420px`, `overflowY: auto`
- 상단에 새로고침 버튼 추가

새로고침 버튼:
```typescript
const [refreshing, setRefreshing] = useState(false)
const [refreshDone, setRefreshDone] = useState(false)

async function refreshTrends() {
  setRefreshing(true)
  await new Promise(r => setTimeout(r, 900))
  setTrendData(getDailyTrends(activeCategory))
  setLastUpdated(new Date())
  setRefreshing(false)
  setRefreshDone(true)
  setTimeout(() => setRefreshDone(false), 1500)
}
```

버튼 표시:
- 기본: `🔄 새로고침`
- refreshing 중: 아이콘 회전 스피너 애니메이션 `@keyframes spin { to { transform: rotate(360deg) } }`
- 완료 후 1.5초: `✓ 업데이트됨` (초록색)

### 3. 영상 로딩 중 단계별 메시지 + 진행바

카테고리 탭 전환 시 로딩 UI:

```typescript
const LOADING_MESSAGES = [
  '🔍 TikTok에서 트렌드 영상 수집 중...',
  '📊 조회수 데이터 분석 중...',
  '🏷 해시태그 순위 계산 중...',
  '✨ 인기 영상 정렬 중...',
]

// 1.5초마다 메시지 순환
// 진행바: 0%→90%를 60초에 걸쳐 채움 (fake progress)
// setInterval로 1.5초마다 +3.375% 증가
// 로딩 완료 시 즉시 100% → 300ms 후 숨김
```

로딩 영역 UI (스켈레톤 카드 위에 오버레이):
```
중앙 텍스트: 현재 메시지 (순환)
진행바: 코랄 그라디언트, 둥근 모서리
하단 안내: "Apify 분석에 약 30~60초 소요될 수 있어요"
배경: 스켈레톤 카드 30개 (희미하게)
```

---

## Sprint 8-B. 크리에이터 탭 신규 추가

### 탭 구조 변경

```
[💄 뷰티] [🌿 라이프스타일] [🎬 Vlog] [🔍 키워드검색] [👤 크리에이터]
```

### 데이터 구조 — `src/api/trends.ts`에 추가

```typescript
interface Creator {
  username: string
  displayName: string
  followers: string
  followerGrowthNum: string   // "+18.2K"
  followerGrowthPct: string   // "+4.3%"
  growthPctNum: number        // 4.3 (정렬용)
  avgViews: string
  category: 'beauty' | 'lifestyle' | 'vlog'
  keywords: string[]
  isRising: boolean           // growthPctNum > 5
  tiktokUrl: string
}
```

각 카테고리별 크리에이터 15개 이상 정적 데이터 작성.
beauty 예시 (5개만, 나머지는 Claude Code가 유사하게 생성):
```typescript
{ username: 'saebyeol.wellness', displayName: 'Saebyeol', followers: '442K',
  followerGrowthNum: '+18.2K', followerGrowthPct: '+4.3%', growthPctNum: 4.3,
  avgViews: '380K', category: 'beauty', isRising: false,
  keywords: ['kbeauty', 'over40', 'koreanskincare'],
  tiktokUrl: 'https://tiktok.com/@saebyeol.wellness' },
{ username: 'glowwithsoo', displayName: 'Soo Kim', followers: '89K',
  followerGrowthNum: '+6.1K', followerGrowthPct: '+7.3%', growthPctNum: 7.3,
  avgViews: '210K', category: 'beauty', isRising: true,
  keywords: ['glassskin', 'skincareroutine', 'affordable'],
  tiktokUrl: 'https://tiktok.com/@glowwithsoo' },
{ username: 'beautybyjen', displayName: 'Jen Park', followers: '234K',
  followerGrowthNum: '+2.3K', followerGrowthPct: '+1.0%', growthPctNum: 1.0,
  avgViews: '156K', category: 'beauty', isRising: false,
  keywords: ['kbeauty', 'grwm', 'makeuptutorial'],
  tiktokUrl: 'https://tiktok.com/@beautybyjen' },
{ username: 'kbeautyhaven', displayName: 'Mia Seoul', followers: '67K',
  followerGrowthNum: '+8.9K', followerGrowthPct: '+15.3%', growthPctNum: 15.3,
  avgViews: '340K', category: 'beauty', isRising: true,
  keywords: ['skincycling', 'slugging', 'kbeauty'],
  tiktokUrl: 'https://tiktok.com/@kbeautyhaven' },
{ username: 'radiantskin.kr', displayName: 'Rachel K', followers: '512K',
  followerGrowthNum: '+3.1K', followerGrowthPct: '+0.6%', growthPctNum: 0.6,
  avgViews: '290K', category: 'beauty', isRising: false,
  keywords: ['skincare', 'antiaging', 'koreanbeauty'],
  tiktokUrl: 'https://tiktok.com/@radiantskin.kr' },
// ... 10개 더 생성
```

### 크리에이터 탭 레이아웃

좌측 크리에이터 리스트 (75%) + 우측 기존 트렌드 사이드바 (25%) 유지

크리에이터 리스트 상단 컨트롤:
```
카테고리: [💄 뷰티 ▼]   정렬: [팔로워 급상승순 ▼]
키워드 필터: [#kbeauty] [#glassskin] [#over40] ...  (클릭으로 필터)
```

정렬 옵션 (select):
- 팔로워 급상승순 (growthPctNum DESC) — 기본
- 팔로워 증가수 (followerGrowthNum DESC)
- 평균 조회수 (avgViews DESC)
- 팔로워 수 (followers DESC)

키워드 필터:
- 카테고리별 상위 태그 뱃지 표시
- 클릭 시 토글 (선택/해제)
- 복수 선택 → 해당 키워드 모두 포함한 크리에이터만 표시

### 크리에이터 카드 UI

```
┌────────────────────────────────────────────────────────┐
│  [🔥]  @kbeautyhaven                    Mia Seoul      │
│                                                        │
│  팔로워   ███████░░░░░░░  67K                          │
│  이번 주  +8.9K  ↑ +15.3%  ← 초록색 강조              │
│  평균 조회수  340K                                     │
│                                                        │
│  [#skincycling] [#slugging] [#kbeauty]                │
│                                                        │
│                    [📊 이 계정 영상 보기] [↗ TikTok]   │
└────────────────────────────────────────────────────────┘
```

배지 규칙:
- growthPctNum > 5% → `🔥` 배지 + 코랄 테두리
- growthPctNum 2~5% → `📈` 배지 + 주황 테두리
- growthPctNum < 2% → 배지 없음 + 기본 테두리

팔로워 바:
- 카테고리 내 최대 팔로워 대비 비율로 바 길이 결정
- 색상: 코랄 그라디언트

"[📊 이 계정 영상 보기]" 버튼:
- 클릭 시 뷰티/라이프/Vlog 탭으로 전환
- `setQuery(creator.username)` 후 `search()` 자동 실행
- 검색 결과로 해당 크리에이터 영상 표시

---

## 파일 변경 범위

| 파일 | 작업 |
|------|------|
| `src/api/trends.ts` | 해시태그 30개 확장 + Creator 인터페이스 + 크리에이터 데이터 |
| `src/App.tsx` | 사이드바 새로고침/스크롤/로딩바 + 크리에이터 탭 컴포넌트 |

---

## 진행 순서
1. Sprint 8-A 완료 → 보고 → 승인
2. Sprint 8-B 완료 → 보고 → 승인

## 주의사항
- `any` 타입 금지, 모든 데이터 구조 interface로 정의
- 크리에이터 데이터는 정적 데이터 (실제 API 미연동)
- 날짜 시드로 팔로워 증가수 소폭 변동 적용 (매일 다르게 보이도록)
- 기존 다크 테마 (#08080C, #FF6B6B, #FF8E53) 유지
- 사이드바 sticky 포지션 유지
