import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video } from '../api/tiktok'
import { analyzeVideo, AnalysisResult } from '../api/analyze'

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

export default function VideoModal({ video, onClose }: Props) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [myProduct, setMyProduct] = useState('')
  const [targetAudience, setTargetAudience] = useState<'genz' | 'millennial' | 'all'>('genz')

  const er = video.playCount
    ? (((video.diggCount + (video.commentCount || 0)) / video.playCount) * 100).toFixed(1)
    : '0'

  async function goToAnalysis() {
    setStep(2)
    if (analysis) return
    setAnalyzing(true)
    const result = await analyzeVideo(video)
    setAnalysis(result)
    setAnalyzing(false)
  }

  function goToGenerate() {
    const params = new URLSearchParams({
      topic: myProduct || video.text.slice(0, 30),
      hookType: analysis?.hook_type || '궁금증형',
      duration: String(analysis?.recommended_length ?? video.videoMeta.duration),
      ref: 'analysis',
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
    borderRadius: 20, padding: 24, maxWidth: 680, width: '100%',
    maxHeight: '90vh', overflowY: 'auto',
  }

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
                📊 이 영상 AI 분석하기 →
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: AI 분석 결과 (2컬럼) ── */}
        {step === 2 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16, padding: 0 }}>←</button>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>🔍 AI 분석 결과</h3>
              <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            {analyzing ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.5)' }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>🔍</div>
                <p style={{ fontSize: 14, lineHeight: 1.8 }}>AI가 영상을 분석하고 있어요...<br /><span style={{ fontSize: 12 }}>잠시만 기다려주세요</span></p>
              </div>
            ) : analysis ? (
              <>
                {/* 바이럴 점수 */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>바이럴 점수</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#FF8E53' }}>{analysis.viral_score} <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/ 100</span></span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${analysis.viral_score}%`, background: 'linear-gradient(90deg,#FF6B6B,#FF8E53)', borderRadius: 4, transition: 'width 0.8s ease' }} />
                  </div>
                </div>

                {/* 2컬럼 그리드 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  {/* 왜 조회수가 높은가 */}
                  <Card>
                    <CardLabel>🔥 왜 조회수가 높은가?</CardLabel>
                    <CardText>{analysis.viral_reason}</CardText>
                  </Card>

                  {/* 후킹 전략 */}
                  <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <CardLabel style={{ margin: 0 }}>🎣 후킹 전략</CardLabel>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: 'rgba(255,142,83,0.15)', color: '#FF8E53' }}>{analysis.hook_type}</span>
                    </div>
                    <CardText>{analysis.hook_analysis}</CardText>
                    <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.15)' }}>
                      <p style={{ fontSize: 10, color: '#FF8E53', fontWeight: 700, marginBottom: 4 }}>💬 스크립트 예시</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>{analysis.hook_script_example}</p>
                    </div>
                  </Card>

                  {/* 잘된 요소 */}
                  <Card>
                    <CardLabel>✅ 잘된 요소</CardLabel>
                    {analysis.best_elements.map((el, i) => (
                      <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>• {el}</p>
                    ))}
                    {analysis.weak_points.length > 0 && (
                      <>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginTop: 10, marginBottom: 4 }}>아쉬운 점</p>
                        {analysis.weak_points.map((wp, i) => (
                          <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>• {wp}</p>
                        ))}
                      </>
                    )}
                  </Card>

                  {/* 콘텐츠 구조 */}
                  <Card>
                    <CardLabel>📐 콘텐츠 구조</CardLabel>
                    <CardText>{analysis.content_structure}</CardText>
                  </Card>

                  {/* 알고리즘 요인 */}
                  <Card>
                    <CardLabel>🤖 알고리즘 요인</CardLabel>
                    {analysis.algorithm_factors.map((f, i) => (
                      <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>• {f}</p>
                    ))}
                  </Card>

                  {/* 타겟 시청자 */}
                  <Card>
                    <CardLabel>👥 타겟 시청자</CardLabel>
                    <CardText>{analysis.target_audience}</CardText>
                  </Card>
                </div>

                {/* 성공 공식 (풀 너비) */}
                <Card style={{ marginBottom: 12 }}>
                  <CardLabel>💡 성공 공식 복제 방법</CardLabel>
                  <CardText>{analysis.copyable_formula}</CardText>
                </Card>

                {/* 권장 수치 */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 18, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  <span>⏱ 권장 길이: <strong style={{ color: '#FF8E53' }}>{analysis.recommended_length}초</strong></span>
                  <span>🕐 권장 게시 시간: <strong style={{ color: '#FF8E53' }}>{analysis.recommended_posting_time}</strong></span>
                </div>

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
                참고: @{video.authorMeta.name} 스타일 &nbsp;•&nbsp;
                후킹: {analysis?.hook_type ?? '—'} &nbsp;•&nbsp;
                권장 길이: {analysis?.recommended_length ?? video.videoMeta.duration}초
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
                <button onClick={() => { setStep(1); setAnalysis(null) }} style={{ flex: 1, padding: '11px', borderRadius: 10, fontWeight: 600, fontSize: 13, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
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
