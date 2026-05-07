# TASK_SPRINT7.md — AI 스크립트 생성 페이지 고도화

> Claude Code에 붙여넣고: "TASK_SPRINT7.md 읽고 지시대로 진행해줘. 완료 후 보고하고 내 승인 받아."

---

## 목표
AI 스크립트 생성 페이지를 아래 흐름으로 전면 개편:
1. 레퍼런스 TikTok 영상 링크 입력 (Apify로 분석)
2. 제품 정보 입력 (링크 또는 이름)
3. 설정 (톤, 길이, 타겟)
4. 생성 결과: 한국어 스크립트 + 영어(북미) 스크립트 + 촬영 가이드 + 팁

---

## 파일 변경

### `src/App.tsx` — Generate 컴포넌트 전면 교체
### `src/api/generate.ts` — 신규 생성

---

## UI 설계 — 4단계 입력 폼

```
┌──────────────────────────────────────────────────┐
│  ✍️ AI 스크립트 생성                              │
│  레퍼런스 영상을 분석해서 나만의 스크립트를 만드세요  │
│                                                  │
│  ── STEP 1. 레퍼런스 영상 ────────────────────── │
│                                                  │
│  참고할 TikTok 영상 링크 (최대 3개)               │
│  [https://tiktok.com/...        ] [+ 추가]       │
│  [https://tiktok.com/...        ] [×]            │
│  [https://tiktok.com/...        ] [×]            │
│                                                  │
│  또는 디스커버에서 분석한 영상이 있다면 자동 입력됨  │
│  (분석 → "이 스타일로 만들기" 클릭 시)             │
│                                                  │
│  ── STEP 2. 내 제품/주제 ─────────────────────── │
│                                                  │
│  제품명 또는 주제 *                               │
│  [라운드랩 자작나무 에센스                        ]│
│                                                  │
│  제품 링크 (선택 — 쿠팡/올리브영/아마존 등)        │
│  [https://...                              ]     │
│                                                  │
│  제품 특징/어필 포인트 (선택)                      │
│  [수분 24시간 지속, 민감성 피부 OK, 한방 성분      ]│
│                                                  │
│  ── STEP 3. 설정 ──────────────────────────────  │
│                                                  │
│  영상 톤                                         │
│  [Gen Z 🔥] [전문가 💼] [유머 😂] [튜토리얼 📚]   │
│  [스토리텔링 📖] [리뷰어 ⭐]                      │
│                                                  │
│  영상 길이                                        │
│  [15초] [30초] [45초ⓥ] [60초] [90초]            │
│                                                  │
│  타겟 시청자                                      │
│  [Gen Z] [밀레니얼] [30-40대] [전체]              │
│                                                  │
│  출력 언어                                        │
│  [한국어+영어 둘다ⓥ] [한국어만] [영어만]          │
│                                                  │
│  [🎬 스크립트 생성하기]                            │
└──────────────────────────────────────────────────┘
```

---

## API 설계 — `src/api/generate.ts`

```typescript
import { searchTikTokByUrl } from './tiktok' // URL로 단일 영상 메타 가져오기

interface GenerateInput {
  referenceUrls: string[]       // TikTok 링크들
  productName: string
  productUrl?: string
  productFeatures?: string
  tone: string
  duration: number              // 초 단위
  targetAudience: string
  language: 'both' | 'ko' | 'en'
  // 분석 페이지에서 넘어온 경우
  hookType?: string
  refAnalysis?: string
}

interface ScriptOutput {
  ko: {
    hook: string          // 첫 3초 후킹 멘트
    body: string          // 본론 스크립트
    cta: string           // 마무리 CTA
    full: string          // 전체 합본
    hashtags: string[]    // 추천 해시태그 (한국어)
  }
  en: {
    hook: string
    body: string
    cta: string
    full: string
    hashtags: string[]    // 추천 해시태그 (영어/북미)
  }
  shootingGuide: {
    setup: string[]       // 촬영 세팅 (조명, 각도, 배경)
    scenes: SceneGuide[]  // 씬별 촬영 가이드
    tips: string[]        // 편집/업로드 팁
    doList: string[]      // 꼭 해야 할 것
    dontList: string[]    // 하면 안 되는 것
  }
  timing: TimingGuide[]   // 초 단위 타임라인
}

interface SceneGuide {
  timeRange: string       // "0~3초"
  description: string     // 이 씬에서 찍을 내용
  cameraAngle: string     // 카메라 각도
  tip: string             // 촬영 팁
}

interface TimingGuide {
  time: string
  action: string
  koScript: string
  enScript: string
}

export async function generateScript(input: GenerateInput): Promise<ScriptOutput> {
  // 레퍼런스 영상 메타 수집 (있는 경우)
  let referenceContext = ''
  if (input.referenceUrls.length > 0) {
    referenceContext = `
