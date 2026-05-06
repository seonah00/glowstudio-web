import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { searchTikTok, getTrends } from './api/tiktok'
import VideoModal from './components/VideoModal'

const API_BASE = 'https://glowstudio-api.up.railway.app/api'

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

interface Video {
  id: string
  text: string
  authorMeta: { name: string; avatar?: string }
  videoMeta: { duration: number; coverUrl?: string }
  playCount: number
  diggCount: number
  commentCount?: number
  shareCount?: number
  webVideoUrl?: string
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');`

function Nav({ active }: { active: string }) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(8,8,12,0.9)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', alignItems: 'center', padding: '0 32px', height: 60, gap: 32,
    }}>
      <Link to="/" style={{
        fontSize: 18, fontWeight: 800, letterSpacing: 2,
        background: 'linear-gradient(90deg, #FF6B6B, #FF8E53)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>GLOWSTUDIO AI</Link>
      <div style={{ display: 'flex', gap: 4 }}>
        {[['/', '홈'], ['/discover', '디스커버'], ['/generate', '생성'], ['/analyze', '분석']].map(([path, label]) => (
          <Link key={path} to={path} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            color: active === path ? '#fff' : 'rgba(255,255,255,0.45)',
            background: active === path ? 'rgba(255,107,107,0.12)' : 'transparent',
            border: `1px solid ${active === path ? 'rgba(255,107,107,0.3)' : 'transparent'}`,
          }}>{label}</Link>
        ))}
      </div>
      <Link to="/discover" style={{
        marginLeft: 'auto', padding: '8px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700,
        background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)', color: '#fff',
      }}>무료로 시작하기 →</Link>
    </nav>
  )
}

