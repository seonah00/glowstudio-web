export interface HashtagTrend {
  tag: string
  count: string
  change: 'up' | 'down' | 'same' | 'new'
}

export interface DailyTrendData {
  topHashtags: HashtagTrend[]
  risingKeywords: string[]
  updatedAt: string
}

const TREND_DATA: Record<'beauty' | 'lifestyle' | 'vlog', Omit<DailyTrendData, 'updatedAt'>> = {
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

export function getDailyTrends(category: 'beauty' | 'lifestyle' | 'vlog'): DailyTrendData {
  const today = new Date().toDateString()
  const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const data = TREND_DATA[category]
  const top3 = data.topHashtags.slice(0, 3)
  const rest = [...data.topHashtags.slice(3)].sort(() => (seed % 3) - 1)
  const now = new Date().toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  return {
    topHashtags: [...top3, ...rest],
    risingKeywords: data.risingKeywords,
    updatedAt: now,
  }
}
