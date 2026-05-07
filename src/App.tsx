import React, { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { searchTikTok, getTrends } from './api/tiktok'
import VideoModal from './components/VideoModal'
import { getDailyTrends, DailyTrendData } from './api/trends'
import { generateScript, ScriptOutput, GenerateInput } from './api/generate'

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

const SIDEBAR_SPIN_CSS = `@keyframes spin { to { transform: rotate(360deg) } }`

function TrendSidebar({ category, onClickTag }: { category: Category; onClickTag: (tag: string) => void }) {
  const [trendData, setTrendData] = useState<DailyTrendData>(() => getDailyTrends(category))
  const [refreshing, setRefreshing] = useState(false)
  const [refreshDone, setRefreshDone] = useState(false)
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

  useEffect(() => {
    setTrendData(getDailyTrends(category))
  }, [category])

  async function refreshTrends() {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 900))
    setTrendData(getDailyTrends(category))
    setRefreshing(false)
    setRefreshDone(true)
    setTimeout(() => setRefreshDone(false), 1500)
  }

  const changeIcon = (change: string) => {
    if (change === 'up') return <span style={{ color: '#4ade80', fontWeight: 700 }}>↑</span>
    if (change === 'down') return <span style={{ color: '#f87171', fontWeight: 700 }}>↓</span>
    if (change === 'new') return <span style={{ fontSize: 10, background: 'rgba(255,142,83,0.2)', color: '#FF8E53', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>NEW</span>
    return <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>
  }

  return (
    <div style={{ position: 'sticky', top: 80, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 }}>
      <style>{SIDEBAR_SPIN_CSS}</style>

      {/* 헤더 + 새로고침 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>📈 실시간 트렌드</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{today} 기준</p>
        </div>
        <button
          onClick={refreshTrends}
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: refreshing ? 'not-allowed' : 'pointer', background: refreshDone ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${refreshDone ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`, color: refreshDone ? '#4ade80' : 'rgba(255,255,255,0.45)' }}
        >
          <span style={{ display: 'inline-block', animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }}>🔄</span>
          {refreshDone ? '✓ 업데이트됨' : refreshing ? '' : '새로고침'}
        </button>
      </div>

      <p style={{ fontSize: 11, fontWeight: 700, color: '#FF8E53', letterSpacing: 0.5, marginBottom: 8 }}>🔥 인기 해시태그</p>

      {/* 스크롤 가능한 해시태그 리스트 */}
      <div style={{ maxHeight: 420, overflowY: 'auto', marginBottom: 16, scrollbarWidth: 'thin' }}>
        {trendData.topHashtags.map((item, i) => (
          <button
            key={item.tag}
            onClick={() => onClickTag(item.tag)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', borderRadius: 8, marginBottom: 2, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', width: 18, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.tag}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{item.count}</span>
            <span style={{ fontSize: 12, width: 22, textAlign: 'center', flexShrink: 0 }}>{changeIcon(item.change)}</span>
          </button>
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginBottom: 8 }}>🌡 떠오르는 키워드</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {trendData.risingKeywords.map(kw => (
            <button
              key={kw}
              onClick={() => onClickTag('#' + kw)}
              style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'rgba(255,107,107,0.07)', border: '1px solid rgba(255,107,107,0.15)', color: 'rgba(255,255,255,0.6)' }}
            >
              ↑ {kw}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>⏱ 마지막 업데이트: {trendData.updatedAt}</p>
      </div>
    </div>
  )
}

const DISCOVER_LOADING_MSGS = [
  '🔍 TikTok에서 트렌드 영상 수집 중...',
  '📊 조회수 데이터 분석 중...',
  '🏷 해시태그 순위 계산 중...',
  '✨ 인기 영상 정렬 중...',
]

function Discover() {
  const [activeTab, setActiveTab] = useState<TabType>('beauty')
  const [query, setQuery] = useState('kbeauty')
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(DISCOVER_LOADING_MSGS[0])
  const [loadingPct, setLoadingPct] = useState(0)
  const [apiConnected, setApiConnected] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Video | null>(null)

  useEffect(() => {
    loadCategory('beauty')
  }, [])

  function startLoadingAnim() {
    let msgIdx = 0
    let pct = 0
    setLoadingMsg(DISCOVER_LOADING_MSGS[0])
    setLoadingPct(0)

    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % DISCOVER_LOADING_MSGS.length
      setLoadingMsg(DISCOVER_LOADING_MSGS[msgIdx])
    }, 1500)

    const pctInterval = setInterval(() => {
      pct = Math.min(pct + 3.375, 90)
      setLoadingPct(pct)
    }, 1500)

    return () => {
      clearInterval(msgInterval)
      clearInterval(pctInterval)
    }
  }

  async function loadCategory(cat: Category) {
    setLoading(true); setApiError(null); setVideos([])
    const stop = startLoadingAnim()
    try {
      const data = await getTrends(cat)
      if (!data.length) throw new Error('결과 없음')
      setVideos(data); setApiConnected(true)
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : String(err))
      setApiConnected(false); setVideos(SAMPLE_VIDEOS)
    }
    stop()
    setLoadingPct(100)
    setTimeout(() => { setLoading(false); setLoadingPct(0) }, 300)
  }

  async function search(keyword?: string) {
    const q = keyword ?? query
    setLoading(true); setApiError(null); setVideos([])
    const stop = startLoadingAnim()
    try {
      const data = await searchTikTok(q, 30)
      if (!data.length) throw new Error('결과 없음')
      setVideos(data); setApiConnected(true)
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : String(err))
      setApiConnected(false); setVideos(SAMPLE_VIDEOS)
    }
    stop()
    setLoadingPct(100)
    setTimeout(() => { setLoading(false); setLoadingPct(0) }, 300)
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

  const showSidebar = activeTab !== 'search'

  return (
    <div style={{ background: '#08080C', minHeight: '100vh', color: '#fff', paddingTop: 60 }}>
      <Nav active="/discover" />
      <style>{FONTS}</style>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 32px' }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1, marginBottom: 6 }}>트렌드 디스커버</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>북미 K-뷰티 TikTok 트렌드를 실시간으로 탐색하세요</p>
        </div>

        {/* 탭 + 연결 상태 */}
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

        {/* 키워드 검색 탭 입력창 */}
        {activeTab === 'search' && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, maxWidth: 520 }}>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="#kbeauty, #grwm, #skincare ..."
              style={{ flex: 1, padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13, color: '#fff', outline: 'none' }} />
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

        {/* 2단 레이아웃: 그리드 + 사이드바 */}
        <div style={{ display: 'grid', gridTemplateColumns: showSidebar ? '1fr 260px' : '1fr', gap: 24, alignItems: 'start' }}>
          {/* 좌측: 영상 그리드 */}
          <div>
            {loading ? (
              <div style={{ position: 'relative' }}>
                {/* 진행바 */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{loadingMsg}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>약 30~60초 소요</p>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${loadingPct}%`, background: 'linear-gradient(90deg,#FF6B6B,#FF8E53)', borderRadius: 3, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
                {/* 스켈레톤 30개 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, opacity: 0.4 }}>
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ aspectRatio: '9/16', background: 'rgba(255,255,255,0.05)' }} />
                      <div style={{ padding: 12 }}>
                        <div style={{ height: 11, background: 'rgba(255,255,255,0.07)', borderRadius: 4, marginBottom: 8 }} />
                        <div style={{ height: 9, width: '55%', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
                {videos.map(v => (
                  <VideoCard key={v.id} v={v} onClick={() => setSelected(v)} />
                ))}
              </div>
            )}
          </div>

          {/* 우측: 실시간 트렌드 사이드바 */}
          {showSidebar && (
            <TrendSidebar
              category={activeTab as Category}
              onClickTag={clickHashtag}
            />
          )}
        </div>
      </div>

      {selected && <VideoModal video={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

/* ── Generate Result Tabs ── */
const LOADING_MESSAGES = [
  '🔍 레퍼런스 영상 분석 중...',
  '✍️ 한국어 스크립트 작성 중...',
  '🌏 영어(북미) 버전 변환 중...',
  '📷 촬영 가이드 생성 중...',
]

function ScriptBlock({ label, content, onCopy }: { label: string; content: string; onCopy: () => void }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>{label}</span>
        <button onClick={onCopy} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'rgba(255,142,83,0.12)', border: '1px solid rgba(255,142,83,0.28)', color: '#FF8E53', cursor: 'pointer' }}>복사</button>
      </div>
      <pre style={{ fontSize: 13, lineHeight: 1.85, color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px', margin: 0 }}>{content}</pre>
    </div>
  )
}

function HashtagRow({ tags }: { tags: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
      {tags.map(t => (
        <span key={t} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(255,142,83,0.08)', border: '1px solid rgba(255,142,83,0.2)', color: '#FF8E53' }}>{t}</span>
      ))}
    </div>
  )
}

function KoTab({ data }: { data: ScriptOutput['ko'] }) {
  return (
    <div>
      <ScriptBlock label="🎣 후킹 (0~3초)" content={data.hook} onCopy={() => navigator.clipboard.writeText(data.hook)} />
      <ScriptBlock label="📝 본론" content={data.body} onCopy={() => navigator.clipboard.writeText(data.body)} />
      <ScriptBlock label="📣 CTA" content={data.cta} onCopy={() => navigator.clipboard.writeText(data.cta)} />
      <div style={{ marginBottom: 18 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>🏷 추천 해시태그</span>
        <HashtagRow tags={data.hashtags} />
      </div>
      <button onClick={() => navigator.clipboard.writeText(data.full + '\n\n' + data.hashtags.join(' '))} style={{ width: '100%', padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 14, background: 'rgba(255,142,83,0.12)', border: '1px solid rgba(255,142,83,0.28)', color: '#FF8E53', cursor: 'pointer' }}>
        📋 전체 복사
      </button>
    </div>
  )
}

function EnTab({ data }: { data: ScriptOutput['en'] }) {
  return (
    <div>
      <ScriptBlock label="🎣 Hook (0~3s)" content={data.hook} onCopy={() => navigator.clipboard.writeText(data.hook)} />
      <ScriptBlock label="📝 Script" content={data.body} onCopy={() => navigator.clipboard.writeText(data.body)} />
      <ScriptBlock label="📣 CTA" content={data.cta} onCopy={() => navigator.clipboard.writeText(data.cta)} />
      <div style={{ marginBottom: 18 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>🏷 Hashtags</span>
        <HashtagRow tags={data.hashtags} />
      </div>
      <button onClick={() => navigator.clipboard.writeText(data.full + '\n\n' + data.hashtags.join(' '))} style={{ width: '100%', padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 14, background: 'rgba(255,142,83,0.12)', border: '1px solid rgba(255,142,83,0.28)', color: '#FF8E53', cursor: 'pointer' }}>
        📋 Copy All
      </button>
    </div>
  )
}

function TimelineTab({ data }: { data: ScriptOutput['timing'] }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '70px 80px 1fr 1fr', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        {['시간', '액션', '🇰🇷 한국어 스크립트', '🇺🇸 English'].map(h => (
          <div key={h} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</div>
        ))}
        {data.map((row, i) => {
          const bg = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
          return (
            <React.Fragment key={i}>
              <div style={{ padding: '12px', background: bg, fontSize: 12, color: '#FF8E53', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.time}</div>
              <div style={{ padding: '12px', background: bg, fontSize: 12, color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.action}</div>
              <div style={{ padding: '12px', background: bg, fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.koScript}</div>
              <div style={{ padding: '12px', background: bg, fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.enScript}</div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

function GuideTab({ data }: { data: ScriptOutput['shootingGuide'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>🎥 촬영 세팅</p>
        {data.setup.map((s, i) => <p key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>• {s}</p>)}
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>🎬 씬별 가이드</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.scenes.map((sc, i) => (
            <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#FF8E53' }}>{sc.timeRange}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{sc.description}</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>📹 {sc.cameraAngle}</p>
              <p style={{ fontSize: 12, color: '#4ade80' }}>💡 {sc.tip}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', marginBottom: 10 }}>✅ 꼭 해야 할 것</p>
          {data.doList.map((d, i) => <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>• {d}</p>)}
        </div>
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 10 }}>❌ 하면 안 되는 것</p>
          {data.dontList.map((d, i) => <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>• {d}</p>)}
        </div>
      </div>
      <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>💡 편집 & 업로드 팁</p>
        {data.tips.map((t, i) => <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>• {t}</p>)}
      </div>
    </div>
  )
}

/* ── Generate ── */
function Generate() {
  const [searchParams] = useSearchParams()
  const [refs, setRefs] = useState<string[]>([''])
  const [productName, setProductName] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [productFeatures, setProductFeatures] = useState('')
  const [tone, setTone] = useState('gen-z')
  const [duration, setDuration] = useState(45)
  const [target, setTarget] = useState('Gen Z')
  const [language, setLanguage] = useState<'both' | 'ko' | 'en'>('both')
  const [result, setResult] = useState<ScriptOutput | null>(null)
  const [activeResultTab, setActiveResultTab] = useState<'ko' | 'en' | 'timeline' | 'guide'>('ko')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])

  useEffect(() => {
    const topic = searchParams.get('topic')
    const hookType = searchParams.get('hookType')
    const refUrl = searchParams.get('refUrl')
    const dur = searchParams.get('duration')
    if (topic) setProductName(topic)
    if (refUrl) setRefs([refUrl])
    if (dur) setDuration(Number(dur) || 45)
    if (hookType) {
      const toneMap: Record<string, string> = { '궁금증형': 'gen-z', '공감형': 'storytelling', '정보형': 'tutorial', '유머형': 'funny', '전문가형': 'professional' }
      setTone(toneMap[hookType] || 'gen-z')
    }
  }, [searchParams])

  function addRef() { if (refs.length < 3) setRefs([...refs, '']) }
  function removeRef(i: number) { setRefs(refs.filter((_, idx) => idx !== i)) }
  function updateRef(i: number, val: string) { setRefs(refs.map((r, idx) => idx === i ? val : r)) }

  async function handleGenerate() {
    if (!productName.trim()) return
    setLoading(true); setResult(null)
    let msgIdx = 0
    setLoadingMsg(LOADING_MESSAGES[0])
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length
      setLoadingMsg(LOADING_MESSAGES[msgIdx])
    }, 2500)
    const input: GenerateInput = {
      referenceUrls: refs.filter(r => r.trim()),
      productName,
      productUrl: productUrl || undefined,
      productFeatures: productFeatures || undefined,
      tone,
      duration,
      targetAudience: target,
      language,
      hookType: searchParams.get('hookType') || undefined,
    }
    const output = await generateScript(input)
    clearInterval(interval)
    setResult(output)
    setActiveResultTab(language === 'en' ? 'en' : 'ko')
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 7, letterSpacing: 1 }
  const sectionStyle: React.CSSProperties = { marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)' }

  function OptionBtn({ value, current, onClick, children }: { value: string; current: string; onClick: () => void; children: React.ReactNode }) {
    const active = value === current
    return (
      <button onClick={onClick} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', background: active ? 'rgba(255,107,107,0.13)' : 'rgba(255,255,255,0.05)', border: `1px solid ${active ? 'rgba(255,107,107,0.35)' : 'rgba(255,255,255,0.1)'}`, color: active ? '#FF8E53' : 'rgba(255,255,255,0.5)' }}>
        {children}
      </button>
    )
  }

  const fromAnalysis = searchParams.get('ref') === 'analysis'
  const hookType = searchParams.get('hookType')

  return (
    <div style={{ background: '#08080C', minHeight: '100vh', color: '#fff', paddingTop: 60 }}>
      <Nav active="/generate" />
      <style>{FONTS}</style>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '44px 32px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1, marginBottom: 6 }}>✍️ AI 스크립트 생성</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>레퍼런스 영상을 분석해서 나만의 스크립트를 만드세요</p>
        </div>

        {fromAnalysis && hookType && (
          <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 24, background: 'rgba(255,107,107,0.07)', border: '1px solid rgba(255,107,107,0.2)', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
            📊 AI 분석 결과 적용 중 &nbsp;•&nbsp; 후킹 유형: <strong style={{ color: '#FF8E53' }}>{hookType}</strong>
          </div>
        )}

        {/* STEP 1 */}
        <div style={sectionStyle}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#FF8E53', letterSpacing: 1.5, marginBottom: 14 }}>STEP 1. 레퍼런스 영상</p>
          <label style={labelStyle}>참고할 TikTok 영상 링크 (최대 3개, 선택)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {refs.map((ref, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <input value={ref} onChange={e => updateRef(i, e.target.value)} placeholder="https://www.tiktok.com/@username/video/..." style={{ ...inputStyle, flex: 1, borderColor: ref && !ref.includes('tiktok.com') ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.1)' }} />
                {refs.length > 1 && (
                  <button onClick={() => removeRef(i)} style={{ padding: '0 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 16 }}>×</button>
                )}
              </div>
            ))}
            {refs.length < 3 && (
              <button onClick={addRef} style={{ alignSelf: 'flex-start', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>
                + 링크 추가
              </button>
            )}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>디스커버에서 "이 스타일로 만들기" 클릭 시 자동 입력됩니다</p>
        </div>

        {/* STEP 2 */}
        <div style={sectionStyle}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#FF8E53', letterSpacing: 1.5, marginBottom: 14 }}>STEP 2. 내 제품 / 주제</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>제품명 또는 주제 *</label>
              <input value={productName} onChange={e => setProductName(e.target.value)} placeholder="예: 라운드랩 자작나무 에센스" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>제품 링크 (선택 — 쿠팡/올리브영/아마존 등)</label>
              <input value={productUrl} onChange={e => setProductUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>제품 특징 / 어필 포인트 (선택)</label>
              <input value={productFeatures} onChange={e => setProductFeatures(e.target.value)} placeholder="예: 수분 24시간 지속, 민감성 피부 OK, 한방 성분" style={inputStyle} />
            </div>
          </div>
        </div>

        {/* STEP 3 */}
        <div style={sectionStyle}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#FF8E53', letterSpacing: 1.5, marginBottom: 14 }}>STEP 3. 설정</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>영상 톤</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[['gen-z', 'Gen Z 🔥'], ['professional', '전문가 💼'], ['funny', '유머 😂'], ['tutorial', '튜토리얼 📚'], ['storytelling', '스토리텔링 📖'], ['review', '리뷰어 ⭐']].map(([v, l]) => (
                  <OptionBtn key={v} value={v} current={tone} onClick={() => setTone(v)}>{l}</OptionBtn>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>영상 길이</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[15, 30, 45, 60, 90].map(d => (
                  <OptionBtn key={d} value={String(d)} current={String(duration)} onClick={() => setDuration(d)}>{d}초</OptionBtn>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>타겟 시청자</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[['Gen Z', 'Gen Z'], ['밀레니얼', '밀레니얼'], ['30-40대', '30-40대'], ['전체', '전체']].map(([v, l]) => (
                  <OptionBtn key={v} value={v} current={target} onClick={() => setTarget(v)}>{l}</OptionBtn>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>출력 언어</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['both', 'ko', 'en'] as const).map((v) => {
                  const labels = { both: '🇰🇷 한국어 + 🇺🇸 영어', ko: '🇰🇷 한국어만', en: '🇺🇸 영어만' }
                  return <OptionBtn key={v} value={v} current={language} onClick={() => setLanguage(v)}>{labels[v]}</OptionBtn>
                })}
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading || !productName.trim()} style={{ width: '100%', padding: '16px', borderRadius: 12, fontWeight: 700, fontSize: 15, background: loading || !productName.trim() ? 'rgba(255,107,107,0.25)' : 'linear-gradient(135deg,#FF6B6B,#FF8E53)', color: '#fff', border: 'none', cursor: loading || !productName.trim() ? 'not-allowed' : 'pointer', marginBottom: 36 }}>
          {loading ? loadingMsg : '🎬 스크립트 생성하기'}
        </button>

        {/* 결과 */}
        {result && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 0 }}>
              {([
                ['ko', '🇰🇷 한국어'],
                ['en', '🇺🇸 영어(북미)'],
                ['timeline', '📋 타임라인'],
                ['guide', '📷 촬영가이드'],
              ] as const).filter(([key]) => {
                if (language === 'ko' && key === 'en') return false
                if (language === 'en' && key === 'ko') return false
                return true
              }).map(([key, label]) => (
                <button key={key} onClick={() => setActiveResultTab(key)} style={{ padding: '10px 16px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: activeResultTab === key ? 700 : 500, cursor: 'pointer', background: activeResultTab === key ? 'rgba(255,107,107,0.1)' : 'transparent', border: `1px solid ${activeResultTab === key ? 'rgba(255,107,107,0.3)' : 'transparent'}`, borderBottom: activeResultTab === key ? '1px solid #08080C' : '1px solid transparent', color: activeResultTab === key ? '#FF8E53' : 'rgba(255,255,255,0.4)', marginBottom: -1 }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ padding: '4px 0' }}>
              {activeResultTab === 'ko' && <KoTab data={result.ko} />}
              {activeResultTab === 'en' && <EnTab data={result.en} />}
              {activeResultTab === 'timeline' && <TimelineTab data={result.timing} />}
              {activeResultTab === 'guide' && <GuideTab data={result.shootingGuide} />}
            </div>
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
