# TASK_SPRINT10.md — Apify 실제 크리에이터 데이터 수집

> Claude Code에 붙여넣고: "TASK_SPRINT10.md 읽고 순서대로 진행해줘. 완료 후 보고하고 승인 받아."

---

## 문제
현재 크리에이터 탭의 데이터가 전부 하드코딩된 가짜 데이터.
TikTok 링크가 실제 존재하지 않는 계정으로 연결됨.

## 해결 방향
Apify `clockworks~free-tiktok-scraper`로 카테고리별 해시태그 검색
→ 실제 영상 데이터에서 크리에이터 정보 추출
→ 팔로워 수, 평균 조회수 집계
→ 실제 TikTok 프로필 링크 생성

---

## Sprint 10-A. 백엔드 크리에이터 수집 API 추가

### 파일: `glowstudio-server/src/routes/creators.ts` 신규 생성

```typescript
import { Router, Request, Response } from 'express'
import { fetchCreatorsByCategory } from '../services/creators'

const router = Router()

// GET /creators?category=beauty&limit=20
router.get('/', async (req: Request, res: Response) => {
  const category = (req.query.category as string) || 'beauty'
  const limit = parseInt(req.query.limit as string) || 20

  const validCategories = ['beauty', 'lifestyle', 'vlog']
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: '유효하지 않은 카테고리' })
  }

  try {
    const creators = await fetchCreatorsByCategory(category, limit)
    return res.json({ success: true, creators, category, fetchedAt: new Date() })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '크리에이터 수집 실패'
    return res.status(500).json({ error: msg })
  }
})

export default router
```

### 파일: `glowstudio-server/src/services/creators.ts` 신규 생성

