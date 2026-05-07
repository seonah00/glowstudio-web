# TASK_SPRINT3_4.md — 영상 분석 플로우 + 트렌드 디스커버 개편

> Claude Code에 붙여넣고: "이 지시서대로 Sprint 3부터 순서대로 진행해줘. 각 스프린트 완료 후 멈추고 승인 받아."

---

## Sprint 3. 영상 클릭 → 재생 → AI 분석 → 영상 제작 제안 플로우

### 전체 플로우
```
카드 클릭
  → [Step 1] 영상 모달: 썸네일 + TikTok 재생 버튼
    → [Step 2] AI 분석 화면: 조회수 이유 / 후킹 포인트 분석
      → [Step 3] 제작 제안 화면: "이 스타일로 영상 만들까요?"
```

---

### Step 1 — 영상 모달 (VideoModal 컴포넌트)

**파일**: `src/components/VideoModal.tsx` 신규 생성

```
┌─────────────────────────────────────┐
│  [✕]                                │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   [썸네일 이미지 16:9]       │    │
│  │                             │    │
│  │      ▶ (재생 버튼 중앙)      │    │
│  └─────────────────────────────┘    │
│                                     │
│  제목: 이 선크림 진짜 미쳤어요 🔥     │
│  @glow_creator                      │
│                                     │
│  👁 2.4M   ❤️ 180K   💬 4.2K       │
│                                     │
│  [▶ TikTok에서 영상 보기]            │  ← window.open(webVideoUrl)
│  [📊 이 영상 AI 분석하기  →]         │  ← Step 2로 이동
└─────────────────────────────────────┘
```

**구현 상세**:
- 배경 클릭 시 닫힘
- "TikTok에서 영상 보기" → `window.open(webVideoUrl, '_blank')`
- "AI 분석하기" → 모달 내부에서 Step 2 화면으로 전환 (페이지 이동 X, 모달 내 스텝 전환)

---

### Step 2 — AI 분석 화면 (모달 내부 전환)

**Apify 데이터 + Claude API로 분석 생성**

`src/api/analyze.ts` 신규 생성:
```typescript
export async function analyzeVideo(video: Video): Promise<AnalysisResult> {
  const prompt = `
당신은 TikTok 바이럴 콘텐츠 전문가입니다.
아래 TikTok 영상 데이터를 분석해주세요.

영상 정보:
- 제목/캡션: ${video.text}
- 조회수: ${video.playCount.toLocaleString()}
- 좋아요: ${video.diggCount.toLocaleString()}
- 댓글: ${video.commentCount?.toLocaleString()}
- 참여율: ${(((video.diggCount + (video.commentCount||0)) / video.playCount) * 100).toFixed(1)}%
- 길이: ${video.videoMeta.duration}초

다음을 JSON 형식으로 분석해주세요:
{
  "viral_reason": "조회수가 높은 핵심 이유 2~3줄",
  "hook_analysis": "첫 3초 후킹 전략 분석",
  "hook_type": "후킹 유형 (궁금증형/충격형/공감형/정보형 중 하나)",
  "best_elements": ["잘된 요소1", "잘된 요소2", "잘된 요소3"],
  "target_audience": "타겟 시청자 분석",
  "trend_keywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3"],
  "score": 85
}
JSON만 반환하고 다른 텍스트는 없이.
`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  const text = data.content?.[0]?.text || '{}'
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}
```

**분석 화면 UI**:
```
┌─────────────────────────────────────┐
│  ← 뒤로      📊 AI 분석 결과         │
│─────────────────────────────────────│
│                                     │
│  바이럴 점수      85 / 100           │
│  ████████████████░░░░               │
│                                     │
│  🔥 왜 조회수가 높은가?               │
│  "첫 3초에 반전 결말을 예고하는        │
│   궁금증형 후킹으로 시청자를 붙잡음.   │
│   K-뷰티 특유의 비포/애프터 공식..."   │
│                                     │
│  🎣 후킹 전략    [궁금증형]           │
│  "영상 첫 컷에서 결과물을 먼저 보여주고│
│   과정을 역순으로 풀어가는 구조..."    │
│                                     │
│  ✅ 잘된 요소                         │
│  • 짧은 영상 (32초) 높은 완주율        │
│  • 인기 해시태그 조합                  │
│  • 구체적인 가격 언급 ($10)            │
│                                     │
│  👥 타겟 시청자                        │
│  Gen Z 여성, 스킨케어 입문자           │
│                                     │
│─────────────────────────────────────│
│  [✍️ 이 스타일로 내 영상 만들기  →]   │  ← Step 3으로
└─────────────────────────────────────┘
```

**로딩 상태**: 분석 중 스피너 + "AI가 영상을 분석하고 있어요..." 메시지

---

### Step 3 — 영상 제작 제안 화면

**UI**:
```
┌─────────────────────────────────────┐
│  ← 뒤로    ✍️ 내 영상 만들기          │
│─────────────────────────────────────│
│                                     │
│  이 영상의 성공 공식을                │
│  내 콘텐츠에 적용해볼까요?            │
│                                     │
│  참고 영상: @glow_creator 스타일      │
│  후킹 유형: 궁금증형  •  길이: 32초   │
│                                     │
│  ── 내 콘텐츠 정보 입력 ──           │
│                                     │
│  내 제품/주제                         │
│  [입력창: 예) 라운드랩 자작나무 에센스]│
│                                     │
│  타겟 시청자                          │
│  [○ Gen Z   ○ 밀레니얼   ○ 전체]    │
│                                     │
│  [🎬 AI 스크립트 생성하기]            │  ← /generate 페이지로 이동
│                                     │
│  또는                                │
│  [다른 영상 분석하기]  [닫기]          │
└─────────────────────────────────────┘
```

