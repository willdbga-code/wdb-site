import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/login', '/register', '/unlock'],
    },
    sitemap: 'https://williamdelbarrio.com/sitemap.xml',
  }
}
