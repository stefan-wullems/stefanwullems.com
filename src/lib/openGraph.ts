import * as cheerio from 'cheerio'

export interface OpenGraph {
  title?: string
  description?: string
  image?: string
  imageWidth?: number
  imageHeight?: number
}

/**
 * Reads the OpenGraph tags off a page so we can render a real link preview.
 *
 * Runs on the server at build time. Network calls during a build are a
 * liability, so a failure here resolves to an empty object rather than
 * throwing: the card falls back to the copy we already have and the build
 * still succeeds.
 */
export async function fetchOpenGraph(url: string): Promise<OpenGraph> {
  try {
    let response = await fetch(url, {
      headers: {
        // Some hosts serve a stripped page to unknown agents.
        'user-agent':
          'Mozilla/5.0 (compatible; stefanwullems.com link preview)',
      },
      // Re-check daily; these images change rarely.
      next: { revalidate: 60 * 60 * 24 },
    })

    if (!response.ok) return {}

    let $ = cheerio.load(await response.text())
    let meta = (property: string) =>
      $(`meta[property="${property}"]`).attr('content') ??
      $(`meta[name="${property}"]`).attr('content')

    let width = meta('og:image:width')
    let height = meta('og:image:height')

    return {
      title: meta('og:title'),
      description: meta('og:description'),
      image: meta('og:image') ?? meta('twitter:image'),
      imageWidth: width ? Number(width) : undefined,
      imageHeight: height ? Number(height) : undefined,
    }
  } catch {
    return {}
  }
}