```typescript
import axios from 'axios'

const APIFY_TOKEN = process.env.APIFY_API_KEY!

const CATEGORY_HASHTAGS: Record<string, string[]> = {
  beauty: ['kbeauty', 'koreanskincare', 'glassskin', 'grwm', 'skintok'],
  lifestyle: ['koreanlifestyle', 'morningroutine', 'dayinmylife', 'koreandaily'],
  vlog: ['seoulvlog', 'koreadvlog', 'studyvlog', 'koreanvlog'],
}

interface RawTikTokItem {
  authorMeta?: {
    name?: string
    nickName?: string
    fans?: number
    heart?: number
    video?: number
    verified?: boolean
    signature?: string
  }
  playCount?: number
  diggCount?: number
  commentCount?: number
  shareCount?: number
  text?: string
}

export interface Creator {
  username: string
  displayName: string
  followers: number
  followersDisplay: string
  totalLikes: number
  videoCount: number
  avgViews: number
  avgViewsDisplay: string
  engagementRate: string
  isVerified: boolean
  bio: string
  category: string
  keywords: string[]
  tiktokUrl: string
  // 팔로워 증가는 Apify에서 직접 제공 안 됨 → 조회수 기반 추정
  growthIndicator: 'hot' | 'rising' | 'stable'
}

export async function fetchCreatorsByCategory(
  category: string,
  limit: number
): Promise<Creator[]> {
  const hashtags = CATEGORY_HASHTAGS[category] || CATEGORY_HASHTAGS.beauty

  // 여러 해시태그에서 영상 수집
  const runUrl = `https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=90`

  const res = await axios.post(runUrl, {
    hashtags,
    resultsPerPage: Math.ceil(limit * 3 / hashtags.length), // 크리에이터 중복 감안해서 넉넉히
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
  }, { timeout: 100000 })

  const items: RawTikTokItem[] = res.data || []

  // 크리에이터별로 그룹핑 (같은 크리에이터의 영상 여러 개 집계)
  const creatorMap = new Map<string, {
    meta: RawTikTokItem['authorMeta']
    videos: { playCount: number; diggCount: number; commentCount: number }[]
    keywords: Set<string>
  }>()

  for (const item of items) {
    const username = item.authorMeta?.name
    if (!username || !item.authorMeta) continue

    if (!creatorMap.has(username)) {
      creatorMap.set(username, {
        meta: item.authorMeta,
        videos: [],
        keywords: new Set(),
      })
    }

    const entry = creatorMap.get(username)!
    entry.videos.push({
      playCount: item.playCount || 0,
      diggCount: item.diggCount || 0,
      commentCount: item.commentCount || 0,
    })

    // 캡션에서 해시태그 추출
    const tags = (item.text || '').match(/#\w+/g) || []
    tags.slice(0, 5).forEach(t => entry.keywords.add(t.toLowerCase()))
  }

  // Creator 객체로 변환 + 정렬
  const creators: Creator[] = []

  for (const [username, data] of creatorMap.entries()) {
    if (data.videos.length === 0) continue

    const followers = data.meta?.fans || 0
    const totalViews = data.videos.reduce((sum, v) => sum + v.playCount, 0)
    const avgViews = Math.round(totalViews / data.videos.length)
    const totalEngagement = data.videos.reduce(
      (sum, v) => sum + v.diggCount + v.commentCount, 0
    )
    const avgEngagement = totalViews > 0
      ? ((totalEngagement / totalViews) * 100).toFixed(1)
      : '0'

    // 팔로워 대비 평균 조회수 비율로 성장 지표 추정
    // 조회수/팔로워 > 2 → hot, > 0.5 → rising, 이하 → stable
    const viewsPerFollower = followers > 0 ? avgViews / followers : 0
    const growthIndicator: Creator['growthIndicator'] =
      viewsPerFollower > 2 ? 'hot' :
      viewsPerFollower > 0.5 ? 'rising' : 'stable'

    creators.push({
      username,
      displayName: data.meta?.nickName || username,
      followers,
      followersDisplay: formatCount(followers),
      totalLikes: data.meta?.heart || 0,
      videoCount: data.meta?.video || 0,
      avgViews,
      avgViewsDisplay: formatCount(avgViews),
      engagementRate: avgEngagement + '%',
      isVerified: data.meta?.verified || false,
      bio: data.meta?.signature || '',
      category,
      keywords: Array.from(data.keywords).slice(0, 5),
      tiktokUrl: `https://www.tiktok.com/@${username}`,
      growthIndicator,
    })
  }

  // hot → rising → stable 순, 같은 등급은 avgViews 높은 순
  creators.sort((a, b) => {
    const order = { hot: 0, rising: 1, stable: 2 }
    if (order[a.growthIndicator] !== order[b.growthIndicator]) {
      return order[a.growthIndicator] - order[b.growthIndicator]
    }
    return b.avgViews - a.avgViews
  })

  return creators.slice(0, limit)
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}
```

### `glowstudio-server/src/index.ts` — 라우터 등록 추가
```typescript
import creatorsRouter from './routes/creators'
// 기존 라우터 아래에 추가:
app.use('/creators', creatorsRouter)
```

---

## Sprint 10-B. 프론트엔드 크리에이터 탭 실제 API 연동

### `src/api/creators.ts` 신규 생성

```typescript
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export interface Creator {
  username: string
  displayName: string
  followers: number
  followersDisplay: string
  avgViews: number
  avgViewsDisplay: string
  engagementRate: string
  isVerified: boolean
  bio: string
  category: string
  keywords: string[]
  tiktokUrl: string
  growthIndicator: 'hot' | 'rising' | 'stable'
}

export async function getCreatorsByCategory(
  category: string,
  limit = 20
): Promise<Creator[]> {
  const res = await fetch(
    `${SERVER_URL}/creators?category=${category}&limit=${limit}`,
    { signal: AbortSignal.timeout(100000) }
  )
  if (!res.ok) throw new Error(`크리에이터 수집 실패: ${res.status}`)
  const data = await res.json()
  return data.creators
}
```

### `src/App.tsx` — 크리에이터 탭 수정

기존 하드코딩 데이터 완전 제거 → API 호출로 교체:

```typescript
import { getCreatorsByCategory, Creator } from './api/creators'

