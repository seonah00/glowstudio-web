import { Video } from './tiktok'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

// ── 백엔드(Vision 기반) 분석 결과 타입 ──

export interface SceneDescription {
  timeRange: string
  visual: string
  purpose: string
}

export interface FrameAnalysisResult {
  viral_score: number
  hook_analysis: {
    type: string
    description: string
    visual_hook: string
    text_overlay: string
    script_example: string
  }
  visual_analysis: {
    camera_angle: string
    distance: string
    lighting: string
    background: string
    product_appearance: string
    editing_pace: string
  }
  content_structure: {
    scene_breakdown: SceneDescription[]
    key_moments: string[]
  }
  viral_factors: string[]
  copyable_elements: string[]
  shooting_tips: string[]
  weak_points: string[]
  target_audience: string
  recommended_improvements: string[]
}

export interface ServerAnalysisResponse {
  success: boolean
  videoInfo: {
    coverUrl: string
    text: string
    playCount: number
    diggCount: number
    commentCount: number
    duration: number
    authorName: string
  }
  analysis: FrameAnalysisResult
  framesAnalyzed: number
}

export async function analyzeVideoWithFrames(tiktokUrl: string): Promise<ServerAnalysisResponse> {
  const res = await fetch(`${SERVER_URL}/analyze/video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tiktokUrl }),
    signal: AbortSignal.timeout(120000),
  })
  if (!res.ok) {
    const err = await res.json() as { error?: string }
    throw new Error(err.error || '분석 실패')
  }
  return res.json() as Promise<ServerAnalysisResponse>
}

export interface AnalysisResult {
  viral_score: number
  viral_reason: string
  hook_analysis: string
  hook_type: string
  hook_script_example: string
  content_structure: string
  algorithm_factors: string[]
  best_elements: string[]
  weak_points: string[]
  target_audience: string
  trend_keywords: string[]
  copyable_formula: string
  recommended_length: number
  recommended_posting_time: string
}

const MOCK_RESULTS: AnalysisResult[] = [
  {
    viral_score: 85,
    viral_reason: '첫 3초에 반전 결말을 예고하는 궁금증형 후킹으로 시청자의 이탈을 막았습니다. K-뷰티 특유의 비포/애프터 공식이 시각적 만족감을 제공하고, 구체적인 가격 언급($10 이하)이 접근성에 대한 심리적 장벽을 낮춰 공유 욕구를 강하게 자극했습니다. TikTok 알고리즘이 선호하는 높은 완주율과 댓글 참여율을 동시에 달성했습니다.',
    hook_analysis: '영상 첫 컷에서 "이거 절대 사면 안 돼요"라는 역설적 문장으로 시청자의 호기심을 즉시 자극했습니다. 결과물(글로우 스킨)을 먼저 보여주고 과정을 역순으로 풀어가는 구조가 완주율을 높이는 핵심 전략입니다. 시청자는 "왜 사면 안 되는지"를 알기 위해 끝까지 시청하게 됩니다.',
    hook_type: '궁금증형',
    hook_script_example: '"이거 절대 사면 안 돼요, 근데 저는 매일 써요"',
    content_structure: '도입(0~3초): 역설적 주장으로 강렬한 첫인상 → 전개(3~35초): 제품 실연과 실제 피부 변화 비교 → 결말(35~45초): CTA + 팔로우 유도로 자연스럽게 마무리. 기승전결이 명확해 시청자가 다음 장면을 기대하며 이탈하지 않습니다.',
    algorithm_factors: ['90% 이상 높은 완주율로 알고리즘 부스트 수혜', '댓글 유도 CTA("피부 타입 알려주면")로 상호작용 극대화', '인기 해시태그 3개 이상 조합으로 디스커버리 페이지 노출'],
    best_elements: ['짧은 영상 길이(32초)로 완주율 극대화', '비포/애프터 대비 편집으로 시각적 임팩트 강화', '구체적 가격 언급으로 접근성 강조', '친근하고 자연스러운 말투로 신뢰감 형성'],
    weak_points: ['자막 없어 청각 장애인 및 무음 시청자 접근 어려움', '제품 구매 링크 미포함으로 전환율 손실 가능성'],
    target_audience: 'Gen Z~밀레니얼 여성(18~32세), 스킨케어 입문자, 가성비 K-뷰티 관심층. 저렴한 가격에 효과적인 제품을 찾는 심리적 니즈를 가진 시청자층.',
    trend_keywords: ['kbeauty', 'glassskin', 'affordable', 'skincareroutine'],
    copyable_formula: '역설적 제목("절대 사면 안 돼요 + 근데 저는 써요") + 결과 먼저 공개 + 과정 역순 구조를 내 제품에 그대로 적용 가능합니다. 핵심은 첫 문장에서 시청자가 "왜?"라고 궁금해하게 만드는 것입니다.',
    recommended_length: 45,
    recommended_posting_time: '오후 7시~9시 (EST 기준)',
  },
  {
    viral_score: 78,
    viral_reason: '공감형 스토리텔링으로 시청자 자신의 경험과 직접 연결했습니다. "나도 저랬는데"라는 심리적 동일시가 강한 감정 반응을 유발했고, 실제 사용 후기 형식이 광고가 아닌 진짜 추천처럼 느껴져 신뢰도를 높였습니다. 댓글에서 자신의 경험을 공유하고 싶은 욕구를 자극해 높은 참여율로 이어졌습니다.',
    hook_analysis: '일상적인 피부 고민(건조함, 칙칙함)으로 시작해 시청자가 즉각적으로 공감할 수 있는 문제를 제시했습니다. "저만 이런가요?"라는 질문 형식이 댓글 참여를 유도하는 강력한 심리적 장치입니다.',
    hook_type: '공감형',
    hook_script_example: '"저도 작년까지 스킨케어 아무것도 몰랐는데, 이 루틴 시작하고 나서..."',
    content_structure: '도입(0~5초): 공감 유발 문제 제시 → 전개(5~50초): 단계별 루틴 시연과 피부 변화 → 결말(50~60초): 팔로우 유도 + 다음 편 예고로 연속 시청 유도.',
    algorithm_factors: ['댓글에서 경험 공유 유발로 상호작용 점수 상승', '저장율 높은 "루틴" 콘텐츠 형식', '시리즈물 구조로 팔로우 전환율 향상'],
    best_elements: ['자연스러운 데일리룩 연출로 광고 거부감 제거', '실제 사용 전후 비교로 제품 효과 입증', '친근한 말투와 자막으로 무음 시청 대응', '단계별 구성으로 저장 욕구 자극'],
    weak_points: ['영상 길이가 길어 완주율 하락 위험', '해시태그 선택이 너무 광범위해 타겟 집중도 낮음'],
    target_audience: '밀레니얼~Gen Z 여성(22~35세), 뷰티 루틴 관심층, SNS에서 실제 후기를 찾는 소비자. 광고보다 진짜 사용 경험을 신뢰하는 심리적 특성.',
    trend_keywords: ['morningroutine', 'grwm', 'skincare', 'kbeauty'],
    copyable_formula: '"나도 몰랐는데 + 발견한 루틴/제품 + 변화" 구조를 내 스킨케어 제품에 적용하세요. 핵심은 전문가가 아닌 동네 친구가 추천하는 톤앤매너를 유지하는 것입니다.',
    recommended_length: 55,
    recommended_posting_time: '오전 7시~9시 (EST 기준)',
  },
]

export async function analyzeVideo(video: Video): Promise<AnalysisResult> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) return getMockResult(video)

  const er = video.playCount
    ? (((video.diggCount + (video.commentCount || 0)) / video.playCount) * 100).toFixed(2)
    : '0'

  const prompt = `당신은 TikTok 바이럴 콘텐츠 전략 전문가입니다.
아래 영상 데이터를 심층 분석해서 크리에이터가 실제로 활용할 수 있는 인사이트를 제공하세요.

영상 데이터:
- 캡션: ${video.text}
- 조회수: ${video.playCount.toLocaleString()}
- 좋아요: ${video.diggCount.toLocaleString()}
- 댓글: ${(video.commentCount || 0).toLocaleString()}
- 공유: ${(video.shareCount || 0).toLocaleString()}
- 참여율: ${er}%
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
}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) return getMockResult(video)
    const data = await res.json()
    const text = data.content?.[0]?.text || '{}'
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return getMockResult(video)
  }
}

function getMockResult(video: Video): AnalysisResult {
  const base = MOCK_RESULTS[video.id.charCodeAt(0) % MOCK_RESULTS.length]
  return { ...base, viral_score: 70 + (video.playCount % 30) }
}
