# TASK_SPRINT9.md — Railway 백엔드 + 영상 프레임 분석

> Claude Code에 붙여넣고: "TASK_SPRINT9.md 읽고 9-A부터 순서대로 진행해줘. 각 완료 후 보고하고 승인 받아."

---

## 전체 아키텍처

```
[프론트엔드 - Vite/React]
        ↓ POST /analyze/video
[Railway 백엔드 - Node.js + Express]
        ↓ Apify Actor 호출
[Apify - TikTok 영상 다운로드 (mp4 URL)]
        ↓ ffmpeg으로 프레임 추출 (6장)
[Claude Vision API - 이미지 분석]
        ↓ JSON 분석 결과 반환
[프론트엔드 - 분석 결과 표시]
```

---

## Sprint 9-A. 백엔드 서버 구축

### 새 폴더 생성: `glowstudio-server/` (프론트엔드와 별도 레포 또는 같은 레포 내 폴더)

### 파일 구조
```
glowstudio-server/
├── package.json
├── .env
├── .gitignore
├── Dockerfile          ← Railway 배포용
├── railway.toml        ← Railway 설정
└── src/
    ├── index.ts        ← Express 서버 진입점
    ├── routes/
    │   └── analyze.ts  ← /analyze/video 라우트
    └── services/
        ├── apify.ts    ← Apify 영상 다운로드
        ├── ffmpeg.ts   ← 프레임 추출
        └── claude.ts   ← Claude Vision 분석
```

### `package.json`
```json
{
  "name": "glowstudio-server",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0",
    "fluent-ffmpeg": "^2.1.2",
    "@ffmpeg-installer/ffmpeg": "^1.1.0",
    "form-data": "^4.0.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/fluent-ffmpeg": "^2.1.24",
    "ts-node-dev": "^2.0.0"
  }
}
```

### `src/index.ts`
```typescript
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import analyzeRouter from './routes/analyze'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://glowstudio-web.vercel.app', // 배포 후 실제 URL로 교체
    /\.vercel\.app$/,
  ]
}))
app.use(express.json())

app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }))
app.use('/analyze', analyzeRouter)

app.listen(PORT, () => console.log(`GlowStudio Server running on :${PORT}`))
```

### `src/services/apify.ts`
```typescript
import axios from 'axios'

const APIFY_TOKEN = process.env.APIFY_API_KEY!

// TikTok URL로 영상 mp4 다운로드 URL 가져오기
export async function getTikTokVideoUrl(tiktokUrl: string): Promise<{
  videoUrl: string
  coverUrl: string
  text: string
  playCount: number
  diggCount: number
  commentCount: number
  duration: number
  authorName: string
}> {
  // Apify TikTok Scraper로 단일 영상 정보 가져오기
  const runUrl = `https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=60`

  const res = await axios.post(runUrl, {
    postURLs: [tiktokUrl],
    shouldDownloadVideos: true,   // 영상 다운로드 URL 포함
    shouldDownloadCovers: true,
    maxItems: 1,
  })

  const item = res.data[0]
  if (!item) throw new Error('영상 정보를 가져올 수 없습니다')

  return {
    videoUrl: item.videoUrl || item.video?.downloadAddr || '',
    coverUrl: item.videoMeta?.coverUrl || item.video?.cover || '',
    text: item.text || item.desc || '',
    playCount: item.playCount || 0,
    diggCount: item.diggCount || 0,
    commentCount: item.commentCount || 0,
    duration: item.videoMeta?.duration || 0,
    authorName: item.authorMeta?.name || '',
  }
}
```

