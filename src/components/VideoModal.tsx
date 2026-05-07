import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video } from '../api/tiktok'
import { analyzeVideo, analyzeVideoWithFrames, AnalysisResult, FrameAnalysisResult, ServerAnalysisResponse } from '../api/analyze'

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

interface Props {
  video: Video
  onClose: () => void
}

type Step = 1 | 2 | 3
type AnalyzePhase = 'download' | 'extract' | 'vision'

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, ...style }}>
      {children}
    </div>
  )
}

function CardLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: 0.5, ...style }}>{children}</p>
}

function CardText({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>{children}</p>
}

// ── 3단계 로딩 UI ──
function FrameLoadingUI({ phase, pct }: { phase: AnalyzePhase; pct: number }) {
  const steps: { key: AnalyzePhase; label: string; icon: string }[] = [
    { key: 'download', label: '영상 다운로드 중...', icon: '🔍' },
    { key: 'extract',  label: '프레임 추출 중... (6장)', icon: '🎞' },
    { key: 'vision',   label: 'Claude Vision으로 분석 중...', icon: '🤖' },
  ]
  const phaseOrder: AnalyzePhase[] = ['download', 'extract', 'vision']
  const currentIdx = phaseOrder.indexOf(phase)

  return (
    <div style={{ padding: '32px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
        {steps.map((s, i) => {
          const done = i < currentIdx
          const active = i === currentIdx
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, flexShrink: 0,
                background: done ? 'rgba(74,222,128,0.15)' : active ? 'rgba(255,107,107,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${done ? 'rgba(74,222,128,0.4)' : active ? 'rgba(255,107,107,0.3)' : 'rgba(255,255,255,0.08)'}`,
              }}>
                {done ? '✓' : s.icon}
              </span>
              <span style={{
                fontSize: 13, fontWeight: active ? 600 : 400,
                color: done ? '#4ade80' : active ? '#fff' : 'rgba(255,255,255,0.3)',
              }}>
                {s.label}
              </span>
              {active && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>진행중</span>
              )}
              {done && (
                <span style={{ fontSize: 11, color: '#4ade80', marginLeft: 'auto' }}>✓ 완료</span>
              )}
            </div>
          )
        })}
      </div>

      {/* 진행바 */}
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#FF6B6B,#FF8E53)', borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>실제 영상 프레임을 직접 분석합니다</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>약 60~90초 소요</p>
      </div>
    </div>
  )
}

