import { MetadataRoute } from 'next'
import { campaigns } from '@/lib/campaigns'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://williamdelbarrio.com'

  const routes = [
    '',
    '/portfolio',
    '/about',
    '/login',
    '/services/casamentos',
    '/services/ensaios',
    '/services/eventos',
    '/services/video',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const campaignRoutes = campaigns.map((campaign) => ({
    url: `${baseUrl}/c/${campaign.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [...routes, ...campaignRoutes]
}
