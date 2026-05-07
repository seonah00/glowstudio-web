# TASK_SPRINT5_6.md — 분석 고도화 + 트렌드 페이지 개편

> Claude Code에 붙여넣고: "이 지시서대로 Sprint 5부터 순서대로 진행해줘. 각 스프린트 완료 후 멈추고 승인 받아."

---

## Sprint 5. AI 분석 결과 고도화 + 한 페이지 표시

### 문제
- 분석 내용이 너무 짧고 허술함
- 스크롤 없이 한 화면에 모든 내용 표시 필요

### 파일: `src/api/analyze.ts` 수정

프롬프트를 아래로 교체:

```typescript
const prompt = `
당신은 TikTok 바이럴 콘텐츠 전략 전문가입니다. 
아래 영상 데이터를 심층 분석해서 크리에이터가 실제로 활용할 수 있는 인사이트를 제공하세요.

영상 데이터:
- 캡션: ${video.text}
- 조회수: ${video.playCount.toLocaleString()}
- 좋아요: ${video.diggCount.toLocaleString()}
- 댓글: ${(video.commentCount||0).toLocaleString()}
- 공유: ${(video.shareCount||0).toLocaleString()}
- 참여율: ${(((video.diggCount+(video.commentCount||0))/ video.playCount)*100).toFixed(2)}%
- 영상 길이: ${video.videoMeta.duration}초
- 크리에이터: @${video.authorMeta.name}

아래 JSON 형식으로만 응답 (다른 텍스트 없이):
{
  "viral_score": 85,
  "viral_reason": "조회수가 높은 핵심 이유를 3~4문장으로 구체적으로 설명. 단순히 '좋아서'가 아니라 심리적 메커니즘, 알고리즘 요인, 콘텐츠 구조적 이유를 분석",
  "hook_analysis": "첫 1~3초 후킹 전략을 구체적으로 분석. 어떤 심리적 트리거를 사용했는지, 시청자가 왜 멈추게 되는지 3~4문장",
  "hook_type": "궁금증형 또는 충격형 또는 공감형 또는 정보형 또는 도전형",
  "hook_script_example": "이 후킹 유형을 적용한 첫 3초 스크립트 예시 1개 (한국어)",
  "content_structure": "영상 전체 구조 분석 - 도입/전개/결말이 어떻게 구성되었는지 2~3문장",
  "algorithm_factors": ["알고리즘 유리 요인1 (구체적으로)", "알고리즘 유리 요인2", "알고리즘 유리 요인3"],
  "best_elements": ["잘된 요소1 (구체적 이유 포함)", "잘된 요소2", "잘된 요소3", "잘된 요소4"],
  "weak_points": ["아쉬운 점1", "아쉬운 점2"],
  "target_audience": "타겟 시청자 상세 분석 - 연령대, 관심사, 심리적 니즈 포함",
  "trend_keywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3", "핵심키워드4"],
  "copyable_formula": "이 영상의 성공 공식을 다른 제품/주제에 적용하는 방법 2~3문장 (실용적 조언)",
  "recommended_length": 45,
  "recommended_posting_time": "오후 7시~9시 (EST 기준)"
}
`
```

### 파일: `src/components/VideoModal.tsx` — Step 2 UI 전면 개편

**한 화면에 모든 내용 표시 (스크롤 없이)**

레이아웃: 2컬럼 그리드로 콤팩트하게 배치

```
┌─────────────────────────────────────────────────┐
│ ← 뒤로        🔍 AI 분석 결과          [×] 닫기  │
│─────────────────────────────────────────────────│
│                                                 │
│  바이럴 점수  ████████████████░░░░  85/100       │
│                                                 │
│ ┌─────────────────┐  ┌─────────────────────────┐│
│ │ 🔥 왜 조회수가   │  │ 🎣 후킹 전략             ││
│ │ 높은가?         │  │ [태그: 궁금증형]          ││
│ │                 │  │                         ││
│ │ 공감형 스토리텔  │  │ 첫 3초에 반전 예고로      ││
│ │ 링으로 시청자의  │  │ 시청자를 붙잡음.          ││
│ │ 경험과 연결...  │  │                         ││
│ │                 │  │ 💬 후킹 스크립트 예시:    ││
│ │                 │  │ "이거 절대 사면 안 돼요,  ││
│ │                 │  │  근데 저는 매일 써요"     ││
│ └─────────────────┘  └─────────────────────────┘│
│                                                 │
│ ┌─────────────────┐  ┌─────────────────────────┐│
│ │ ✅ 잘된 요소     │  │ 📐 콘텐츠 구조           ││
│ │ • 자연스러운 연출 │  │                         ││
│ │ • 비포/애프터    │  │ 도입: 충격적 주장으로    ││
│ │ • 친근한 말투    │  │ 시작 → 전개: 제품 실연   ││
│ │ • 구체적 가격    │  │ → 결말: CTA + 팔로우 유도││
│ └─────────────────┘  └─────────────────────────┘│
│                                                 │
│ ┌─────────────────┐  ┌─────────────────────────┐│
│ │ 🤖 알고리즘 요인 │  │ 👥 타겟 시청자           ││
│ │ • 높은 완주율    │  │                         ││
│ │ • 댓글 유도 CTA  │  │ 밀레니얼~Gen Z 여성      ││
│ │ • 인기 해시태그  │  │ 뷰티 루틴 관심층         ││
│ └─────────────────┘  └─────────────────────────┘│
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 💡 성공 공식 복제 방법                        │ │
│ │ "반전형 제목 + 약사/전문가 신뢰도 + 실제 제품  │ │
│ │  실연 구조를 내 제품에 그대로 적용 가능..."    │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│  권장 길이: 45초   권장 게시 시간: 오후 7~9시     │
│                                                 │
│  [🎬 이 스타일로 내 영상 만들기 →]               │
└─────────────────────────────────────────────────┘
```

