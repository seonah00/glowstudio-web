const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export interface ApiCreator {
  username: string
  displayName: string
  followers: number
  followersDisplay: string
  totalLikes: number
  videoCount: number
  avgViews: number
  avgViewsDisplay: string
  engagementRate: string
  isVerified: boolean
  bio: string
  category: string
  keywords: string[]
  tiktokUrl: string
  growthIndicator: 'hot' | 'rising' | 'stable'
}

export async function getCreatorsByCategory(
  category: string,
  limit = 20,
): Promise<ApiCreator[]> {
  const res = await fetch(
    `${SERVER_URL}/creators?category=${category}&limit=${limit}`,
    { signal: AbortSignal.timeout(100000) },
  )
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `서버 오류 ${res.status}`)
  }
  const data = await res.json()
  return data.creators as ApiCreator[]
}
