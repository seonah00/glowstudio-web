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
      { tag: '#skintok', count: '490K', change: 'up' },
      { tag: '#cleanskincare', count: '430K', change: 'up' },
      { tag: '#koreanskincare', count: '410K', change: 'same' },
      { tag: '#slugging', count: '390K', change: 'up' },
      { tag: '#skincycling', count: '370K', change: 'new' },
      { tag: '#beautyover30', count: '340K', change: 'up' },
      { tag: '#morningroutine', count: '320K', change: 'same' },
      { tag: '#nightroutine', count: '300K', change: 'up' },
      { tag: '#sunscreentok', count: '280K', change: 'new' },
      { tag: '#tonerup', count: '260K', change: 'up' },
      { tag: '#essenceskincare', count: '240K', change: 'up' },
      { tag: '#ampoule', count: '220K', change: 'same' },
      { tag: '#sheetmask', count: '200K', change: 'down' },
      { tag: '#microneedling', count: '185K', change: 'up' },
      { tag: '#retinolroutine', count: '170K', change: 'up' },
      { tag: '#ceramideskincare', count: '155K', change: 'new' },
      { tag: '#niacinamide', count: '140K', change: 'same' },
      { tag: '#hyaluronicacid', count: '128K', change: 'down' },
      { tag: '#vitamincskincare', count: '115K', change: 'up' },
      { tag: '#peptides', count: '102K', change: 'new' },
      { tag: '#acneskincare', count: '95K', change: 'up' },
      { tag: '#sensitiveskim', count: '88K', change: 'same' },
      { tag: '#oilyskincare', count: '76K', change: 'up' },
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
      { tag: '#healthylifestyle', count: '610K', change: 'up' },
      { tag: '#quietluxury', count: '570K', change: 'new' },
      { tag: '#slowliving', count: '530K', change: 'up' },
      { tag: '#journaling', count: '490K', change: 'same' },
      { tag: '#meditationtok', count: '450K', change: 'up' },
      { tag: '#pilates', count: '420K', change: 'up' },
      { tag: '#cleanlifestyle', count: '390K', change: 'new' },
      { tag: '#gymtok', count: '360K', change: 'up' },
      { tag: '#mealprep', count: '330K', change: 'same' },
      { tag: '#plantbased', count: '300K', change: 'down' },
      { tag: '#digitaldétox', count: '275K', change: 'new' },
      { tag: '#koreandiet', count: '250K', change: 'up' },
      { tag: '#nightroutine', count: '225K', change: 'up' },
      { tag: '#morningwalk', count: '205K', change: 'up' },
      { tag: '#productivitytok', count: '185K', change: 'same' },
      { tag: '#estudylife', count: '165K', change: 'up' },
      { tag: '#holistichealth', count: '148K', change: 'new' },
      { tag: '#worklifebalance', count: '132K', change: 'down' },
      { tag: '#greenjuice', count: '118K', change: 'up' },
      { tag: '#koreanfitness', count: '104K', change: 'up' },
      { tag: '#breathwork', count: '92K', change: 'new' },
      { tag: '#naturalskincare', count: '81K', change: 'same' },
      { tag: '#dailyreset', count: '70K', change: 'up' },
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
      { tag: '#dailyvlog', count: '400K', change: 'same' },
      { tag: '#koreatravel', count: '375K', change: 'up' },
      { tag: '#weekendvlog', count: '350K', change: 'up' },
      { tag: '#koreafood', count: '320K', change: 'new' },
      { tag: '#seoulcafe', count: '295K', change: 'up' },
      { tag: '#hanokstay', count: '268K', change: 'new' },
      { tag: '#busanvlog', count: '245K', change: 'up' },
      { tag: '#koreandorm', count: '220K', change: 'up' },
      { tag: '#foreignerinkorea', count: '198K', change: 'same' },
      { tag: '#gyeongbokgung', count: '178K', change: 'up' },
      { tag: '#koreanoffice', count: '158K', change: 'new' },
      { tag: '#koreanlunch', count: '140K', change: 'up' },
      { tag: '#namsan', count: '124K', change: 'same' },
      { tag: '#koreahaul', count: '110K', change: 'up' },
      { tag: '#homebaristatok', count: '98K', change: 'up' },
      { tag: '#koreansubway', count: '86K', change: 'new' },
      { tag: '#hongdae', count: '75K', change: 'up' },
      { tag: '#sinchon', count: '64K', change: 'same' },
      { tag: '#koreancollege', count: '54K', change: 'up' },
      { tag: '#itaewon', count: '46K', change: 'down' },
      { tag: '#jeonjuvlog', count: '38K', change: 'new' },
      { tag: '#jejuvlog', count: '32K', change: 'up' },
      { tag: '#koreanwinter', count: '27K', change: 'up' },
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
