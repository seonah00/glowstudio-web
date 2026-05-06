export interface GenerateInput {
  referenceUrls: string[]
  productName: string
  productUrl?: string
  productFeatures?: string
  tone: string
  duration: number
  targetAudience: string
  language: 'both' | 'ko' | 'en'
  hookType?: string
}

export interface SceneGuide {
  timeRange: string
  description: string
  cameraAngle: string
  tip: string
}

export interface TimingGuide {
  time: string
  action: string
  koScript: string
  enScript: string
}

export interface ScriptOutput {
  ko: {
    hook: string
    body: string
    cta: string
    full: string
    hashtags: string[]
  }
  en: {
    hook: string
    body: string
    cta: string
    full: string
    hashtags: string[]
  }
  shootingGuide: {
    setup: string[]
    scenes: SceneGuide[]
    tips: string[]
    doList: string[]
    dontList: string[]
  }
  timing: TimingGuide[]
}

function getMockOutput(input: GenerateInput): ScriptOutput {
  const name = input.productName || '스킨케어 제품'
  return {
    ko: {
      hook: `"이거 절대 사면 안 되는 ${name}인데... 저는 매일 써요"`,
      body: `${name} 솔직 후기예요.\n민감성 피부인데 이거 바르고 나서 진짜 달라졌어요.\n수분감이 24시간 지속되고, 자극도 전혀 없어요.\n성분 보면 — 나이아신아마이드가 피부 톤을 밝혀주고,\n히알루론산이 수분을 꽉 잡아줘요.\n한 달 써보니까 피부가 확실히 달라지더라고요.`,
      cta: `댓글에 피부 타입 알려주시면 맞춤 루틴 공유해드릴게요! 🙌`,
      full: `"이거 절대 사면 안 되는 ${name}인데... 저는 매일 써요"\n\n${name} 솔직 후기예요.\n민감성 피부인데 이거 바르고 나서 진짜 달라졌어요.\n수분감이 24시간 지속되고, 자극도 전혀 없어요.\n\n댓글에 피부 타입 알려주시면 맞춤 루틴 공유해드릴게요! 🙌`,
      hashtags: ['#kbeauty', '#스킨케어', '#민감성피부', '#수분크림', '#피부루틴', '#글로우스킨', '#kbeautyroutine', '#skincareroutine', '#뷰티', '#추천'],
    },
    en: {
      hook: `"POV: you're about to find your new holy grail skincare product and it's literally life-changing 👀"`,
      body: `okay so I've been using ${name} for a month and NO CAP this is the real deal.\nI have sensitive skin and this doesn't break me out AT ALL.\n24-hour hydration? check. ✅\nno irritation? check. ✅\nthe niacinamide brightens your skin tone and the hyaluronic acid locks in moisture all day.\ny'all this is the K-beauty secret North America needs to know about.`,
      cta: `comment your skin type and I'll share my full routine! 🙌 follow for more K-beauty finds`,
      full: `"POV: you're about to find your new holy grail skincare product and it's literally life-changing 👀"\n\nokay so I've been using ${name} for a month and NO CAP this is the real deal.\nI have sensitive skin and this doesn't break me out AT ALL.\n24-hour hydration? check. ✅\nno irritation? check. ✅\n\ncomment your skin type and I'll share my full routine! 🙌 follow for more K-beauty finds`,
      hashtags: ['#kbeauty', '#koreanskincare', '#glassskin', '#skintok', '#skincare', '#sensitiveskin', '#hydration', '#kbeautyfinds', '#skincareroutine', '#grwm'],
    },
    shootingGuide: {
      setup: [
        '조명: 자연광(창가) 또는 링라이트 45도 각도 추천',
        '배경: 미니멀한 책상 또는 깔끔한 욕실 카운터',
        '카메라: 세로 9:16 고정, 눈높이 또는 약간 아래 각도',
      ],
      scenes: [
        { timeRange: `0~3초`, description: '제품을 손에 들고 카메라 정면을 바라보며 후킹 멘트 발화', cameraAngle: '눈높이, 상반신 클로즈업, 거리 50~60cm', tip: '첫 프레임부터 제품이 보여야 하고, 표정에 자신감이 넘쳐야 함' },
        { timeRange: `3~15초`, description: '제품 포장 및 텍스처 클로즈업, 성분 언급하며 설명', cameraAngle: '제품 클로즈업(위에서 내려다보는 버드아이 또는 정면)', tip: '제품에 빛이 자연스럽게 반사되도록 조명 조절' },
        { timeRange: `15~${Math.round(input.duration * 0.8)}초`, description: '실제 피부에 바르는 장면, 전후 비교 컷', cameraAngle: '얼굴 클로즈업, 발림 장면은 손+얼굴 함께', tip: '바르기 전·후 피부 비교가 핵심. 자연스러운 반응 연기' },
        { timeRange: `${Math.round(input.duration * 0.8)}~${input.duration}초`, description: '카메라 정면 바라보며 CTA 멘트', cameraAngle: '눈높이 정면 촬영', tip: '끝날 때 미소 + 고개 끄덕임으로 마무리' },
      ],
      tips: [
        '트렌딩 사운드 사용 권장 (TikTok 효과음 탭에서 선택)',
        '업로드 최적 시간: 오후 6~9시 EST 기준 (한국시간 오전 8~11시)',
        '첫 48시간이 알고리즘 결정 — 업로드 직후 30분 내 반응 유도 중요',
        '자막 추가 필수 (무음 시청자 40% 이상)',
        '색보정: 따뜻한 톤(+10 warmth) 추가 시 K-뷰티 감성 강화',
      ],
      doList: [
        '첫 1초 안에 얼굴 또는 제품 노출 (스크롤 스탑)',
        '자막 필수 — CapCut 자동 자막 기능 활용',
        '후킹 멘트는 빠르게, 에너지 높게 (느린 인트로 금지)',
      ],
      dontList: [
        '인트로에 채널 소개 금지 (바로 본론으로)',
        '너무 긴 침묵 구간 (1초 이상 침묵 편집으로 제거)',
        '화질 낮은 영상 (최소 1080p, 가능하면 4K)',
      ],
    },
    timing: [
      { time: '0~3초', action: '후킹', koScript: `"이거 절대 사면 안 돼요, 근데 저는 매일 써요"`, enScript: `"POV: about to share my holy grail K-beauty product 👀"` },
      { time: '3~15초', action: '제품 소개', koScript: `${name} 솔직 후기예요. 성분부터 살펴볼게요.`, enScript: `okay so let me break down why ${name} is different` },
      { time: `15~${Math.round(input.duration * 0.8)}초`, action: '실연/리뷰', koScript: '실제로 발라볼게요. 발림성이 진짜 미쳐요...', enScript: `I'm applying it now and the texture is literally so good` },
      { time: `${Math.round(input.duration * 0.8)}~${input.duration}초`, action: 'CTA', koScript: '댓글에 피부 타입 알려주시면 루틴 공유해드릴게요!', enScript: `comment your skin type and I got you! follow for more 🙌` },
    ],
  }
}