**구현 상세**:
- 모달 크기: `maxWidth: 680px`, `maxHeight: 90vh`, `overflowY: auto` (내용 많을 때만 스크롤)
- 2컬럼 그리드: `display: grid, gridTemplateColumns: '1fr 1fr', gap: 12`
- 각 카드: `background: rgba(255,255,255,0.04)`, `borderRadius: 12`, `padding: 16`
- 바이럴 점수 바: 애니메이션으로 채워지는 progress bar
- 후킹 유형 태그: 코랄 색상 뱃지
- 스크립트 예시: `background: rgba(255,107,107,0.08)` 박스로 강조
- 약점(weak_points)은 회색으로 표시

**완료 기준**: 분석 결과가 한 화면에 2컬럼으로 표시, 내용이 구체적으로 채워짐
**→ 완료 후 보고 및 승인 대기**

---

## Sprint 6. 트렌드 페이지 개편 — 30개 영상 + 실시간 해시태그 사이드바

### 파일: `src/App.tsx` — Discover 컴포넌트 전면 개편

### 전체 레이아웃 (2단 구조)

```
┌──────────────────────────────────────────────────────────────────┐
│  트렌드 디스커버                                                   │
│─────────────────────────────────────────────────────────────────│
│                                                                  │
│  [💄 뷰티] [🌿 라이프스타일] [🎬 Vlog] [🔍 키워드 검색]           │
│                                                                  │
│ ┌────────────────────────────────────┐ ┌──────────────────────┐  │
│ │                                    │ │  📈 실시간 트렌드      │  │
│ │  영상 그리드 (30개)                 │ │  2025년 5월 6일 기준  │  │
│ │                                    │ │                      │  │
│ │  [카드][카드][카드][카드]            │ │  🔥 인기 해시태그      │  │
│ │  [카드][카드][카드][카드]            │ │  1. #kbeauty  2.4M   │  │
│ │  [카드][카드][카드][카드]            │ │  2. #glassskin 1.8M  │  │
│ │  [카드][카드][카드][카드]            │ │  3. #grwm  1.2M      │  │
│ │  [카드][카드][카드][카드]            │ │  4. #skincare 980K   │  │
│ │  [카드][카드][카드][카드]            │ │  5. #over40  760K    │  │
│ │  [카드][카드][카드][카드]            │ │                      │  │
│ │  [카드][카드]                       │ │  ─────────────────   │  │
│ │                                    │ │  🌡 떠오르는 키워드    │  │
│ │                                    │ │  ↑ sluggingmethod    │  │
│ │                                    │ │  ↑ kbeautyover40     │  │
│ │                                    │ │  ↑ skincycling       │  │
│ │                                    │ │  ↑ glassrouting      │  │
│ │                                    │ │                      │  │
│ │                                    │ │  ─────────────────   │  │
│ │                                    │ │  ⏱ 마지막 업데이트    │  │
│ │                                    │ │  방금 전              │  │
│ └────────────────────────────────────┘ └──────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 구현 상세

**영상 그리드 (좌측, 약 75% 너비)**:
- `getTrends(category)` limit을 30으로 변경
- 카드 크기: 기존보다 약간 작게 (`minmax(160px, 1fr)`)
- 4열 그리드로 30개 표시
- 카테고리 전환 시 스켈레톤 로딩 30개 표시

**실시간 트렌드 사이드바 (우측, 약 25% 너비)**:
- `position: sticky, top: 80px` — 스크롤해도 사이드바는 고정

사이드바 데이터 구조:
```typescript
// src/api/trends.ts 신규 생성
// 날짜 기반으로 매일 다른 데이터 반환 (실제 API 없이 날짜 시드 방식)