**"AI 스크립트 생성하기" 클릭 시**:
- `/generate` 페이지로 이동
- 쿼리스트링으로 데이터 전달: `?topic=라운드랩&hookType=궁금증형&duration=32&ref=analysis`
- Generate 페이지에서 쿼리스트링 읽어서 입력란 자동 채우기

**완료 기준**:
- 카드 클릭 → Step1 → Step2(AI분석) → Step3(제작제안) → Generate 페이지 흐름 완성
- 각 Step 간 뒤로가기 작동
- **→ 완료 후 보고 및 승인 대기**

---

## Sprint 4. 트렌드 디스커버 페이지 개편

### 현재 문제
- 카테고리 구분 없이 단일 검색만 존재
- 해시태그 트렌드 탭 없음

### 새 Discover 페이지 구조

```
┌──────────────────────────────────────────────────┐
│  트렌드 디스커버                                   │
│  북미 K-뷰티 TikTok 트렌드를 실시간으로 탐색하세요  │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │  [💄 뷰티] [🌿 라이프스타일] [🎬 Vlog]       │ │  ← 카테고리 탭
│  │  [🔍 키워드 검색]                            │ │  ← 검색 탭
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ── 뷰티 탭 선택 시 ──                            │
│                                                  │
│  🔥 인기 해시태그                                  │
│  #kbeauty 2.4M  #glassskin 1.8M  #grwm 1.2M    │
│                                                  │
│  최신 인기 영상                                    │
│  [카드] [카드] [카드] [카드] [카드] [카드]          │
│                                                  │
│  ── 키워드 검색 탭 선택 시 ──                      │
│                                                  │
│  [검색창: #kbeauty, #grwm...] [검색 버튼]         │
│  [카드] [카드] [카드] ...                          │
└──────────────────────────────────────────────────┘
```

### 구현 상세

**카테고리별 기본 해시태그**:
```typescript
const CATEGORY_HASHTAGS = {
  beauty: {
    label: '💄 뷰티',
    hashtags: ['kbeauty', 'skincare', 'glassskin', 'grwm'],
    topTags: [
      { tag: '#kbeauty', count: '2.4M' },
      { tag: '#glassskin', count: '1.8M' },
      { tag: '#grwm', count: '1.2M' },
      { tag: '#skincare', count: '980K' },
      { tag: '#koreanmakeup', count: '760K' },
    ]
  },
  lifestyle: {
    label: '🌿 라이프스타일',
    hashtags: ['lifestyle', 'morningroutine', 'dayinmylife', 'wellness'],
    topTags: [
      { tag: '#morningroutine', count: '3.1M' },
      { tag: '#dayinmylife', count: '2.7M' },
      { tag: '#wellness', count: '1.9M' },
      { tag: '#selfcare', count: '1.4M' },
      { tag: '#routinevlog', count: '890K' },
    ]
  },
  vlog: {
    label: '🎬 Vlog',
    hashtags: ['vlog', 'koreandaily', 'seoulvlog', 'studyvlog'],
    topTags: [
      { tag: '#vlog', count: '4.2M' },
      { tag: '#koreandaily', count: '1.6M' },
      { tag: '#seoulvlog', count: '1.1M' },
      { tag: '#studyvlog', count: '870K' },
      { tag: '#koreanlifestyle', count: '640K' },
    ]
  }
}
```

**탭 전환 시 동작**:
- 카테고리 탭: `getTrends(category)` 호출 → 로딩 → 카드 그리드 + 해시태그 뱃지 표시
- 키워드 검색 탭: 기존 검색창 UI (현재 방식 유지)
- 탭 전환 시 이전 결과 초기화

**해시태그 뱃지 UI** (인기 해시태그 영역):
```
[#kbeauty 2.4M] [#glassskin 1.8M] [#grwm 1.2M] [#skincare 980K]
```
- 클릭 시 해당 해시태그로 바로 검색 실행

**완료 기준**:
- 4개 탭 (뷰티/라이프스타일/Vlog/키워드검색) 전환 작동
- 각 카테고리별 인기 해시태그 뱃지 표시
- 해시태그 뱃지 클릭 → 해당 키워드 검색 자동 실행
- **→ 완료 후 최종 보고**

---

## 전체 파일 변경 범위

| Sprint | 파일 | 작업 |
|--------|------|------|
| 3 | `src/components/VideoModal.tsx` | 신규 생성 |
| 3 | `src/api/analyze.ts` | 신규 생성 |
| 3 | `src/App.tsx` | VideoModal import + Generate 페이지 쿼리스트링 수신 |
| 4 | `src/App.tsx` | Discover 컴포넌트 카테고리 탭 추가 |

---

## 주의사항
- Sprint 3 완료 확인 후 Sprint 4 시작
- 모달은 페이지 이동 없이 내부 step 전환으로 구현 (UX 일관성)
- Apify 호출 시 로딩 상태 반드시 표시 (30~60초 소요)
- `.env`의 API 키 절대 코드에 하드코딩 금지
- 기존 다크 테마 유지