// ── Frame 분석 결과 표시 ──
function FrameResultView({ data, framesAnalyzed }: { data: FrameAnalysisResult; framesAnalyzed: number }) {
  return (
    <>
      {/* 바이럴 점수 */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>바이럴 점수 <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>({framesAnalyzed}개 프레임 Vision 분석)</span></span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#FF8E53' }}>{data.viral_score} <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/ 100</span></span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${data.viral_score}%`, background: 'linear-gradient(90deg,#FF6B6B,#FF8E53)', borderRadius: 4, transition: 'width 0.8s ease' }} />
        </div>
      </div>

      {/* 2컬럼 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* 후킹 분석 */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CardLabel style={{ margin: 0 }}>🎣 후킹 분석</CardLabel>
            <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: 'rgba(255,142,83,0.15)', color: '#FF8E53' }}>{data.hook_analysis.type}</span>
          </div>
          <CardText>{data.hook_analysis.description}</CardText>
          {data.hook_analysis.visual_hook && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginTop: 6 }}>👁 {data.hook_analysis.visual_hook}</p>
          )}
          <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.15)' }}>
            <p style={{ fontSize: 10, color: '#FF8E53', fontWeight: 700, marginBottom: 4 }}>💬 스크립트 예시</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>{data.hook_analysis.script_example}</p>
          </div>
        </Card>

        {/* 촬영 분석 */}
        <Card>
          <CardLabel>📷 촬영 분석</CardLabel>
          {[
            ['카메라', data.visual_analysis.camera_angle],
            ['거리', data.visual_analysis.distance],
            ['조명', data.visual_analysis.lighting],
            ['배경', data.visual_analysis.background],
            ['편집 속도', data.visual_analysis.editing_pace],
          ].map(([label, value]) => (
            <div key={label} style={{ marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>{label}: </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{value}</span>
            </div>
          ))}
          {data.visual_analysis.product_appearance && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>🛍 {data.visual_analysis.product_appearance}</p>
          )}
        </Card>

        {/* 바이럴 요인 */}
        <Card>
          <CardLabel>🔥 바이럴 요인</CardLabel>
          {data.viral_factors.map((f, i) => (
            <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>• {f}</p>
          ))}
        </Card>

        {/* 따라할 수 있는 요소 */}
        <Card>
          <CardLabel>✅ 따라할 수 있는 요소</CardLabel>
          {data.copyable_elements.map((el, i) => (
            <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>• {el}</p>
          ))}
          {data.weak_points.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginTop: 10, marginBottom: 4 }}>아쉬운 점</p>
              {data.weak_points.map((wp, i) => (
                <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>• {wp}</p>
              ))}
            </>
          )}
        </Card>

        {/* 타겟 시청자 */}
        <Card>
          <CardLabel>👥 타겟 시청자</CardLabel>
          <CardText>{data.target_audience}</CardText>
        </Card>

        {/* 촬영 팁 */}
        <Card>
          <CardLabel>🎬 이 스타일로 찍으려면</CardLabel>
          {data.shooting_tips.map((t, i) => (
            <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>• {t}</p>
          ))}
        </Card>
      </div>

      {/* 씬 구성 (풀너비) */}
      {data.content_structure.scene_breakdown.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <CardLabel>📐 씬 구성 (실제 프레임 기반)</CardLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.content_structure.scene_breakdown.map((sc, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, paddingBottom: 8, borderBottom: i < data.content_structure.scene_breakdown.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#FF8E53', flexShrink: 0, width: 60 }}>{sc.timeRange}</span>
                <div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{sc.visual}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>역할: {sc.purpose}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 개선 제안 */}
      {data.recommended_improvements.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <CardLabel>💡 개선 제안</CardLabel>
          {data.recommended_improvements.map((r, i) => (
            <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>• {r}</p>
          ))}
        </Card>
      )}
    </>
  )
}

// ── 기존 메타데이터 분석 결과 표시 (폴백) ──
function MetaResultView({ data }: { data: AnalysisResult }) {
  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>바이럴 점수 <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>(메타데이터 기반)</span></span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#FF8E53' }}>{data.viral_score} <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/ 100</span></span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${data.viral_score}%`, background: 'linear-gradient(90deg,#FF6B6B,#FF8E53)', borderRadius: 4, transition: 'width 0.8s ease' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Card>
          <CardLabel>🔥 왜 조회수가 높은가?</CardLabel>
          <CardText>{data.viral_reason}</CardText>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CardLabel style={{ margin: 0 }}>🎣 후킹 전략</CardLabel>
            <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: 'rgba(255,142,83,0.15)', color: '#FF8E53' }}>{data.hook_type}</span>
          </div>
          <CardText>{data.hook_analysis}</CardText>
          <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.15)' }}>
            <p style={{ fontSize: 10, color: '#FF8E53', fontWeight: 700, marginBottom: 4 }}>💬 스크립트 예시</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>{data.hook_script_example}</p>
          </div>
        </Card>
        <Card>
          <CardLabel>✅ 잘된 요소</CardLabel>
          {data.best_elements.map((el, i) => (
            <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>• {el}</p>
          ))}
          {data.weak_points.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginTop: 10, marginBottom: 4 }}>아쉬운 점</p>
              {data.weak_points.map((wp, i) => (
                <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>• {wp}</p>
              ))}
            </>
          )}
        </Card>
        <Card>
          <CardLabel>📐 콘텐츠 구조</CardLabel>
          <CardText>{data.content_structure}</CardText>
        </Card>
        <Card>
          <CardLabel>🤖 알고리즘 요인</CardLabel>
          {data.algorithm_factors.map((f, i) => (
            <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>• {f}</p>
          ))}
        </Card>
        <Card>
          <CardLabel>👥 타겟 시청자</CardLabel>
          <CardText>{data.target_audience}</CardText>
        </Card>
      </div>
      <Card style={{ marginBottom: 12 }}>
        <CardLabel>💡 성공 공식 복제 방법</CardLabel>
        <CardText>{data.copyable_formula}</CardText>
      </Card>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
        <span>⏱ 권장 길이: <strong style={{ color: '#FF8E53' }}>{data.recommended_length}초</strong></span>
        <span>🕐 권장 게시 시간: <strong style={{ color: '#FF8E53' }}>{data.recommended_posting_time}</strong></span>
      </div>
    </>
  )
}