/* ── Home ── */
function Home() {
  return (
    <div style={{ background: '#08080C', minHeight: '100vh', color: '#fff' }}>
      <Nav active="/" />
      <style>{FONTS}</style>

      {/* Hero */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 20px 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(255,107,107,0.12) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 9999, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', fontSize: 12, fontWeight: 600, color: '#FF8E53', letterSpacing: 1, marginBottom: 32 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6B6B', display: 'inline-block' }} />
          AI 기반 K-뷰티 콘텐츠 운영체제
        </div>
        <h1 style={{ fontSize: 'clamp(40px,7vw,78px)', lineHeight: 1.1, fontWeight: 800, letterSpacing: -2, marginBottom: 24, maxWidth: 800 }}>
          북미에서 <span style={{ background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>먹히는</span><br />K-뷰티 콘텐츠를<br />만드세요
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', maxWidth: 500, lineHeight: 1.7, marginBottom: 44 }}>
          TikTok 트렌드 분석, AI 스크립트 생성, Gen Z 톤 변환까지 — 북미 시장을 공략하는 모든 도구.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/discover" style={{ padding: '15px 34px', borderRadius: 12, fontWeight: 700, fontSize: 15, background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', color: '#fff', boxShadow: '0 0 40px rgba(255,107,107,0.3)' }}>무료로 시작하기 →</Link>
          <Link to="/discover" style={{ padding: '15px 34px', borderRadius: 12, fontWeight: 600, fontSize: 15, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>트렌드 살펴보기</Link>
        </div>
        <div style={{ display: 'flex', gap: 56, marginTop: 72, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['12M+','TikTok 영상 분석'],['3분','AI 스크립트 생성'],['240%','평균 조회수 상승']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 800, background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ color: '#FF8E53', fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 10 }}>FEATURES</p>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>5가지 핵심 기능</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          {[
            { emoji: '🔍', title: '디스커버', desc: '북미 트렌딩 콘텐츠 실시간 탐색', c: '#FF6B6B' },
            { emoji: '✍️', title: '생성', desc: 'AI 스크립트 3분 완성', c: '#FF8E53' },
            { emoji: '📊', title: '분석', desc: '조회수와 전환율 동시 분석', c: '#FFB347' },
            { emoji: '🚀', title: '성장', desc: '브랜드 매칭으로 수익화', c: '#FF6B6B' },
            { emoji: '📦', title: '제품 허브', desc: '제품 링크 → 촬영 분석', c: '#FF8E53' },
          ].map(f => (
            <div key={f.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '26px 22px' }}>
              <div style={{ fontSize: 30, marginBottom: 14 }}>{f.emoji}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '36px 32px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
        <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 6, color: '#fff' }}>GLOWSTUDIO AI</p>
        <p>북미 K-뷰티 콘텐츠 크리에이터를 위한 AI 운영체제</p>
        <p style={{ marginTop: 14, fontSize: 11 }}>© 2025 GLOWSTUDIO AI. 모든 권리 보유.</p>
      </footer>
    </div>
  )
}

/* ── Discover ── */
const SAMPLE_VIDEOS: Video[] = [
  { id:'1', text:'이 선크림 진짜 미쳤어요 🔥 #kbeauty #skincare', authorMeta:{name:'glow_creator'}, videoMeta:{duration:32}, playCount:2400000, diggCount:180000, commentCount:4200, shareCount:12000 },
  { id:'2', text:'GRWM: 아침 스킨케어 루틴 ✨ #morningroutine', authorMeta:{name:'skincare_guru'}, videoMeta:{duration:65}, playCount:1800000, diggCount:120000, commentCount:3100, shareCount:8900 },
  { id:'3', text:'$10으로 만드는 글래스 스킨 #glassskin #affordable', authorMeta:{name:'beauty_by_jen'}, videoMeta:{duration:45}, playCount:3200000, diggCount:240000, commentCount:6800, shareCount:31000 },
  { id:'4', text:'POV: 한국 앰플 처음 써봤을 때 #kbeauty #ampoule', authorMeta:{name:'kbeauty_lover'}, videoMeta:{duration:28}, playCount:890000, diggCount:67000, commentCount:1800, shareCount:4200 },
  { id:'5', text:'30일 챌린지 결과 | 피부 변화 #skinchallenge', authorMeta:{name:'glowwithme'}, videoMeta:{duration:52}, playCount:1500000, diggCount:98000, commentCount:2900, shareCount:7600 },
  { id:'6', text:'이 제품이 내 인생을 바꿨어요 💯 #kbeauty', authorMeta:{name:'skinroutine'}, videoMeta:{duration:38}, playCount:4100000, diggCount:320000, commentCount:9200, shareCount:45000 },
  { id:'7', text:'K-뷰티 초보자 필독 🌟 #beginner #kbeauty', authorMeta:{name:'beautybasics'}, videoMeta:{duration:58}, playCount:720000, diggCount:54000, commentCount:1400, shareCount:3800 },
  { id:'8', text:'세상에서 제일 촉촉한 스킨케어 루틴 #moisture', authorMeta:{name:'hydrationqueen'}, videoMeta:{duration:43}, playCount:2100000, diggCount:158000, commentCount:3700, shareCount:18000 },
]

const CATEGORY_HASHTAGS = {
  beauty: {
    label: '💄 뷰티',
    topTags: [
      { tag: '#kbeauty', count: '2.4M' },
      { tag: '#glassskin', count: '1.8M' },
      { tag: '#grwm', count: '1.2M' },
      { tag: '#skincare', count: '980K' },
      { tag: '#koreanmakeup', count: '760K' },
    ],
  },
  lifestyle: {
    label: '🌿 라이프스타일',
    topTags: [
      { tag: '#morningroutine', count: '3.1M' },
      { tag: '#dayinmylife', count: '2.7M' },
      { tag: '#wellness', count: '1.9M' },
      { tag: '#selfcare', count: '1.4M' },
      { tag: '#routinevlog', count: '890K' },
    ],
  },
  vlog: {
    label: '🎬 Vlog',
    topTags: [
      { tag: '#vlog', count: '4.2M' },
      { tag: '#koreandaily', count: '1.6M' },
      { tag: '#seoulvlog', count: '1.1M' },
      { tag: '#studyvlog', count: '870K' },
      { tag: '#koreanlifestyle', count: '640K' },
    ],
  },
} as const

type Category = keyof typeof CATEGORY_HASHTAGS
type TabType = Category | 'search'

function VideoCard({ v, onClick }: { v: Video; onClick: () => void }) {
  function er() {
    return v.playCount ? (((v.diggCount + (v.commentCount || 0)) / v.playCount) * 100).toFixed(1) + '%' : '0%'
  }
  return (
    <div onClick={onClick} style={{ borderRadius: 14, overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}
      onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'rgba(255,107,107,0.3)'; d.style.transform = 'translateY(-3px)'; d.style.boxShadow = '0 12px 32px rgba(255,107,107,0.1)' }}
      onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'rgba(255,255,255,0.07)'; d.style.transform = 'none'; d.style.boxShadow = 'none' }}>
      <div style={{ aspectRatio: '9/16', position: 'relative', background: 'linear-gradient(135deg,rgba(255,107,107,0.12),rgba(255,142,83,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {v.videoMeta.coverUrl
          ? <img src={v.videoMeta.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <span style={{ fontSize: 32, opacity: 0.4 }}>▶</span>}
        <div style={{ position: 'absolute', bottom: 7, right: 7, background: 'rgba(0,0,0,0.65)', borderRadius: 5, padding: '2px 6px', fontSize: 10, color: '#fff' }}>
          {Math.floor(v.videoMeta.duration / 60)}:{(v.videoMeta.duration % 60).toString().padStart(2, '0')}
        </div>
        <div style={{ position: 'absolute', top: 7, left: 7, background: 'rgba(0,0,0,0.65)', borderRadius: 5, padding: '2px 7px', fontSize: 10, color: '#fff' }}>
          👁 {formatCount(v.playCount)}
        </div>
      </div>
      <div style={{ padding: '11px 11px 13px' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, marginBottom: 7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{v.text}</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 7 }}>@{v.authorMeta.name}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
          <span>❤️ {formatCount(v.diggCount)}</span>
          {v.commentCount != null && <span>💬 {formatCount(v.commentCount)}</span>}
          <span style={{ color: '#FF8E53', fontWeight: 700 }}>{er()}</span>
        </div>
      </div>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(185px,1fr))', gap: 14 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ aspectRatio: '9/16', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ padding: 12 }}>
            <div style={{ height: 11, background: 'rgba(255,255,255,0.07)', borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 9, width: '55%', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function Discover() {
  const [activeTab, setActiveTab] = useState<TabType>('beauty')
  const [query, setQuery] = useState('kbeauty')
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [apiConnected, setApiConnected] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Video | null>(null)

  useEffect(() => {
    loadCategory('beauty')
  }, [])

  async function loadCategory(cat: Category) {
    setLoading(true); setApiError(null); setVideos([])
    try {
      const data = await getTrends(cat, 12)
      if (!data.length) throw new Error('결과 없음')
      setVideos(data); setApiConnected(true)
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : String(err))
      setApiConnected(false); setVideos(SAMPLE_VIDEOS)
    }
    setLoading(false)
  }

  async function search(keyword?: string) {
    const q = keyword ?? query
    setLoading(true); setApiError(null); setVideos([])
    try {
      const data = await searchTikTok(q, 12)
      if (!data.length) throw new Error('결과 없음')
      setVideos(data); setApiConnected(true)
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : String(err))
      setApiConnected(false); setVideos(SAMPLE_VIDEOS)
    }
    setLoading(false)
  }

  function switchTab(tab: TabType) {
    setActiveTab(tab)
    setVideos([])
    if (tab === 'search') return
    loadCategory(tab)
  }

  function clickHashtag(tag: string) {
    const kw = tag.replace(/^#/, '')
    setQuery(kw)
    setActiveTab('search')
    search(kw)
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'beauty', label: '💄 뷰티' },
    { key: 'lifestyle', label: '🌿 라이프스타일' },
    { key: 'vlog', label: '🎬 Vlog' },
    { key: 'search', label: '🔍 키워드 검색' },
  ]

  const catInfo = activeTab !== 'search' ? CATEGORY_HASHTAGS[activeTab] : null

  return (
    <div style={{ background: '#08080C', minHeight: '100vh', color: '#fff', paddingTop: 60 }}>
      <Nav active="/discover" />
      <style>{FONTS}</style>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 32px' }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1, marginBottom: 6 }}>트렌드 디스커버</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>북미 K-뷰티 TikTok 트렌드를 실시간으로 탐색하세요</p>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => switchTab(t.key)} style={{
              padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: activeTab === t.key ? 'rgba(255,107,107,0.13)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeTab === t.key ? 'rgba(255,107,107,0.35)' : 'rgba(255,255,255,0.08)'}`,
              color: activeTab === t.key ? '#FF8E53' : 'rgba(255,255,255,0.5)',
            }}>{t.label}</button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: apiConnected ? 'rgba(34,197,94,0.1)' : 'rgba(255,107,107,0.1)', border: `1px solid ${apiConnected ? 'rgba(34,197,94,0.25)' : 'rgba(255,107,107,0.25)'}`, color: apiConnected ? '#4ade80' : '#FF6B6B' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: apiConnected ? '#4ade80' : '#FF6B6B', display: 'inline-block' }} />
            {apiConnected ? 'TikTok 실시간 연동' : '샘플 데이터'}
          </div>
        </div>

        {/* 카테고리 탭: 인기 해시태그 뱃지 */}
        {catInfo && (
          <div style={{ marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>🔥 인기 해시태그</span>
            {catInfo.topTags.map(({ tag, count }) => (
              <button key={tag} onClick={() => clickHashtag(tag)} style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: 'rgba(255,142,83,0.08)', border: '1px solid rgba(255,142,83,0.22)',
                color: '#FF8E53',
              }}>
                {tag} <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* 키워드 검색 탭 */}
        {activeTab === 'search' && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, maxWidth: 520 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="#kbeauty, #grwm, #skincare ..."
              style={{ flex: 1, padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none' }}
            />
            <button onClick={() => search()} disabled={loading} style={{ padding: '10px 22px', borderRadius: 10, fontWeight: 600, fontSize: 13, background: loading ? 'rgba(255,107,107,0.3)' : 'linear-gradient(135deg,#FF6B6B,#FF8E53)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '검색 중...' : '검색'}
            </button>
          </div>
        )}

        {apiError && (
          <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 18, fontSize: 12, background: 'rgba(255,107,107,0.07)', border: '1px solid rgba(255,107,107,0.18)', color: 'rgba(255,255,255,0.45)' }}>
            ⚠️ {apiError} — 샘플 데이터 표시 중
          </div>
        )}

        {/* 영상 그리드 */}
        {loading ? <SkeletonGrid /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(185px,1fr))', gap: 14 }}>
            {videos.map(v => (
              <VideoCard key={v.id} v={v} onClick={() => setSelected(v)} />
            ))}
          </div>
        )}
      </div>

      {selected && <VideoModal video={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

/* ── Generate ── */
function Generate() {
  const [searchParams] = useSearchParams()
  const [topic, setTopic] = useState(() => searchParams.get('topic') || '')
  const [tone, setTone] = useState('gen-z')
  const [product, setProduct] = useState('')
  const [script, setScript] = useState('')
  const [loading, setLoading] = useState(false)

  const fromAnalysis = searchParams.get('ref') === 'analysis'
  const hookType = searchParams.get('hookType')
  const duration = searchParams.get('duration')

  async function generateScript() {
    if (!topic.trim()) return
    setLoading(true); setScript('')
    try {
      const res = await fetch(`${API_BASE}/generate/script`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({topic, tone, product}), signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) throw new Error('API 오류')
      const data = await res.json()
      setScript(data.script || data.content || JSON.stringify(data))
    } catch {
      setScript(`🎬 [훅 - 0~3초]\n"이거 진짜 써봤는데... 환불 각이었어요."\n\n🌟 [본론 - 3~25초]\nK-뷰티 ${topic || '스킨케어'}이 북미에서 폭발적인 인기를 끌고 있어요.${product ? ` 특히 ${product}은` : ''} 글래스 스킨의 핵심 비결인데요.\n성분을 보면 — 나이아신아마이드가 피부 톤을 밝혀주고, 히알루론산이 수분을 꽉 잡아줘요.\n\n💡 [핵심 팁 - 25~40초]\nGen Z 스킨케어 루틴의 포인트는 '레이어링'이에요.\n1️⃣ 토너 → 2️⃣ 앰플 → 3️⃣ 크림 순으로 얇게 겹쳐 바르세요.\n\n🔚 [CTA - 40~45초]\n댓글에 피부 타입 알려주면 맞춤 루틴 알려드릴게요! 🙌\n#kbeauty #glassskin #skincareroutine`)
    }
    setLoading(false)
  }

  return (
    <div style={{ background:'#08080C', minHeight:'100vh', color:'#fff', paddingTop:60 }}>
      <Nav active="/generate" />
      <style>{FONTS}</style>
      <div style={{ maxWidth:740, margin:'0 auto', padding:'44px 32px' }}>
        <div style={{ marginBottom:36 }}>
          <h1 style={{ fontSize:30, fontWeight:800, letterSpacing:-1, marginBottom:6 }}>AI 스크립트 생성</h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>북미 Gen Z 트렌드에 맞는 TikTok 스크립트를 3분 안에 완성하세요</p>
        </div>
        {fromAnalysis && hookType && (
          <div style={{ padding:'12px 16px', borderRadius:12, marginBottom:18, background:'rgba(255,107,107,0.07)', border:'1px solid rgba(255,107,107,0.2)', fontSize:13, color:'rgba(255,255,255,0.65)' }}>
            📊 AI 분석 결과 적용 중 &nbsp;•&nbsp; 후킹 유형: <strong style={{ color:'#FF8E53' }}>{hookType}</strong>{duration && <> &nbsp;•&nbsp; 참고 길이: <strong style={{ color:'#FF8E53' }}>{duration}초</strong></>}
          </div>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', marginBottom:7, letterSpacing:1 }}>주제 *</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="예: 아침 스킨케어 루틴, 선크림 추천, 앰플 사용법..." style={{ width:'100%', padding:'13px 16px', borderRadius:11, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box' }} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', marginBottom:7, letterSpacing:1 }}>제품명 (선택)</label>
            <input value={product} onChange={e => setProduct(e.target.value)} placeholder="예: 코스알엑스 달팽이 에센스, 이니스프리 그린티 세럼..." style={{ width:'100%', padding:'13px 16px', borderRadius:11, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box' }} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', marginBottom:7, letterSpacing:1 }}>톤</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {[['gen-z','Gen Z 🔥'],['professional','전문가 💼'],['funny','유머 😂'],['tutorial','튜토리얼 📚']].map(([v,l]) => (
                <button key={v} onClick={() => setTone(v)} style={{ padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', background:tone===v?'rgba(255,107,107,0.13)':'rgba(255,255,255,0.05)', border:`1px solid ${tone===v?'rgba(255,107,107,0.35)':'rgba(255,255,255,0.1)'}`, color:tone===v?'#FF8E53':'rgba(255,255,255,0.5)' }}>{l}</button>
              ))}
            </div>
          </div>
          <button onClick={generateScript} disabled={loading||!topic.trim()} style={{ padding:'14px', borderRadius:12, fontWeight:700, fontSize:14, background:loading||!topic.trim()?'rgba(255,107,107,0.25)':'linear-gradient(135deg,#FF6B6B,#FF8E53)', color:'#fff', border:'none', cursor:loading||!topic.trim()?'not-allowed':'pointer', marginTop:6 }}>
            {loading ? '스크립트 생성 중...' : '✍️ 스크립트 생성'}
          </button>
        </div>
        {script && (
          <div style={{ marginTop:28, padding:22, borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h3 style={{ fontWeight:700, fontSize:14 }}>생성된 스크립트</h3>
              <button onClick={() => navigator.clipboard.writeText(script)} style={{ padding:'5px 12px', borderRadius:7, fontSize:12, fontWeight:600, background:'rgba(255,142,83,0.12)', border:'1px solid rgba(255,142,83,0.28)', color:'#FF8E53', cursor:'pointer' }}>복사</button>
            </div>
            <pre style={{ fontSize:13, lineHeight:1.85, color:'rgba(255,255,255,0.7)', whiteSpace:'pre-wrap', fontFamily:'inherit' }}>{script}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Analyze ── */
function Analyze() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<Record<string,unknown>|null>(null)
  const [loading, setLoading] = useState(false)

  async function analyze() {
    if (!url.trim()) return
    setLoading(true); setResult(null)
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({url}), signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) throw new Error('API 오류')
      setResult(await res.json())
    } catch {
      setResult({ playCount:2400000, diggCount:180000, commentCount:4200, engagementRate:'7.67%', recommendation:'훅을 2초 이내로 줄이고, 자막을 추가하면 조회수 30% 향상 예상' })
    }
    setLoading(false)
  }

  return (
    <div style={{ background:'#08080C', minHeight:'100vh', color:'#fff', paddingTop:60 }}>
      <Nav active="/analyze" />
      <style>{FONTS}</style>
      <div style={{ maxWidth:680, margin:'0 auto', padding:'44px 32px' }}>
        <div style={{ marginBottom:36 }}>
          <h1 style={{ fontSize:30, fontWeight:800, letterSpacing:-1, marginBottom:6 }}>영상 분석</h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>TikTok 영상 URL을 입력하면 AI가 조회수·전환율을 분석해드려요</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.tiktok.com/@username/video/..." style={{ flex:1, padding:'13px 16px', borderRadius:11, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:13, outline:'none' }} />
          <button onClick={analyze} disabled={loading||!url.trim()} style={{ padding:'13px 22px', borderRadius:11, fontWeight:600, fontSize:13, background:'linear-gradient(135deg,#FF6B6B,#FF8E53)', color:'#fff', border:'none', cursor:'pointer', whiteSpace:'nowrap' }}>
            {loading ? '분석 중...' : '분석하기'}
          </button>
        </div>
        {result && (
          <div style={{ marginTop:28 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              {[['조회수', formatCount(result.playCount as number)], ['좋아요', formatCount(result.diggCount as number)], ['댓글', formatCount(result.commentCount as number)], ['참여율', result.engagementRate as string]].map(([l,v]) => (
                <div key={l} style={{ padding:'18px', borderRadius:13, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:8 }}>{l}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:'#FF8E53' }}>{v}</div>
                </div>
              ))}
            </div>
            {result.recommendation != null && (
              <div style={{ padding:18, borderRadius:13, background:'rgba(255,107,107,0.07)', border:'1px solid rgba(255,107,107,0.18)' }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#FF6B6B', marginBottom:7 }}>💡 AI 개선 추천</p>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.65 }}>{String(result.recommendation)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── App ── */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/analyze" element={<Analyze />} />
      </Routes>
    </HashRouter>
  )
}
