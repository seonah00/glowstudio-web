import { Video } from './tiktok'

export interface AnalysisResult {
  viral_reason: string
  hook_analysis: string
  hook_type: string
  best_elements: string[]
  target_audience: string
  trend_keywords: string[]
  score: number
}

const MOCK_RESULTS: AnalysisResult[] = [
  {
    viral_reason: '첫 3초에 반전 결말을 예고하는 궁금증형 후킹으로 시청자를 붙잡았습니다. K-뷰티 특유의 비포/애프터 공식과 저렴한 가격 언급이 공유 욕구를 자극했습니다.',
    hook_analysis: '영상 첫 컷에서 결과물(글로우 스킨)을 먼저 보여주고 과정을 역순으로 풀어가는 구조로 완주율을 높였습니다.',
    hook_type: '궁금증형',
    best_elements: ['짧은 영상 길이로 높은 완주율', '인기 해시태그 조합', '구체적인 가격/제품명 언급'],
    target_audience: 'Gen Z 여성, 스킨케어 입문자, K-뷰티 관심층',
    trend_keywords: ['kbeauty', 'glassskin', 'affordable'],
    score: 85,
  },
  {
    viral_reason: '공감형 스토리텔링으로 시청자의 경험과 연결했습니다. 실제 사용 후기 형식이 신뢰도를 높이고 댓글 참여를 유도했습니다.',
    hook_analysis: '일상적인 문제 상황으로 시작해 해결책을 제시하는 구조가 공감을 유발했습니다.',
    hook_type: '공감형',
    best_elements: ['자연스러운 데일리룩 연출', '실제 사용 전후 비교', '친근한 말투와 자막'],
    target_audience: '밀레니얼~Gen Z 여성, 뷰티 루틴 관심층',
    trend_keywords: ['morningroutine', 'grwm', 'skincare'],
    score: 78,
  },
]

export async function analyzeVideo(video: Video): Promise<AnalysisResult> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) return getMockResult(video)

  const er = video.playCount
    ? (((video.diggCount + (video.commentCount || 0)) / video.playCount) * 100).toFixed(1)
    : '0'

  const prompt = `당신은 TikTok 바이럴 콘텐츠 전문가입니다. 아래 TikTok 영상 데이터를 분석해주세요.

영상 정보:
- 제목/캡션: ${video.text}
- 조회수: ${video.playCount.toLocaleString()}
- 좋아요: ${video.diggCount.toLocaleString()}
- 댓글: ${video.commentCount?.toLocaleString() ?? 0}
- 참여율: ${er}%
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
JSON만 반환하고 다른 텍스트는 없이.`

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
        max_tokens: 1000,
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
  return { ...base, score: 70 + (video.playCount % 30) }
}