### `src/services/ffmpeg.ts`
```typescript
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import os from 'os'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

// 영상 URL에서 특정 시간대 프레임을 base64 이미지로 추출
export async function extractFrames(videoUrl: string, duration: number): Promise<string[]> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'glowstudio-'))

  try {
    // 1. 영상 다운로드 (처음 30초만)
    const videoPath = path.join(tmpDir, 'video.mp4')
    const response = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    fs.writeFileSync(videoPath, response.data)

    // 2. 프레임 추출 시점 계산
    // 후킹(0.5초), 후킹끝(2초), 전반(duration*0.25), 중반(duration*0.5), 후반(duration*0.75), 마무리(duration-1초)
    const timestamps = [
      0.5,
      2.0,
      Math.min(duration * 0.25, duration - 1),
      Math.min(duration * 0.5, duration - 1),
      Math.min(duration * 0.75, duration - 1),
      Math.max(duration - 1.5, 3),
    ].filter((t, i, arr) => arr.indexOf(t) === i) // 중복 제거

    // 3. 각 시점에서 프레임 추출
    const frames: string[] = []
    for (let i = 0; i < timestamps.length; i++) {
      const framePath = path.join(tmpDir, `frame_${i}.jpg`)
      await extractSingleFrame(videoPath, timestamps[i], framePath)
      if (fs.existsSync(framePath)) {
        const base64 = fs.readFileSync(framePath).toString('base64')
        frames.push(base64)
      }
    }

    return frames
  } finally {
    // 임시 파일 정리
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

function extractSingleFrame(videoPath: string, timestamp: number, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .seekInput(timestamp)
      .frames(1)
      .size('720x?')           // 가로 720px, 세로 비율 유지
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run()
  })
}
```

### `src/services/claude.ts`
```typescript
import axios from 'axios'

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!

interface VideoMetadata {
  text: string
  playCount: number
  diggCount: number
  commentCount: number
  duration: number
  authorName: string
}

export interface FrameAnalysisResult {
  viral_score: number
  hook_analysis: {
    type: string              // 후킹 유형
    description: string       // 첫 3초 실제 장면 설명
    visual_hook: string       // 시각적 후킹 요소 (실제 영상 기반)
    text_overlay: string      // 화면 텍스트/자막 내용
    script_example: string    // 이 후킹을 따라할 수 있는 스크립트 예시
  }
  visual_analysis: {
    camera_angle: string      // 카메라 각도 (정면/측면/위에서/아래서)
    distance: string          // 거리 (클로즈업/미디엄/풀샷)
    lighting: string          // 조명 (자연광/링라이트/스튜디오)
    background: string        // 배경 구성
    product_appearance: string // 제품이 언제/어떻게 등장하는지
    editing_pace: string      // 편집 속도 (빠름/보통/느림)
  }
  content_structure: {
    scene_breakdown: SceneDescription[]  // 씬별 설명
    key_moments: string[]                // 핵심 포인트 시점
  }
  viral_factors: string[]     // 바이럴 요인 (실제 영상 기반)
  copyable_elements: string[] // 따라할 수 있는 요소
  shooting_tips: string[]     // 이 스타일로 찍으려면
  weak_points: string[]       // 아쉬운 점
  target_audience: string
  recommended_improvements: string[]
}

interface SceneDescription {
  timeRange: string
  visual: string    // 실제 보이는 것
  purpose: string   // 이 씬의 역할
}

export async function analyzeFrames(
  frames: string[],
  metadata: VideoMetadata
): Promise<FrameAnalysisResult> {

  // 프레임을 Claude Vision API 메시지로 변환
  const imageContent = frames.map((base64, i) => ({
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: 'image/jpeg' as const,
      data: base64,
    },
  }))

  const prompt = `당신은 TikTok 바이럴 콘텐츠 전문 분석가입니다.
위 이미지들은 하나의 TikTok 영상에서 추출한 프레임입니다.
순서대로: 0.5초, 2초, 25%, 50%, 75%, 마지막 부분입니다.

영상 메타데이터:
- 캡션: ${metadata.text}
- 조회수: ${metadata.playCount.toLocaleString()}
- 좋아요: ${metadata.diggCount.toLocaleString()}
- 댓글: ${metadata.commentCount.toLocaleString()}
- 참여율: ${(((metadata.diggCount + metadata.commentCount) / metadata.playCount) * 100).toFixed(2)}%
- 길이: ${metadata.duration}초
- 크리에이터: @${metadata.authorName}

실제 영상 프레임을 직접 보고 분석하세요. 추측이 아닌 실제로 보이는 것을 기반으로 작성하세요.

