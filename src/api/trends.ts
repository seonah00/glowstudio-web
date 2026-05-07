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

export interface Creator {
  username: string
  displayName: string
  followers: string
  followersNum: number
  followerGrowthNum: string
  followerGrowthPct: string
  growthPctNum: number
  avgViews: string
  avgViewsNum: number
  category: 'beauty' | 'lifestyle' | 'vlog'
  keywords: string[]
  isRising: boolean
  tiktokUrl: string
}

export type CreatorSort = 'growth_pct' | 'growth_num' | 'avg_views' | 'followers'

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

// ── Creator Data ──

const CREATORS: Creator[] = [
  // Beauty
  { username: 'saebyeol.wellness', displayName: 'Saebyeol', followers: '442K', followersNum: 442000, followerGrowthNum: '+18.2K', followerGrowthPct: '+4.3%', growthPctNum: 4.3, avgViews: '380K', avgViewsNum: 380000, category: 'beauty', isRising: false, keywords: ['kbeauty', 'over40', 'koreanskincare'], tiktokUrl: 'https://tiktok.com/@saebyeol.wellness' },
  { username: 'glowwithsoo', displayName: 'Soo Kim', followers: '89K', followersNum: 89000, followerGrowthNum: '+6.1K', followerGrowthPct: '+7.3%', growthPctNum: 7.3, avgViews: '210K', avgViewsNum: 210000, category: 'beauty', isRising: true, keywords: ['glassskin', 'skincareroutine', 'affordable'], tiktokUrl: 'https://tiktok.com/@glowwithsoo' },
  { username: 'beautybyjen', displayName: 'Jen Park', followers: '234K', followersNum: 234000, followerGrowthNum: '+2.3K', followerGrowthPct: '+1.0%', growthPctNum: 1.0, avgViews: '156K', avgViewsNum: 156000, category: 'beauty', isRising: false, keywords: ['kbeauty', 'grwm', 'makeuptutorial'], tiktokUrl: 'https://tiktok.com/@beautybyjen' },
  { username: 'kbeautyhaven', displayName: 'Mia Seoul', followers: '67K', followersNum: 67000, followerGrowthNum: '+8.9K', followerGrowthPct: '+15.3%', growthPctNum: 15.3, avgViews: '340K', avgViewsNum: 340000, category: 'beauty', isRising: true, keywords: ['skincycling', 'slugging', 'kbeauty'], tiktokUrl: 'https://tiktok.com/@kbeautyhaven' },
  { username: 'radiantskin.kr', displayName: 'Rachel K', followers: '512K', followersNum: 512000, followerGrowthNum: '+3.1K', followerGrowthPct: '+0.6%', growthPctNum: 0.6, avgViews: '290K', avgViewsNum: 290000, category: 'beauty', isRising: false, keywords: ['skincare', 'antiaging', 'koreanbeauty'], tiktokUrl: 'https://tiktok.com/@radiantskin.kr' },
  { username: 'skintok.hana', displayName: 'Hana Choi', followers: '143K', followersNum: 143000, followerGrowthNum: '+11.4K', followerGrowthPct: '+8.7%', growthPctNum: 8.7, avgViews: '420K', avgViewsNum: 420000, category: 'beauty', isRising: true, keywords: ['glassskin', 'niacinamide', 'kbeauty'], tiktokUrl: 'https://tiktok.com/@skintok.hana' },
  { username: 'unnibeauty', displayName: 'Unni Beauty', followers: '328K', followersNum: 328000, followerGrowthNum: '+4.2K', followerGrowthPct: '+1.3%', growthPctNum: 1.3, avgViews: '185K', avgViewsNum: 185000, category: 'beauty', isRising: false, keywords: ['kbeauty', 'makeuptutorial', 'grwm'], tiktokUrl: 'https://tiktok.com/@unnibeauty' },
  { username: 'seoulglowup', displayName: 'Yuna L', followers: '52K', followersNum: 52000, followerGrowthNum: '+7.3K', followerGrowthPct: '+16.3%', growthPctNum: 16.3, avgViews: '290K', avgViewsNum: 290000, category: 'beauty', isRising: true, keywords: ['slugging', 'skincycling', 'ceramide'], tiktokUrl: 'https://tiktok.com/@seoulglowup' },
  { username: 'kbeauty.insider', displayName: 'Min Ji', followers: '198K', followersNum: 198000, followerGrowthNum: '+5.6K', followerGrowthPct: '+2.9%', growthPctNum: 2.9, avgViews: '230K', avgViewsNum: 230000, category: 'beauty', isRising: false, keywords: ['koreanskincare', 'affordable', 'review'], tiktokUrl: 'https://tiktok.com/@kbeauty.insider' },
  { username: 'dewyskin.daily', displayName: 'Clara Song', followers: '76K', followersNum: 76000, followerGrowthNum: '+9.8K', followerGrowthPct: '+14.8%', growthPctNum: 14.8, avgViews: '360K', avgViewsNum: 360000, category: 'beauty', isRising: true, keywords: ['dewyskim', 'hyaluronicacid', 'kbeauty'], tiktokUrl: 'https://tiktok.com/@dewyskin.daily' },
  { username: 'koreanskin.rx', displayName: 'Dr. Yoon', followers: '621K', followersNum: 621000, followerGrowthNum: '+2.8K', followerGrowthPct: '+0.5%', growthPctNum: 0.5, avgViews: '410K', avgViewsNum: 410000, category: 'beauty', isRising: false, keywords: ['skincare', 'retinol', 'dermatology'], tiktokUrl: 'https://tiktok.com/@koreanskin.rx' },
  { username: 'glassskin.diary', displayName: 'Nari Kim', followers: '38K', followersNum: 38000, followerGrowthNum: '+5.2K', followerGrowthPct: '+15.9%', growthPctNum: 15.9, avgViews: '275K', avgViewsNum: 275000, category: 'beauty', isRising: true, keywords: ['glassskin', 'essenceskincare', 'kbeauty'], tiktokUrl: 'https://tiktok.com/@glassskin.diary' },
  { username: 'beautyseoul', displayName: 'Sophie Han', followers: '289K', followersNum: 289000, followerGrowthNum: '+3.7K', followerGrowthPct: '+1.3%', growthPctNum: 1.3, avgViews: '170K', avgViewsNum: 170000, category: 'beauty', isRising: false, keywords: ['kbeauty', 'grwm', 'koreanmakeup'], tiktokUrl: 'https://tiktok.com/@beautyseoul' },
  { username: 'skinroutine.kr', displayName: 'Amy Bae', followers: '115K', followersNum: 115000, followerGrowthNum: '+6.8K', followerGrowthPct: '+6.3%', growthPctNum: 6.3, avgViews: '315K', avgViewsNum: 315000, category: 'beauty', isRising: true, keywords: ['morningroutine', 'nightroutine', 'kbeauty'], tiktokUrl: 'https://tiktok.com/@skinroutine.kr' },
  { username: 'k.glow.official', displayName: 'K Glow', followers: '447K', followersNum: 447000, followerGrowthNum: '+1.9K', followerGrowthPct: '+0.4%', growthPctNum: 0.4, avgViews: '220K', avgViewsNum: 220000, category: 'beauty', isRising: false, keywords: ['kbeauty', 'skincare', 'review'], tiktokUrl: 'https://tiktok.com/@k.glow.official' },

  // Lifestyle
  { username: 'mornings.with.ji', displayName: 'Ji Yeon', followers: '183K', followersNum: 183000, followerGrowthNum: '+14.2K', followerGrowthPct: '+8.4%', growthPctNum: 8.4, avgViews: '510K', avgViewsNum: 510000, category: 'lifestyle', isRising: true, keywords: ['morningroutine', '5amclub', 'wellness'], tiktokUrl: 'https://tiktok.com/@mornings.with.ji' },
  { username: 'slowliving.seoul', displayName: 'Eunji Park', followers: '96K', followersNum: 96000, followerGrowthNum: '+9.1K', followerGrowthPct: '+10.5%', growthPctNum: 10.5, avgViews: '380K', avgViewsNum: 380000, category: 'lifestyle', isRising: true, keywords: ['slowliving', 'mindfulness', 'wellness'], tiktokUrl: 'https://tiktok.com/@slowliving.seoul' },
  { username: 'wellnessbysorae', displayName: 'So Rae', followers: '374K', followersNum: 374000, followerGrowthNum: '+4.5K', followerGrowthPct: '+1.2%', growthPctNum: 1.2, avgViews: '260K', avgViewsNum: 260000, category: 'lifestyle', isRising: false, keywords: ['wellness', 'selfcare', 'koreanwellness'], tiktokUrl: 'https://tiktok.com/@wellnessbysorae' },
  { username: 'daily.haneul', displayName: 'Haneul', followers: '61K', followersNum: 61000, followerGrowthNum: '+8.4K', followerGrowthPct: '+15.9%', growthPctNum: 15.9, avgViews: '445K', avgViewsNum: 445000, category: 'lifestyle', isRising: true, keywords: ['dayinmylife', 'quietluxury', 'koreandiet'], tiktokUrl: 'https://tiktok.com/@daily.haneul' },
  { username: 'cleanlife.kr', displayName: 'Bomi Shin', followers: '227K', followersNum: 227000, followerGrowthNum: '+3.2K', followerGrowthPct: '+1.4%', growthPctNum: 1.4, avgViews: '190K', avgViewsNum: 190000, category: 'lifestyle', isRising: false, keywords: ['cleanlifestyle', 'plantbased', 'wellness'], tiktokUrl: 'https://tiktok.com/@cleanlife.kr' },
  { username: 'pilates.jieun', displayName: 'Jieun Oh', followers: '158K', followersNum: 158000, followerGrowthNum: '+7.6K', followerGrowthPct: '+5.1%', growthPctNum: 5.1, avgViews: '330K', avgViewsNum: 330000, category: 'lifestyle', isRising: true, keywords: ['pilates', 'gymtok', 'wellness'], tiktokUrl: 'https://tiktok.com/@pilates.jieun' },
  { username: 'koreandiet.tips', displayName: 'Na Young', followers: '312K', followersNum: 312000, followerGrowthNum: '+2.6K', followerGrowthPct: '+0.8%', growthPctNum: 0.8, avgViews: '210K', avgViewsNum: 210000, category: 'lifestyle', isRising: false, keywords: ['koreandiet', 'mealprep', 'healthylifestyle'], tiktokUrl: 'https://tiktok.com/@koreandiet.tips' },
  { username: 'journaling.sora', displayName: 'Sora', followers: '44K', followersNum: 44000, followerGrowthNum: '+5.9K', followerGrowthPct: '+15.5%', growthPctNum: 15.5, avgViews: '390K', avgViewsNum: 390000, category: 'lifestyle', isRising: true, keywords: ['journaling', 'mindfulness', 'estudylife'], tiktokUrl: 'https://tiktok.com/@journaling.sora' },
  { username: 'seoulwellness', displayName: 'Dain Choi', followers: '195K', followersNum: 195000, followerGrowthNum: '+3.8K', followerGrowthPct: '+2.0%', growthPctNum: 2.0, avgViews: '240K', avgViewsNum: 240000, category: 'lifestyle', isRising: false, keywords: ['koreanwellness', 'selfcare', 'holistichealth'], tiktokUrl: 'https://tiktok.com/@seoulwellness' },
  { username: 'morningwalk.kr', displayName: 'Gaeun Lee', followers: '78K', followersNum: 78000, followerGrowthNum: '+6.2K', followerGrowthPct: '+8.6%', growthPctNum: 8.6, avgViews: '350K', avgViewsNum: 350000, category: 'lifestyle', isRising: true, keywords: ['morningwalk', 'dailyreset', '5amclub'], tiktokUrl: 'https://tiktok.com/@morningwalk.kr' },
  { username: 'quietluxury.k', displayName: 'Kyuri Han', followers: '134K', followersNum: 134000, followerGrowthNum: '+4.9K', followerGrowthPct: '+3.8%', growthPctNum: 3.8, avgViews: '280K', avgViewsNum: 280000, category: 'lifestyle', isRising: false, keywords: ['quietluxury', 'dayinmylife', 'aesthetic'], tiktokUrl: 'https://tiktok.com/@quietluxury.k' },
  { username: 'breathe.with.yuna', displayName: 'Yuna M', followers: '29K', followersNum: 29000, followerGrowthNum: '+4.6K', followerGrowthPct: '+18.8%', growthPctNum: 18.8, avgViews: '460K', avgViewsNum: 460000, category: 'lifestyle', isRising: true, keywords: ['breathwork', 'meditationtok', 'holistichealth'], tiktokUrl: 'https://tiktok.com/@breathe.with.yuna' },
  { username: 'routinevlog.kr', displayName: 'Haerin', followers: '256K', followersNum: 256000, followerGrowthNum: '+1.8K', followerGrowthPct: '+0.7%', growthPctNum: 0.7, avgViews: '175K', avgViewsNum: 175000, category: 'lifestyle', isRising: false, keywords: ['routinevlog', 'morningroutine', 'nightroutine'], tiktokUrl: 'https://tiktok.com/@routinevlog.kr' },
  { username: 'kfit.official', displayName: 'Joon K', followers: '412K', followersNum: 412000, followerGrowthNum: '+3.3K', followerGrowthPct: '+0.8%', growthPctNum: 0.8, avgViews: '300K', avgViewsNum: 300000, category: 'lifestyle', isRising: false, keywords: ['gymtok', 'koreanfitness', 'pilates'], tiktokUrl: 'https://tiktok.com/@kfit.official' },
  { username: 'digitaldetox.kr', displayName: 'Seori', followers: '37K', followersNum: 37000, followerGrowthNum: '+5.7K', followerGrowthPct: '+17.1%', growthPctNum: 17.1, avgViews: '520K', avgViewsNum: 520000, category: 'lifestyle', isRising: true, keywords: ['digitaldétox', 'slowliving', 'mindfulness'], tiktokUrl: 'https://tiktok.com/@digitaldetox.kr' },
  { username: 'greenjuice.life', displayName: 'Miso Jung', followers: '103K', followersNum: 103000, followerGrowthNum: '+4.1K', followerGrowthPct: '+4.1%', growthPctNum: 4.1, avgViews: '225K', avgViewsNum: 225000, category: 'lifestyle', isRising: false, keywords: ['greenjuice', 'plantbased', 'koreandiet'], tiktokUrl: 'https://tiktok.com/@greenjuice.life' },

  // Vlog
  { username: 'seouldiaries.kr', displayName: 'Somi', followers: '521K', followersNum: 521000, followerGrowthNum: '+5.8K', followerGrowthPct: '+1.1%', growthPctNum: 1.1, avgViews: '480K', avgViewsNum: 480000, category: 'vlog', isRising: false, keywords: ['seoulvlog', 'koreandaily', 'cafevlog'], tiktokUrl: 'https://tiktok.com/@seouldiaries.kr' },
  { username: 'studyvlog.hani', displayName: 'Hani', followers: '87K', followersNum: 87000, followerGrowthNum: '+10.2K', followerGrowthPct: '+13.3%', growthPctNum: 13.3, avgViews: '590K', avgViewsNum: 590000, category: 'vlog', isRising: true, keywords: ['studyvlog', 'koreancollege', 'dayinmylife'], tiktokUrl: 'https://tiktok.com/@studyvlog.hani' },
  { username: 'workday.seoul', displayName: 'Jisoo K', followers: '143K', followersNum: 143000, followerGrowthNum: '+7.3K', followerGrowthPct: '+5.4%', growthPctNum: 5.4, avgViews: '370K', avgViewsNum: 370000, category: 'vlog', isRising: true, keywords: ['workdayvlog', 'koreanoffice', 'dayinmylife'], tiktokUrl: 'https://tiktok.com/@workday.seoul' },
  { username: 'cafehop.seoul', displayName: 'Rona Lim', followers: '209K', followersNum: 209000, followerGrowthNum: '+4.4K', followerGrowthPct: '+2.1%', growthPctNum: 2.1, avgViews: '310K', avgViewsNum: 310000, category: 'vlog', isRising: false, keywords: ['cafevlog', 'seoulcafe', 'homebaristatok'], tiktokUrl: 'https://tiktok.com/@cafehop.seoul' },
  { username: 'hanok.life', displayName: 'Daeun', followers: '48K', followersNum: 48000, followerGrowthNum: '+7.8K', followerGrowthPct: '+19.4%', growthPctNum: 19.4, avgViews: '620K', avgViewsNum: 620000, category: 'vlog', isRising: true, keywords: ['hanokstay', 'koreatravel', 'seoulvlog'], tiktokUrl: 'https://tiktok.com/@hanok.life' },
  { username: 'foreignerinseoul', displayName: 'Emma K', followers: '387K', followersNum: 387000, followerGrowthNum: '+3.6K', followerGrowthPct: '+0.9%', growthPctNum: 0.9, avgViews: '420K', avgViewsNum: 420000, category: 'vlog', isRising: false, keywords: ['foreignerinkorea', 'seoulvlog', 'koreandaily'], tiktokUrl: 'https://tiktok.com/@foreignerinseoul' },
  { username: 'busanvlog.daily', displayName: 'Taehee', followers: '62K', followersNum: 62000, followerGrowthNum: '+8.1K', followerGrowthPct: '+15.0%', growthPctNum: 15.0, avgViews: '430K', avgViewsNum: 430000, category: 'vlog', isRising: true, keywords: ['busanvlog', 'koreatravel', 'koreafood'], tiktokUrl: 'https://tiktok.com/@busanvlog.daily' },
  { username: 'hongdae.nights', displayName: 'Jay Seoul', followers: '176K', followersNum: 176000, followerGrowthNum: '+5.1K', followerGrowthPct: '+3.0%', growthPctNum: 3.0, avgViews: '295K', avgViewsNum: 295000, category: 'vlog', isRising: false, keywords: ['hongdae', 'seoulvlog', 'koreanlifestyle'], tiktokUrl: 'https://tiktok.com/@hongdae.nights' },
  { username: 'jejulife.kr', displayName: 'Sumin', followers: '94K', followersNum: 94000, followerGrowthNum: '+6.7K', followerGrowthPct: '+7.7%', growthPctNum: 7.7, avgViews: '480K', avgViewsNum: 480000, category: 'vlog', isRising: true, keywords: ['jejuvlog', 'koreatravel', 'hanokstay'], tiktokUrl: 'https://tiktok.com/@jejulife.kr' },
  { username: 'koreandorm.life', displayName: 'Naeun', followers: '71K', followersNum: 71000, followerGrowthNum: '+7.9K', followerGrowthPct: '+12.5%', growthPctNum: 12.5, avgViews: '540K', avgViewsNum: 540000, category: 'vlog', isRising: true, keywords: ['koreandorm', 'studyvlog', 'koreancollege'], tiktokUrl: 'https://tiktok.com/@koreandorm.life' },
  { username: 'gyeongbok.daily', displayName: 'Saerom', followers: '134K', followersNum: 134000, followerGrowthNum: '+4.0K', followerGrowthPct: '+3.1%', growthPctNum: 3.1, avgViews: '260K', avgViewsNum: 260000, category: 'vlog', isRising: false, keywords: ['gyeongbokgung', 'koreatravel', 'seoulvlog'], tiktokUrl: 'https://tiktok.com/@gyeongbok.daily' },
  { username: 'koreahaul.official', displayName: 'Yoonji', followers: '298K', followersNum: 298000, followerGrowthNum: '+2.9K', followerGrowthPct: '+1.0%', growthPctNum: 1.0, avgViews: '220K', avgViewsNum: 220000, category: 'vlog', isRising: false, keywords: ['koreahaul', 'koreafood', 'koreandaily'], tiktokUrl: 'https://tiktok.com/@koreahaul.official' },
  { username: 'jeonju.vlog', displayName: 'Hyeri', followers: '33K', followersNum: 33000, followerGrowthNum: '+5.4K', followerGrowthPct: '+19.6%', growthPctNum: 19.6, avgViews: '670K', avgViewsNum: 670000, category: 'vlog', isRising: true, keywords: ['jeonjuvlog', 'koreatravel', 'koreafood'], tiktokUrl: 'https://tiktok.com/@jeonju.vlog' },
  { username: 'namsan.daily', displayName: 'Woorin', followers: '158K', followersNum: 158000, followerGrowthNum: '+3.5K', followerGrowthPct: '+2.3%', growthPctNum: 2.3, avgViews: '245K', avgViewsNum: 245000, category: 'vlog', isRising: false, keywords: ['namsan', 'seoulvlog', 'weekendvlog'], tiktokUrl: 'https://tiktok.com/@namsan.daily' },
  { username: 'sinchon.life', displayName: 'Jihyo L', followers: '55K', followersNum: 55000, followerGrowthNum: '+6.3K', followerGrowthPct: '+12.9%', growthPctNum: 12.9, avgViews: '400K', avgViewsNum: 400000, category: 'vlog', isRising: true, keywords: ['sinchon', 'koreancollege', 'studyvlog'], tiktokUrl: 'https://tiktok.com/@sinchon.life' },
]

export function getCreators(
  category: 'beauty' | 'lifestyle' | 'vlog',
  sortBy: CreatorSort = 'growth_pct',
  filterKeywords: string[] = [],
): Creator[] {
  const today = new Date().toDateString()
  const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0)

  let list = CREATORS.filter(c => c.category === category)

  if (filterKeywords.length > 0) {
    list = list.filter(c => filterKeywords.every(kw => c.keywords.includes(kw)))
  }

  // 날짜 시드로 성장률 소폭 변동
  list = list.map(c => ({
    ...c,
    growthPctNum: +(c.growthPctNum + ((seed % 5) - 2) * 0.1).toFixed(1),
  }))

  return list.sort((a, b) => {
    if (sortBy === 'growth_pct') return b.growthPctNum - a.growthPctNum
    if (sortBy === 'growth_num') return b.followersNum - a.followersNum
    if (sortBy === 'avg_views') return b.avgViewsNum - a.avgViewsNum
    return b.followersNum - a.followersNum
  })
}
