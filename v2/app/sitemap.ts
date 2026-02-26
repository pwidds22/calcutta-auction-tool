import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'
import { listTournamentsWithTeams } from '@/lib/tournaments/registry'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://calcuttaedge.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/login`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/register`, changeFrequency: 'monthly', priority: 0.6 },
  ]

  // Blog posts
  const posts = getAllPosts()
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date + 'T00:00:00'),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...blogPages]
}
