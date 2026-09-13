import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export default async function robots(): Promise<MetadataRoute.Robots> {
  let host = ''
  try {
    const headersList = await headers()
    host = (headersList.get('host') || '').toLowerCase()
  } catch {
    host = ''
  }

  // Sadece temin360app.demo.ilyasbozdemir.dev domaininde veya NO_INDEX / ENVIRONMENT=demo ortamında disallow
  const isDemoDomain =
    host.includes('temin360app.demo.ilyasbozdemir.dev') ||
    host.includes('demo.ilyasbozdemir.dev') ||
    process.env.NO_INDEX === 'true' ||
    process.env.NEXT_PUBLIC_NO_INDEX === 'true' ||
    process.env.ENVIRONMENT === 'demo'

  if (isDemoDomain) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  const siteUrl = host ? `https://${host}` : 'https://temin360.ilyasbozdemir.dev'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
