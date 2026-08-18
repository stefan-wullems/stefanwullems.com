import { type MetadataRoute } from 'next'

import { getAllPosts, getAllTags } from '@/lib/blog'
import { siteConfig } from '@/lib/siteConfig'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let [posts, tags] = await Promise.all([getAllPosts(), getAllTags()])

  let newest = posts.reduce<string | undefined>(
    (latest, post) => (!latest || post.date > latest ? post.date : latest),
    undefined,
  )

  let staticPages: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteConfig.url}/about`, changeFrequency: 'yearly', priority: 0.8 },
    {
      url: `${siteConfig.url}/projects`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: newest,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  return [
    ...staticPages,
    ...posts.map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
    ...tags.map((tag) => ({
      url: `${siteConfig.url}/blog/tag/${tag}`,
      lastModified: newest,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    })),
  ]
}