export default function VideoModal({ video, onClose }: Props) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [frameResult, setFrameResult] = useState<ServerAnalysisResponse | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzePhase, setAnalyzePhase] = useState<AnalyzePhase>('download')
  const [analyzePct, setAnalyzePct] = useState(0)
  const [myProduct, setMyProduct] = useState('')
  const [targetAudience, setTargetAudience] = useState<'genz' | 'millennial' | 'all'>('genz')

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    intervalsRef.current.forEach(clearInterval)
    timersRef.current = []
    intervalsRef.current = []
  }

  useEffect(() => () => clearTimers(), [])

  const er = video.playCount
    ? (((video.diggCount + (video.commentCount || 0)) / video.playCount) * 100).toFixed(1)
    : '0'

  async function goToAnalysis() {
    setStep(2)
    if (analysis || frameResult) return
    setAnalyzing(true)
    setAnalyzePhase('download')
    setAnalyzePct(0)

    // 타이머 기반 진행바 (0 → 90% over ~90s)
    const pctInterval = setInterval(() => {
      setAnalyzePct(prev => Math.min(prev + 0.5, 90))
    }, 500)
    intervalsRef.current.push(pctInterval)

    // 단계 전환: 20초 → extract, 50초 → vision
    const t1 = setTimeout(() => setAnalyzePhase('extract'), 20000)
    const t2 = setTimeout(() => setAnalyzePhase('vision'), 50000)
    timersRef.current.push(t1, t2)

    try {
      const result = await analyzeVideoWithFrames(video.webVideoUrl || '')
      clearTimers()
      setAnalyzePct(100)
      setTimeout(() => setAnalyzing(false), 300)
      setFrameResult(result)
    } catch {
      // 백엔드 실패 → 메타데이터 폴백
      clearTimers()
      setAnalyzePhase('download')
      setAnalyzePct(0)
      const result = await analyzeVideo(video)
      setAnalysis(result)
      setAnalyzing(false)
    }
  }

  function goToGenerate() {
    const hookType = frameResult
      ? frameResult.analysis.hook_analysis.type
      : (analysis?.hook_type ?? '궁금증형')
    const dur = frameResult
      ? frameResult.videoInfo.duration
      : (analysis?.recommended_length ?? video.videoMeta.duration)
    const params = new URLSearchParams({
      topic: myProduct || video.text.slice(0, 30),
      hookType,
      duration: String(dur),
      ref: 'analysis',
      ...(video.webVideoUrl ? { refUrl: video.webVideoUrl } : {}),
    })
    navigate(`/generate?${params.toString()}`)
    onClose()
  }

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
    zIndex: 200, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 20,
  }
  const modal: React.CSSProperties = {
    background: '#111116', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20, padding: 24, maxWidth: 700, width: '100%',
    maxHeight: '90vh', overflowY: 'auto',
  }

  const hasResult = frameResult || analysis

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>

        {/* ── Step 1: 영상 정보 ── */}
        {step === 1 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>영상 정보</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', marginBottom: 16, background: 'linear-gradient(135deg,rgba(255,107,107,0.12),rgba(255,142,83,0.08))', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {video.videoMeta.coverUrl
                ? <img src={video.videoMeta.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 48, opacity: 0.4 }}>▶</span>}
            </div>

            <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, marginBottom: 6 }}>{video.text}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 18 }}>@{video.authorMeta.name}</p>

            <div style={{ display: 'flex', gap: 16, marginBottom: 22, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              <span>👁 {formatCount(video.playCount)}</span>
              <span>❤️ {formatCount(video.diggCount)}</span>
              {video.commentCount != null && <span>💬 {formatCount(video.commentCount)}</span>}
              <span style={{ color: '#FF8E53', fontWeight: 700 }}>{er}%</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => window.open(video.webVideoUrl, '_blank')} style={{ padding: '12px', borderRadius: 10, fontWeight: 600, fontSize: 14, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer' }}>
                ▶ TikTok에서 영상 보기
              </button>
              <button onClick={goToAnalysis} style={{ padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 14, background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                🎞 실제 영상 프레임 AI 분석하기 →
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: AI 분석 결과 ── */}
        {step === 2 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16, padding: 0 }}>←</button>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>🔍 AI 분석 결과</h3>
              <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            {analyzing ? (
              <FrameLoadingUI phase={analyzePhase} pct={analyzePct} />
            ) : hasResult ? (
              <>
                {frameResult
                  ? <FrameResultView data={frameResult.analysis} framesAnalyzed={frameResult.framesAnalyzed} />
                  : analysis ? <MetaResultView data={analysis} /> : null
                }
                <button onClick={() => setStep(3)} style={{ width: '100%', padding: '13px', borderRadius: 10, fontWeight: 700, fontSize: 14, background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  🎬 이 스타일로 내 영상 만들기 →
                </button>
              </>
            ) : null}
          </>
        )}

        {/* ── Step 3: 영상 제작 제안 ── */}
        {step === 3 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16, padding: 0 }}>←</button>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>✍️ 내 영상 만들기</h3>
              <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.15)', marginBottom: 22 }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 6 }}>이 영상의 성공 공식을<br />내 콘텐츠에 적용해볼까요?</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                참고: @{frameResult?.videoInfo.authorName ?? video.authorMeta.name} &nbsp;•&nbsp;
                후킹: {frameResult?.analysis.hook_analysis.type ?? analysis?.hook_type ?? '—'} &nbsp;•&nbsp;
                {frameResult ? `프레임 분석 (${frameResult.framesAnalyzed}장)` : '메타데이터 분석'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 7, letterSpacing: 1 }}>내 제품 / 주제</label>
                <input value={myProduct} onChange={e => setMyProduct(e.target.value)} placeholder="예) 라운드랩 자작나무 에센스" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 10, letterSpacing: 1 }}>타겟 시청자</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([['genz', 'Gen Z'], ['millennial', '밀레니얼'], ['all', '전체']] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setTargetAudience(val)} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: targetAudience === val ? 'rgba(255,107,107,0.13)' : 'rgba(255,255,255,0.05)', border: `1px solid ${targetAudience === val ? 'rgba(255,107,107,0.35)' : 'rgba(255,255,255,0.1)'}`, color: targetAudience === val ? '#FF8E53' : 'rgba(255,255,255,0.5)', fontWeight: targetAudience === val ? 600 : 400 }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={goToGenerate} style={{ padding: '13px', borderRadius: 10, fontWeight: 700, fontSize: 14, background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                🎬 AI 스크립트 생성하기
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setStep(1); setAnalysis(null); setFrameResult(null) }} style={{ flex: 1, padding: '11px', borderRadius: 10, fontWeight: 600, fontSize: 13, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                  다른 영상 분석하기
                </button>
                <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, fontWeight: 600, fontSize: 13, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                  닫기
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
