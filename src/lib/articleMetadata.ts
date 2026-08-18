import { type Metadata } from 'next'

import { siteConfig } from '@/lib/siteConfig'

interface ArticleFrontmatter {
  title: string
  description: string
  date: string
  author: string
  tags?: string[]
}

/**
 * Per-post metadata. Without this each article inherits the site-wide
 * OpenGraph block, so every share card would read "Stefan Wullems" instead of
 * the post's own title.
 */
export function articleMetadata(
  article: ArticleFrontmatter,
  slug: string,
): Metadata {
  let url = `${siteConfig.url}/blog/${slug}`

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      url,
      siteName: siteConfig.name,
      publishedTime: article.date,
      authors: [siteConfig.url],
      tags: article.tags ? [...article.tags] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  }
}
