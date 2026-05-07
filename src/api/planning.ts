import { Video } from './tiktok'

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export interface PlanningAnalysis {
  hookType: string
  hookDescription: string
  viralFactors: string[]
  copyableElements: string[]
}

export interface PlanningInput {
  referenceVideo: Video
  analysis: PlanningAnalysis
  myProduct: string
  myTone?: string
  duration: number
}

export interface PlanningScene {
  sceneNum: number
  timeRange: string
  role: string
  description: string
}

export interface PlanningResult {
  concept: string
  hookStrategy: string
  scenes: PlanningScene[]
  shootingPoints: string[]
  hashtags: string[]
  titleOptions: string[]
}

export async function generatePlanning(input: PlanningInput): Promise<PlanningResult> {
  const engagementRate = input.referenceVideo.playCount > 0
    ? (((input.referenceVideo.diggCount + (input.referenceVideo.commentCount || 0)) / input.referenceVideo.playCount) * 100).toFixed(1)
    : '0'

  const prompt = `당신은 TikTok 콘텐츠 기획 전문가입니다.
아래 참고 영상의 성공 공식을 분석하고,
사용자의 제품에 맞게 재구성한 기획안을 작성하세요.

참고 영상 정보:
- 크리에이터: @${input.referenceVideo.authorMeta.name}
- 캡션: ${input.referenceVideo.text}
- 조회수: ${input.referenceVideo.playCount.toLocaleString()}
- 참여율: ${engagementRate}%
- 길이: ${input.referenceVideo.videoMeta.duration}초

AI 분석 결과:
- 후킹 유형: ${input.analysis.hookType}
- 후킹 전략: ${input.analysis.hookDescription}
- 잘된 요소: ${input.analysis.viralFactors.join(', ')}
- 성공 공식: ${input.analysis.copyableElements.join(', ')}

내 정보:
- 제품/주제: ${input.myProduct}
- 채널 컨셉: ${input.myTone || '미지정'}
- 목표 영상 길이: ${input.duration}초

아래 JSON 형식으로만 응답 (순수 JSON, 마크다운 코드블록 없이):
{
  "concept": "참고 영상의 포맷을 내 제품에 적용한 영상 컨셉 설명 (2~3문장)",
  "hookStrategy": "참고 영상의 후킹 방식을 내 제품에 맞게 변형한 전략 (구체적으로)",
  "scenes": [
    { "sceneNum": 1, "timeRange": "0~3초", "role": "후킹", "description": "이 씬에서 할 구체적인 행동/멘트" },
    { "sceneNum": 2, "timeRange": "3~15초", "role": "문제 제기", "description": "..." },
    { "sceneNum": 3, "timeRange": "15~35초", "role": "솔루션/실연", "description": "..." },
    { "sceneNum": 4, "timeRange": "35~${input.duration}초", "role": "CTA", "description": "..." }
  ],
  "shootingPoints": [
    "참고 영상 스타일 기반 촬영 포인트 1 (구체적으로)",
    "촬영 포인트 2",
    "촬영 포인트 3",
    "편집 스타일 포인트"
  ],
  "hashtags": ["#관련해시태그1", "#해시태그2", "#해시태그3", "#해시태그4", "#해시태그5", "#해시태그6", "#해시태그7", "#해시태그8"],
  "titleOptions": [
    "캡션/제목 후보 1 (후킹형)",
    "캡션/제목 후보 2 (정보형)",
    "캡션/제목 후보 3 (공감형)"
  ]
}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`Claude API 오류 ${res.status}`)
  const data = await res.json()
  const text = data.content?.[0]?.text || '{}'
  return JSON.parse(text.replace(/```json|```/g, '').trim()) as PlanningResult
}