// 크리에이터 탭 state
const [creators, setCreators] = useState<Creator[]>([])
const [creatorLoading, setCreatorLoading] = useState(false)
const [creatorError, setCreatorError] = useState<string | null>(null)
const [creatorCategory, setCreatorCategory] = useState<'beauty'|'lifestyle'|'vlog'>('beauty')
const [sortBy, setSortBy] = useState<'growth'|'avgViews'|'followers'>('growth')

// 카테고리 변경 시 API 호출
async function loadCreators(category: 'beauty'|'lifestyle'|'vlog') {
  setCreatorLoading(true)
  setCreatorError(null)
  setCreatorCategory(category)
  try {
    const data = await getCreatorsByCategory(category, 20)
    setCreators(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '수집 실패'
    setCreatorError(msg)
    setCreators([])
  }
  setCreatorLoading(false)
}

// 크리에이터 탭 진입 시 자동 로드
useEffect(() => {
  if (activeTab === 'creators') loadCreators('beauty')
}, [activeTab])
```

### 크리에이터 카드 UI 업데이트

growthIndicator 기반 배지:
```typescript
const badge = {
  hot: { icon: '🔥', label: '급상승', color: '#FF6B6B', border: 'rgba(255,107,107,0.4)' },
  rising: { icon: '📈', label: '상승중', color: '#FF8E53', border: 'rgba(255,142,83,0.3)' },
  stable: { icon: null, label: null, color: 'transparent', border: 'rgba(255,255,255,0.07)' },
}
```

카드에 실제 데이터 표시:
- 팔로워: `creator.followersDisplay`
- 평균 조회수: `creator.avgViewsDisplay`
- 참여율: `creator.engagementRate`
- 키워드: `creator.keywords` (실제 해시태그)
- TikTok 링크: `creator.tiktokUrl` (실제 URL)
- 인증 배지: `creator.isVerified && '✓'`

로딩 UI:
```
🔍 TikTok에서 실제 크리에이터 수집 중...
카테고리별 해시태그 분석 + 크리에이터 집계
약 30~60초 소요됩니다
[스켈레톤 카드 6개]
```

에러 UI:
```
⚠️ 크리에이터 수집 실패: {에러 메시지}
[다시 시도] 버튼
```

---

## Sprint 10-C. 캐싱 추가 (Apify 비용 절감)

### `glowstudio-server/src/services/cache.ts` 신규 생성

```typescript
// 메모리 캐시 (서버 재시작 시 초기화)
// 카테고리별 결과를 1시간 캐시 → 같은 카테고리 반복 요청 시 Apify 재호출 없음

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>()

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs })
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.data as T
  }
}

export const cache = new MemoryCache()
```

### `src/routes/creators.ts` — 캐시 적용
```typescript
import { cache } from '../services/cache'

router.get('/', async (req, res) => {
  const category = req.query.category as string || 'beauty'
  const cacheKey = `creators:${category}`

  // 캐시 확인 (1시간)
  const cached = cache.get<Creator[]>(cacheKey)
  if (cached) {
    return res.json({ success: true, creators: cached, category, fromCache: true })
  }

  // 캐시 없으면 Apify 호출
  const creators = await fetchCreatorsByCategory(category, 20)
  cache.set(cacheKey, creators, 60 * 60 * 1000) // 1시간
  return res.json({ success: true, creators, category, fromCache: false })
})
```

---

## 진행 순서
```
10-A: 백엔드 크리에이터 API + 캐시 구현 → git push → Railway 자동 배포
      → /creators?category=beauty 테스트 → 보고 → 승인
10-B: 프론트엔드 연동 + 실제 데이터 카드 표시 확인 → 보고 → 승인
10-C: 캐시 동작 확인 (두 번째 요청이 빠른지) → 최종 보고
```

## 주의사항
- Apify 호출 1회당 약 $0.05~0.10 발생 → 캐시로 최소화
- 크리에이터 탭 진입할 때만 API 호출 (페이지 로드 시 자동 호출 X)
- TikTok URL 형식: 반드시 `https://www.tiktok.com/@${username}` 형식
- `any` 타입 금지
- 기존 다크 테마 유지