아래 JSON 형식으로만 응답 (순수 JSON, 마크다운 없이):
{
  "viral_score": 85,
  "hook_analysis": {
    "type": "궁금증형/충격형/공감형/정보형/도전형 중 하나",
    "description": "첫 2초 프레임에서 실제로 보이는 장면을 구체적으로 설명. 어떤 표정, 어떤 행동, 어떤 텍스트가 화면에 보이는지",
    "visual_hook": "시청자가 멈추게 만드는 시각적 요소 (실제 프레임 기반)",
    "text_overlay": "화면에 보이는 텍스트/자막/스티커 내용 (없으면 '없음')",
    "script_example": "이 후킹 방식을 내 영상에 적용하는 스크립트 예시 (한국어)"
  },
  "visual_analysis": {
    "camera_angle": "정면/측면/위에서/아래서 + 구체적 설명",
    "distance": "클로즈업/미디엄샷/풀샷 + 피사체와의 거리감",
    "lighting": "자연광/링라이트/스튜디오조명/역광 등 + 빛의 방향",
    "background": "배경에 보이는 것들, 정리 상태, 색감",
    "product_appearance": "제품이 몇 초에 어떻게 등장하는지, 어떻게 보여주는지",
    "editing_pace": "프레임 변화 빈도 기반 편집 속도 분석"
  },
  "content_structure": {
    "scene_breakdown": [
      { "timeRange": "0~3초", "visual": "실제 보이는 것", "purpose": "이 씬의 역할" },
      { "timeRange": "3~15초", "visual": "...", "purpose": "..." },
      { "timeRange": "15~끝", "visual": "...", "purpose": "..." }
    ],
    "key_moments": ["핵심 포인트1", "핵심 포인트2", "핵심 포인트3"]
  },
  "viral_factors": [
    "실제 영상에서 확인된 바이럴 요인1",
    "바이럴 요인2",
    "바이럴 요인3",
    "바이럴 요인4"
  ],
  "copyable_elements": [
    "당장 따라할 수 있는 요소1 (구체적으로)",
    "따라할 수 있는 요소2",
    "따라할 수 있는 요소3"
  ],
  "shooting_tips": [
    "이 스타일로 촬영하려면 팁1",
    "촬영 팁2",
    "촬영 팁3",
    "촬영 팁4"
  ],
  "weak_points": ["아쉬운 점1", "아쉬운 점2"],
  "target_audience": "실제 영상 내용 기반 타겟 시청자 분석",
  "recommended_improvements": ["개선 제안1", "개선 제안2", "개선 제안3"]
}`

  const res = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-opus-4-5-20251001',  // Vision 분석은 Opus 사용 (더 정확)
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          ...imageContent,
          { type: 'text', text: prompt }
        ]
      }]
    },
    {
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      }
    }
  )

  const text = res.data.content?.[0]?.text || '{}'
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}
```

### `src/routes/analyze.ts`
```typescript
import { Router, Request, Response } from 'express'
import { getTikTokVideoUrl } from '../services/apify'
import { extractFrames } from '../services/ffmpeg'
import { analyzeFrames } from '../services/claude'

const router = Router()

router.post('/video', async (req: Request, res: Response) => {
  const { tiktokUrl } = req.body

  if (!tiktokUrl || !tiktokUrl.includes('tiktok.com')) {
    return res.status(400).json({ error: '유효한 TikTok URL을 입력하세요' })
  }

  try {
    // Step 1: Apify로 영상 정보 + 다운로드 URL 가져오기
    console.log('[1/3] Apify로 영상 정보 수집 중...')
    const videoInfo = await getTikTokVideoUrl(tiktokUrl)

    if (!videoInfo.videoUrl) {
      throw new Error('영상 다운로드 URL을 가져올 수 없습니다')
    }

    // Step 2: ffmpeg으로 프레임 추출
    console.log('[2/3] 프레임 추출 중...')
    const frames = await extractFrames(videoInfo.videoUrl, videoInfo.duration)

    if (frames.length === 0) {
      throw new Error('프레임 추출에 실패했습니다')
    }

    // Step 3: Claude Vision으로 분석
    console.log('[3/3] Claude Vision 분석 중...')
    const analysis = await analyzeFrames(frames, {
      text: videoInfo.text,
      playCount: videoInfo.playCount,
      diggCount: videoInfo.diggCount,
      commentCount: videoInfo.commentCount,
      duration: videoInfo.duration,
      authorName: videoInfo.authorName,
    })

    return res.json({
      success: true,
      videoInfo: {
        coverUrl: videoInfo.coverUrl,
        text: videoInfo.text,
        playCount: videoInfo.playCount,
        diggCount: videoInfo.diggCount,
        commentCount: videoInfo.commentCount,
        duration: videoInfo.duration,
        authorName: videoInfo.authorName,
      },
      analysis,
      framesAnalyzed: frames.length,
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '분석 중 오류 발생'
    console.error('분석 오류:', msg)
    return res.status(500).json({ error: msg })
  }
})

export default router
```

