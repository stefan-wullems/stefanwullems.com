import rehypePrism from '@mapbox/rehype-prism'
import nextMDX from '@next/mdx'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  outputFileTracingIncludes: {
    '/blog/*': ['./src/app/blog/**/*.mdx'],
  },
  images: {
    // OpenGraph previews for the projects page. Served straight from the
    // source sites rather than re-hosted, so they stay in sync.
    remotePatterns: [
      { protocol: 'https', hostname: 'typehyped.com' },
      { protocol: 'https', hostname: 'www.typehyped.com' },
      { protocol: 'https', hostname: 'typemaster.io' },
      { protocol: 'https', hostname: 'www.typemaster.io' },
    ],
  },
  async redirects() {
    return [
      {
        // The post dropped its quadratic half and was renamed; the old path
        // was already live, so keep it pointing somewhere.
        source: '/blog/linear-quadratic-approximation-cheatsheet',
        destination: '/blog/linear-approximation-cheatsheet',
        permanent: true,
      },
    ]
  },
}

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [rehypeKatex, rehypePrism],
  },
})

export default withMDX(nextConfig)
