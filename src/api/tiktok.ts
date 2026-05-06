const APIFY_TOKEN = import.meta.env.VITE_APIFY_API_KEY
const ACTOR_ID = 'clockworks~free-tiktok-scraper'
const BASE_URL = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items`

interface ApifyItem {
  id: string
  text?: string
  desc?: string
  authorMeta?: { name?: string; avatar?: string }
  author?: { uniqueId?: string }
  videoMeta?: { duration?: number; coverUrl?: string }
  video?: { duration?: number; cover?: string }
  covers?: { default?: string }
  playCount?: number
  diggCount?: number
  commentCount?: number
  shareCount?: number
  webVideoUrl?: string
  stats?: {
    playCount?: number
    diggCount?: number
    commentCount?: number
  }
}

export interface Video {
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

function mapItem(item: ApifyItem): Video {
  const authorName = item.authorMeta?.name || item.author?.uniqueId || 'unknown'
  return {
    id: item.id,
    text: item.text || item.desc || '',
    authorMeta: { name: authorName, avatar: item.authorMeta?.avatar },
    videoMeta: {
      duration: item.videoMeta?.duration || item.video?.duration || 0,
      coverUrl: item.videoMeta?.coverUrl || item.covers?.default || item.video?.cover || '',
    },
    playCount: item.playCount || item.stats?.playCount || 0,
    diggCount: item.diggCount || item.stats?.diggCount || 0,
    commentCount: item.commentCount || item.stats?.commentCount || 0,
    shareCount: item.shareCount || 0,
    webVideoUrl: item.webVideoUrl || `https://www.tiktok.com/@${authorName}/video/${item.id}`,
  }
}

export async function searchTikTok(hashtag: string, limit = 12): Promise<Video[]> {
  const url = `${BASE_URL}?token=${APIFY_TOKEN}&timeout=60`
  const body = {
    hashtags: [hashtag.replace(/^#/, '')],
    resultsPerPage: limit,
    maxProfilesPerQuery: 1,
    shouldDownloadVideos: false,
    shouldDownloadCovers: true,
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(65000),
  })
  if (!res.ok) throw new Error(`Apify error ${res.status}`)
  const items: ApifyItem[] = await res.json()
  return items.map(mapItem)
}

export async function getTrends(category: 'beauty' | 'lifestyle' | 'vlog', limit = 30): Promise<Video[]> {
  const hashtagMap = {
    beauty: ['kbeauty', 'skincare', 'glassskin', 'grwm', 'makeuptutorial'],
    lifestyle: ['lifestyle', 'morningroutine', 'dayinmylife', 'wellness'],
    vlog: ['vlog', 'koreandaily', 'seoulvlog', 'studyvlog'],
  }
  const hashtags = hashtagMap[category]
  const url = `${BASE_URL}?token=${APIFY_TOKEN}&timeout=60`
  const body = {
    hashtags,
    resultsPerPage: Math.ceil(limit / hashtags.length),
    shouldDownloadCovers: true,
    shouldDownloadVideos: false,
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(65000),
  })
  if (!res.ok) throw new Error(`Apify error ${res.status}`)
  const items: ApifyItem[] = await res.json()
  return items.map(mapItem)
}