### `Dockerfile`
```dockerfile
FROM node:20-slim

# ffmpeg 설치
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
```

### `railway.toml`
```toml
[build]
builder = "DOCKERFILE"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
```

### `.env` (서버용)
```
APIFY_API_KEY=apify_api_xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
PORT=3001
```

---

## Sprint 9-B. 프론트엔드 연동

### `src/api/analyze.ts` 수정

기존 Claude API 직접 호출 → 백엔드 서버 호출로 교체:

```typescript
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export async function analyzeVideoWithFrames(tiktokUrl: string) {
  const res = await fetch(`${SERVER_URL}/analyze/video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tiktokUrl }),
    signal: AbortSignal.timeout(120000), // 최대 2분 (프레임 추출 + 분석 시간)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || '분석 실패')
  }
  return res.json()
}
```

### `src/components/VideoModal.tsx` — Step 2 로딩 UI 개선

분석 3단계 진행 표시:
```
┌─────────────────────────────────────┐
│                                     │
│  🔍 영상 다운로드 중...   ✓ 완료     │
│  🎞 프레임 추출 중...    ⏳ 진행중   │
│  🤖 AI 비전 분석 중...   ○ 대기     │
│                                     │
│  ████████████░░░░░░░  약 60~90초    │
│                                     │
│  실제 영상 프레임을 직접 분석합니다   │
│                                     │
└─────────────────────────────────────┘
```

단계별 메시지 전환 (타이머 기반):
- 0~20초: "영상 다운로드 중..."
- 20~50초: "프레임 추출 중... (6장)"
- 50초~: "Claude Vision으로 분석 중..."

### `.env` (프론트엔드)에 추가
```
VITE_SERVER_URL=https://glowstudio-server.railway.app  # 배포 후 실제 URL
```

---

## Sprint 9-C. Railway 배포

Claude Code에서 Railway CLI로 배포:
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# glowstudio-server 폴더에서
cd glowstudio-server
railway init
railway up

# 환경변수 설정
railway variables set APIFY_API_KEY=apify_api_xxxxx
railway variables set ANTHROPIC_API_KEY=sk-ant-xxxxx

# 배포 URL 확인
railway status
```

배포 완료 후:
1. Railway에서 발급된 URL을 복사
2. 프론트엔드 `.env`의 `VITE_SERVER_URL` 업데이트
3. 프론트엔드 재빌드 후 Vercel 재배포

---

## 진행 순서
```
9-A: 백엔드 서버 구축 + 로컬 테스트 → 보고 → 승인
9-B: 프론트엔드 연동 + 로컬 통합 테스트 → 보고 → 승인
9-C: Railway 배포 + 실제 URL 연동 → 보고 → 최종 확인
```

## 주의사항
- 서버 `.env`는 절대 Git 커밋 금지 (`.gitignore`에 추가)
- ffmpeg 프레임 추출 후 임시 파일 반드시 삭제 (디스크 용량)
- Railway 무료 플랜: 월 500시간 제한 → 사용량 모니터링
- 분석 1회당 예상 비용: Apify ~$0.05 + Claude Opus ~$0.10 = 약 $0.15
- 로컬 테스트 시 `ffmpeg` 설치 필요: `winget install ffmpeg` (Windows)