const TREND_DATA = {
  beauty: {
    topHashtags: [
      { tag: '#kbeauty', count: '2.4M', change: 'up' },
      { tag: '#glassskin', count: '1.8M', change: 'up' },
      { tag: '#grwm', count: '1.2M', change: 'same' },
      { tag: '#skincare', count: '980K', change: 'down' },
      { tag: '#over40', count: '760K', change: 'up' },
      { tag: '#koreanmakeup', count: '640K', change: 'up' },
      { tag: '#dewyskim', count: '520K', change: 'new' },
    ],
    risingKeywords: ['sluggingmethod', 'kbeautyover40', 'skincycling', 'glassrouting'],
  },
  lifestyle: {
    topHashtags: [
      { tag: '#morningroutine', count: '3.1M', change: 'up' },
      { tag: '#dayinmylife', count: '2.7M', change: 'same' },
      { tag: '#wellness', count: '1.9M', change: 'up' },
      { tag: '#selfcare', count: '1.4M', change: 'up' },
      { tag: '#5amclub', count: '1.1M', change: 'new' },
      { tag: '#routinevlog', count: '890K', change: 'down' },
      { tag: '#mindfulness', count: '670K', change: 'up' },
    ],
    risingKeywords: ['5amclub', 'koreanwellness', 'quietluxury', 'slowliving'],
  },
  vlog: {
    topHashtags: [
      { tag: '#vlog', count: '4.2M', change: 'up' },
      { tag: '#koreandaily', count: '1.6M', change: 'up' },
      { tag: '#seoulvlog', count: '1.1M', change: 'same' },
      { tag: '#studyvlog', count: '870K', change: 'up' },
      { tag: '#koreanlifestyle', count: '640K', change: 'new' },
      { tag: '#workdayvlog', count: '510K', change: 'up' },
      { tag: '#cafevlog', count: '430K', change: 'up' },
    ],
    risingKeywords: ['seoulcafe', 'koreanoffice', 'hanokstay', 'gyeongbokgung'],
  },
}

// 날짜 기반 순위 섞기 (매일 다르게 보이도록)
export function getDailyTrends(category: 'beauty' | 'lifestyle' | 'vlog') {
  const today = new Date().toDateString() // 날짜가 바뀌면 다른 결과
  const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const data = TREND_DATA[category]
  // seed 기반으로 순위 약간 섞기 (상위 3개는 고정, 4~7위 순서 변동)
  const top3 = data.topHashtags.slice(0, 3)
  const rest = [...data.topHashtags.slice(3)].sort(() => (seed % 3) - 1)
  return {
    ...data,
    topHashtags: [...top3, ...rest],
    updatedAt: new Date().toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
  }
}
```

**사이드바 UI 상세**:
```
📈 실시간 트렌드
오늘 2025. 5. 6. 기준

🔥 인기 해시태그
┌────────────────────────────┐
│ 1  #kbeauty       2.4M  ↑ │  ← 초록 화살표
│ 2  #glassskin     1.8M  ↑ │
│ 3  #grwm          1.2M  — │  ← 회색 (동일)
│ 4  #skincare      980K  ↓ │  ← 빨간 화살표
│ 5  #over40        760K  ↑ │
│ 6  #koreanmakeup  640K  ↑ │
│ 7  #dewyskim      520K 🆕 │  ← 뉴 뱃지
└────────────────────────────┘

클릭 시 → 해당 해시태그로 키워드 검색 탭에서 바로 검색

🌡 떠오르는 키워드
[sluggingmethod] [kbeautyover40]
[skincycling] [glassrouting]

⏱ 마지막 업데이트: 14:32
```

**변동 아이콘**:
- `up`: `↑` 초록색 `#4ade80`
- `down`: `↓` 빨간색 `#f87171`
- `same`: `—` 회색
- `new`: `🆕` 뱃지

**해시태그 클릭 시**:
- 키워드 검색 탭으로 전환 + 해당 태그로 자동 검색 실행

**`getTrends` 함수 수정** (`src/api/tiktok.ts`):
- `limit` 파라미터를 30으로 변경
- `resultsPerPage: Math.ceil(30 / hashtags.length)`

**완료 기준**:
- 영상 30개 그리드 표시
- 우측 사이드바 sticky 고정
- 해시태그 순위 + 변동 화살표 표시
- 날짜 기반 매일 순위 변동
- 해시태그 클릭 → 자동 검색
- **→ 완료 후 최종 보고**

---

## 파일 변경 범위

| Sprint | 파일 | 작업 |
|--------|------|------|
| 5 | `src/api/analyze.ts` | 프롬프트 고도화 |
| 5 | `src/components/VideoModal.tsx` | Step2 UI 2컬럼 개편 |
| 6 | `src/api/trends.ts` | 신규 생성 (날짜 기반 트렌드 데이터) |
| 6 | `src/App.tsx` | Discover 2단 레이아웃, 사이드바 추가 |

---

## 주의사항
- Sprint 5 완료 확인 후 Sprint 6 시작
- 모달 최대 높이 `90vh` 초과 금지 (스크롤 허용)
- 사이드바는 `position: sticky`로 스크롤 시 고정
- 기존 다크 테마 컬러 유지
- `.env` API 키 절대 코드에 하드코딩 금지