참고 영상 정보:
${input.referenceUrls.map((url, i) => `영상${i+1}: ${url}`).join('\n')}
(위 영상들의 후킹 스타일, 구성 방식, 톤앤매너를 참고해서 스크립트 작성)
`
  }

  if (input.hookType) {
    referenceContext += `\n분석된 후킹 유형: ${input.hookType}`
  }
  if (input.refAnalysis) {
    referenceContext += `\n분석 인사이트: ${input.refAnalysis}`
  }

  const prompt = `
당신은 북미 TikTok K-뷰티 콘텐츠 전문 스크립트 라이터입니다.
아래 정보를 바탕으로 실제로 바로 촬영할 수 있는 스크립트를 작성하세요.

=== 입력 정보 ===
제품/주제: ${input.productName}
제품 링크: ${input.productUrl || '없음'}
제품 특징: ${input.productFeatures || '없음'}
영상 톤: ${input.tone}
영상 길이: ${input.duration}초
타겟: ${input.targetAudience}
${referenceContext}

=== 출력 요구사항 ===
아래 JSON 형식으로만 응답 (마크다운 없이 순수 JSON):

{
  "ko": {
    "hook": "첫 3초 한국어 후킹 멘트 (강렬하고 시청자가 멈추게 만드는 문장)",
    "body": "본론 스크립트 전체 (${input.duration}초 분량, 실제 말할 내용을 그대로 작성, 줄바꿈 포함)",
    "cta": "마무리 CTA 멘트 (팔로우/댓글/저장 유도)",
    "full": "hook + body + cta 합본 전체 스크립트",
    "hashtags": ["#kbeauty", "#skincare", "관련해시태그들 10개"]
  },
  "en": {
    "hook": "First 3 seconds hook in North American Gen Z English style (casual, authentic, trendy)",
    "body": "Full body script in ${input.duration}s length, North American TikTok style (use 'y'all', 'literally', 'no cap', 'POV:' naturally when fits the tone)",
    "cta": "Closing CTA in English",
    "full": "Complete English script",
    "hashtags": ["#kbeauty", "#skincare", "10 relevant English hashtags for North America"]
  },
  "shootingGuide": {
    "setup": [
      "조명: 자연광 또는 링라이트 45도 각도 추천",
      "배경: 미니멀한 책상 or 욕실 카운터",
      "카메라: 세로 9:16 고정, 눈높이 또는 약간 아래 각도"
    ],
    "scenes": [
      {
        "timeRange": "0~3초",
        "description": "이 씬에서 찍을 구체적인 행동/내용",
        "cameraAngle": "카메라 각도와 거리",
        "tip": "이 씬 촬영 팁"
      }
    ],
    "tips": [
      "편집 팁 1",
      "TikTok 알고리즘 최적화 팁",
      "업로드 시간 추천",
      "자막 추가 권장",
      "음악 선택 팁"
    ],
    "doList": [
      "꼭 해야 할 것 1",
      "꼭 해야 할 것 2",
      "꼭 해야 할 것 3"
    ],
    "dontList": [
      "하면 안 되는 것 1",
      "하면 안 되는 것 2",
      "하면 안 되는 것 3"
    ]
  },
  "timing": [
    { "time": "0~3초", "action": "후킹", "koScript": "한국어 후킹 멘트", "enScript": "English hook" },
    { "time": "3~15초", "action": "제품 소개", "koScript": "...", "enScript": "..." },
    { "time": "15~35초", "action": "실연/리뷰", "koScript": "...", "enScript": "..." },
    { "time": "35~${input.duration}초", "action": "CTA", "koScript": "...", "enScript": "..." }
  ]
}
`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  const text = data.content?.[0]?.text || '{}'
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}
```

---

## 결과 화면 UI 설계

생성 완료 후 결과를 탭으로 구분해서 표시:

```
┌──────────────────────────────────────────────────────────┐
│  🎬 생성된 스크립트                                        │
│                                                          │
│  [🇰🇷 한국어] [🇺🇸 영어(북미)] [📋 타임라인] [📷 촬영가이드]│  ← 탭
│──────────────────────────────────────────────────────────│
│                                                          │
│  ── 🇰🇷 한국어 탭 ──                                      │
│                                                          │
│  🎣 후킹 (0~3초)                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ "이거 절대 사면 안 되는 선크림인데... 저는 매일 써요" │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  📝 본론                                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 라운드랩 자작나무 에센스 솔직 후기예요.              │  │
│  │ 민감성 피부인데 이거 바르고 나서...                  │  │
│  │ (전체 스크립트)                                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  📣 CTA                                                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 댓글에 피부 타입 알려주시면 루틴 공유해드릴게요! 🙌  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  🏷 추천 해시태그                                          │
│  #kbeauty #자작나무에센스 #민감성피부 #스킨케어루틴 ...    │
│                                                          │
│  [📋 전체 복사]                                           │
│                                                          │
│  ── 🇺🇸 영어(북미) 탭 ──                                  │
│                                                          │
│  🎣 Hook (0~3s)                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ "POV: you're about to find your new holy grail     │  │
│  │  skincare product and it's under $20 👀"           │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  📝 Script                                               │
│  [영어 본론 스크립트]                                     │
│                                                          │
│  🏷 Hashtags                                             │
│  #kbeauty #koreanskincare #glasskin #skintok ...        │
│                                                          │
│  [📋 Copy All]                                           │
│                                                          │
│  ── 📋 타임라인 탭 ──                                     │
│                                                          │
│  ┌──────┬──────────┬──────────────────┬────────────────┐ │
│  │ 시간 │  액션    │  한국어 스크립트  │  English       │ │
│  ├──────┼──────────┼──────────────────┼────────────────┤ │
│  │0~3초 │ 후킹     │ "이거 절대..."   │ "POV: you..."  │ │
│  │3~15초│ 제품소개 │ "라운드랩..."    │ "okay so..."   │ │
│  │15~35초│실연/리뷰│ "발림성이..."    │ "the texture.."│ │
│  │35~45초│ CTA    │ "댓글에..."      │ "comment..."   │ │
│  └──────┴──────────┴──────────────────┴────────────────┘ │
│                                                          │
│  ── 📷 촬영 가이드 탭 ──                                  │
│                                                          │
│  🎥 촬영 세팅                                             │
│  • 조명: 자연광 또는 링라이트 45도                        │
│  • 배경: 미니멀한 책상 or 욕실 카운터                    │
│  • 카메라: 세로 9:16, 눈높이 고정                        │
│                                                          │
│  🎬 씬별 가이드                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 0~3초   후킹 씬                                     │  │
│  │ 📹 클로즈업: 제품을 들고 카메라 정면                  │  │
│  │ 각도: 눈높이, 거리: 50cm                            │  │
│  │ 💡 팁: 첫 프레임부터 제품이 보여야 함                 │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ 3~15초  제품 소개 씬                                 │  │
│  │ ...                                                 │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ✅ 꼭 해야 할 것                                         │
│  • 첫 1초 안에 얼굴 또는 제품 노출                       │
│  • 자막 필수 (무음 시청자 40%)                           │
│  • 후킹 멘트는 빠르게, 에너지 높게                       │
│                                                          │
│  ❌ 하면 안 되는 것                                       │
│  • 인트로에 채널 소개 금지 (스킵됨)                      │
│  • 너무 긴 침묵 구간                                     │
│  • 화질 낮은 영상 (최소 1080p)                          │
│                                                          │
│  💡 편집 & 업로드 팁                                     │
│  • 트렌딩 사운드 사용 권장                               │
│  • 업로드 최적 시간: 오후 6~9시 (EST 기준)               │
│  • 첫 48시간이 알고리즘 결정                             │
└──────────────────────────────────────────────────────────┘
```

---

## 구현 상세 (Generate 컴포넌트)

### State 구조
```typescript
const [refs, setRefs] = useState<string[]>([''])          // 레퍼런스 링크 배열
const [productName, setProductName] = useState('')
const [productUrl, setProductUrl] = useState('')
const [productFeatures, setProductFeatures] = useState('')
const [tone, setTone] = useState('gen-z')
const [duration, setDuration] = useState(45)
const [target, setTarget] = useState('gen-z')
const [language, setLanguage] = useState<'both'|'ko'|'en'>('both')
const [result, setResult] = useState<ScriptOutput | null>(null)
const [activeTab, setActiveTab] = useState<'ko'|'en'|'timeline'|'guide'>('ko')
const [loading, setLoading] = useState(false)
```

### 레퍼런스 링크 입력
- 기본 1개 입력창, "+ 추가" 클릭 시 최대 3개까지 추가
- 각 링크 옆 "×" 버튼으로 삭제
- URL 형식 유효성 검사 (tiktok.com 포함 여부)

### 쿼리스트링 자동 입력
분석 페이지에서 넘어올 때 자동 채우기:
```typescript
const [searchParams] = useSearchParams()
useEffect(() => {
  const topic = searchParams.get('topic')
  const hookType = searchParams.get('hookType')
  const refUrl = searchParams.get('refUrl')
  if (topic) setProductName(topic)
  if (refUrl) setRefs([refUrl])
  if (hookType) // tone 자동 매핑
}, [searchParams])
```

### 탭 컴포넌트
- 탭 전환: `activeTab` state로 조건부 렌더링
- 각 탭 내용은 별도 컴포넌트로 분리 (코드 가독성)
- 복사 버튼: `navigator.clipboard.writeText()`

### 타임라인 테이블
- `<table>` 대신 div grid로 구현 (스타일 일관성)
- 한국어/영어 나란히 비교 표시

---

## 주의사항
- `generateScript()` API 응답에 3~10초 소요 → 로딩 중 메시지 표시
  - "🔍 레퍼런스 영상 분석 중..."
  - "✍️ 한국어 스크립트 작성 중..."
  - "🌏 영어(북미) 버전 변환 중..."
  - "📷 촬영 가이드 생성 중..."
- JSON 파싱 실패 시 샘플 스크립트 폴백
- 레퍼런스 링크는 실제 Apify 호출 없이 URL만 프롬프트에 포함 (비용 절감)
- 기존 다크 테마 유지
- `any` 타입 금지 → 명시적 interface 사용
- 완료 후 보고 및 승인 대기