export async function generateScript(input: GenerateInput): Promise<ScriptOutput> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) return getMockOutput(input)

  const referenceContext = input.referenceUrls.filter(Boolean).length > 0
    ? `\n참고 영상 정보:\n${input.referenceUrls.filter(Boolean).map((url, i) => `영상${i + 1}: ${url}`).join('\n')}\n(위 영상들의 후킹 스타일, 구성 방식, 톤앤매너를 참고해서 스크립트 작성)\n`
    : ''

  const hookContext = input.hookType ? `\n분석된 후킹 유형: ${input.hookType}` : ''

  const prompt = `당신은 북미 TikTok K-뷰티 콘텐츠 전문 스크립트 라이터입니다.
아래 정보를 바탕으로 실제로 바로 촬영할 수 있는 스크립트를 작성하세요.

=== 입력 정보 ===
제품/주제: ${input.productName}
제품 링크: ${input.productUrl || '없음'}
제품 특징: ${input.productFeatures || '없음'}
영상 톤: ${input.tone}
영상 길이: ${input.duration}초
타겟: ${input.targetAudience}
${referenceContext}${hookContext}

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
    "body": "Full body script in ${input.duration}s length, North American TikTok style",
    "cta": "Closing CTA in English",
    "full": "Complete English script",
    "hashtags": ["#kbeauty", "#skincare", "10 relevant English hashtags for North America"]
  },
  "shootingGuide": {
    "setup": ["조명 세팅", "배경 세팅", "카메라 세팅"],
    "scenes": [
      { "timeRange": "0~3초", "description": "씬 설명", "cameraAngle": "카메라 각도", "tip": "촬영 팁" }
    ],
    "tips": ["편집 팁 1", "알고리즘 팁", "업로드 시간", "자막 팁", "음악 팁"],
    "doList": ["꼭 해야 할 것 1", "꼭 해야 할 것 2", "꼭 해야 할 것 3"],
    "dontList": ["하면 안 되는 것 1", "하면 안 되는 것 2", "하면 안 되는 것 3"]
  },
  "timing": [
    { "time": "0~3초", "action": "후킹", "koScript": "한국어 후킹 멘트", "enScript": "English hook" },
    { "time": "3~15초", "action": "제품 소개", "koScript": "...", "enScript": "..." },
    { "time": "15~${Math.round(input.duration * 0.8)}초", "action": "실연/리뷰", "koScript": "...", "enScript": "..." },
    { "time": "${Math.round(input.duration * 0.8)}~${input.duration}초", "action": "CTA", "koScript": "...", "enScript": "..." }
  ]
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
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) return getMockOutput(input)
    const data = await res.json()
    const text = data.content?.[0]?.text || '{}'
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return getMockOutput(input)
  }
}
