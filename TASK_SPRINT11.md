# TASK_SPRINT11.md — 영상 중복 제거 + 기간 필터

> Claude Code에 붙여넣고: "TASK_SPRINT11.md 읽고 순서대로 진행해줘. 완료 후 보고하고 승인 받아."

---

## 문제
1. 여러 해시태그 검색 시 같은 영상이 중복 노출
2. 기간 필터 없이 오래된 영상도 섞여서 나옴

---

## Sprint 11-A. 중복 제거

### 파일: `src/api/tiktok.ts` 수정

```typescript
export async function searchTikTok(hashtag: string, limit = 30) {
  // ... 기존 Apify 호출 코드 유지 ...

  const items = await res.json()

  // 중복 제거: video id 기준
  const seen = new Set<string>()
  const unique = items.filter((item: RawVideo) => {
    const id = item.id || item.videoId
    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
  })

  return unique.slice(0, limit).map(mapToVideo)
}
```

### 카테고리 탭 (getTrends) 중복 제거

여러 해시태그를 병렬 호출하고 id 기준으로 합칠 때 중복 제거:

```typescript
export async function getTrends(
  category: 'beauty' | 'lifestyle' | 'vlog',
  limit = 30
) {
  const hashtags = CATEGORY_HASHTAGS[category]
  const perTag = Math.ceil(limit * 1.5 / hashtags.length) // 넉넉히 수집

  const runUrl = `${BASE_URL}?token=${APIFY_TOKEN}&timeout=90`
  const res = await fetch(runUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hashtags,
      resultsPerPage: perTag,
      shouldDownloadCovers: true,
      shouldDownloadVideos: false,
    }),
    signal: AbortSignal.timeout(95000),
  })

  if (!res.ok) throw new Error(`Apify ${res.status}`)
  const items = await res.json()

  // ✅ id 기준 중복 제거
  const seen = new Set<string>()
  const unique = (items as RawVideo[]).filter(item => {
    const id = item.id || item.videoId || ''
    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
  })

  // 조회수 높은 순 정렬 후 limit개만
  unique.sort((a, b) => (b.playCount || 0) - (a.playCount || 0))

  return unique.slice(0, limit).map(mapToVideo)
}
```

---

## Sprint 11-B. 기간 필터 UI + 로직

### UI — 검색창 아래 기간 필터 추가

```
┌──────────────────────────────────────────────┐
│  [검색창: #kbeauty...]  [검색 버튼]           │
│                                              │
│  기간: [전체] [오늘] [7일] [30일] [90일]      │  ← 새로 추가
│  정렬: [조회수순 ▼] [최신순] [참여율순]        │  ← 새로 추가
└──────────────────────────────────────────────┘
```

### State 추가 (Discover 컴포넌트)

```typescript
type PeriodFilter = 'all' | '1d' | '7d' | '30d' | '90d'
type SortFilter = 'views' | 'latest' | 'engagement'

const [period, setPeriod] = useState<PeriodFilter>('7d')   // 기본 7일
const [sortBy, setSortBy] = useState<SortFilter>('views')  // 기본 조회수순
```

### 필터 버튼 UI 컴포넌트

```typescript
// 기간 선택 버튼
const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: '1d', label: '오늘' },
  { value: '7d', label: '7일' },
  { value: '30d', label: '30일' },
  { value: '90d', label: '90일' },
]

// 정렬 선택 버튼
const SORT_OPTIONS: { value: SortFilter; label: string }[] = [
  { value: 'views', label: '🔥 조회수순' },
  { value: 'latest', label: '🕐 최신순' },
  { value: 'engagement', label: '💬 참여율순' },
]
```

버튼 스타일:
- 선택된 버튼: `background: rgba(255,107,107,0.15)`, `border: 1px solid rgba(255,107,107,0.4)`, `color: #FF8E53`
- 미선택: `background: rgba(255,255,255,0.05)`, `border: 1px solid rgba(255,255,255,0.1)`, `color: rgba(255,255,255,0.45)`
- `borderRadius: 8`, `padding: '6px 14px'`, `fontSize: 12`, `fontWeight: 600`

### 기간 필터 + 정렬 로직 (프론트엔드에서 처리)

Apify는 날짜 필터를 지원하지 않으므로 **수집 후 프론트에서 필터링**:

```typescript
function filterAndSort(
  videos: Video[],
  period: PeriodFilter,
  sortBy: SortFilter
): Video[] {
  let filtered = [...videos]

  // 1. 기간 필터
  if (period !== 'all') {
    const now = Date.now()
    const ms: Record<string, number> = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
    }
    const cutoff = now - ms[period]
    filtered = filtered.filter(v => {
      // createTime이 초 단위 unix timestamp
      const ts = (v.createTime || 0) * 1000
      return ts === 0 || ts >= cutoff // createTime 없으면 포함 (제외 안 함)
    })
  }

  // 2. 정렬
  if (sortBy === 'views') {
    filtered.sort((a, b) => b.playCount - a.playCount)
  } else if (sortBy === 'latest') {
    filtered.sort((a, b) => (b.createTime || 0) - (a.createTime || 0))
  } else if (sortBy === 'engagement') {
    filtered.sort((a, b) => {
      const erA = a.playCount > 0 ? (a.diggCount + (a.commentCount || 0)) / a.playCount : 0
      const erB = b.playCount > 0 ? (b.diggCount + (b.commentCount || 0)) / b.playCount : 0
      return erB - erA
    })
  }

  return filtered
}
```

### Video 인터페이스에 createTime 추가

```typescript
interface Video {
  id: string
  text: string
  authorMeta: { name: string; avatar?: string }
  videoMeta: { duration: number; coverUrl?: string }
  playCount: number
  diggCount: number
  commentCount?: number
  shareCount?: number
  createTime?: number   // ← 추가 (unix timestamp, 초 단위)
  webVideoUrl?: string
}
```

### mapToVideo 함수에 createTime 매핑 추가

```typescript
function mapToVideo(item: RawVideo): Video {
  return {
    // ... 기존 필드들 ...
    createTime: item.createTime || item.createTimeISO
      ? Math.floor(new Date(item.createTimeISO).getTime() / 1000)
      : undefined,
  }
}
```

### 카드에 날짜 표시 추가

영상 카드 하단에 업로드 날짜 표시:
```typescript
function formatDate(ts?: number): string {
  if (!ts) return ''
  const date = new Date(ts * 1000)
  const now = Date.now()
  const diff = now - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '오늘'
  if (days === 1) return '어제'
  if (days < 7) return `${days}일 전`
  if (days < 30) return `${Math.floor(days / 7)}주 전`
  if (days < 365) return `${Math.floor(days / 30)}개월 전`
  return `${Math.floor(days / 365)}년 전`
}
```

카드 UI:
```
[썸네일]
이 선크림 진짜 미쳤어요 🔥 ...
@glow_creator  •  3일 전        ← 날짜 추가
❤️ 180K  💬 4.2K  7.7%
```

### 필터 적용 시점

```typescript
// 검색 결과가 바뀌거나 period/sortBy가 바뀔 때 자동 재필터링
const [rawVideos, setRawVideos] = useState<Video[]>([])   // API 원본
const [videos, setVideos] = useState<Video[]>([])          // 필터 적용본

// rawVideos 또는 period/sortBy 변경 시
useEffect(() => {
  setVideos(filterAndSort(rawVideos, period, sortBy))
}, [rawVideos, period, sortBy])

// 검색 시 rawVideos에 저장 (filter는 useEffect가 자동 처리)
async function search() {
  // ...
  const data = await searchTikTok(query)
  setRawVideos(data)  // videos는 useEffect가 자동 업데이트
}
```

이렇게 하면 기간/정렬 변경 시 **Apify 재호출 없이** 즉시 필터링됩니다.

---

## 필터 결과 없을 때 UI

```
┌─────────────────────────────────┐
│                                 │
│  📭 해당 기간에 영상이 없어요     │
│                                 │
│  최근 7일 → 30일로 넓혀볼까요?   │
│                                 │
│  [30일로 변경]  [전체 보기]       │
│                                 │
└─────────────────────────────────┘
```

---

## 파일 변경 범위

| 파일 | 작업 |
|------|------|
| `src/api/tiktok.ts` | id 기준 중복 제거, createTime 매핑 추가 |
| `src/App.tsx` | 기간/정렬 필터 UI + filterAndSort 로직, 카드 날짜 표시 |

---

## 주의사항
- 필터링은 프론트엔드에서 처리 (Apify 재호출 없음 → 비용 절감)
- createTime이 없는 영상은 기간 필터에서 제외하지 않고 포함
- 중복 제거는 반드시 `id` 기준 (텍스트 기준 X)
- 기본값: 기간 `7d`, 정렬 `조회수순`
- 기존 다크 테마 유지, `any` 타입 금지
- 완료 후 보고 및 승인 대기
