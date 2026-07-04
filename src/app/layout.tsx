import { type Metadata } from 'next'
import { Fraunces, IBM_Plex_Mono } from 'next/font/google'
import clsx from 'clsx'

import { Providers } from '@/app/providers'
import { Layout } from '@/components/Layout'

import '@/styles/tailwind.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK', 'opsz'],
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
})

export const metadata: Metadata = {
  title: {
    template: '%s - Stefan Wullems',
    default: 'Stefan Wullems',
  },
  description:
    'The personal site of Stefan Wullems — web developer and AI automation engineer. A quiet corner of the internet.',
  alternates: {
    types: {
      'application/rss+xml': `${process.env.NEXT_PUBLIC_SITE_URL}/feed.xml`,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={clsx(
        'dark h-full antialiased',
        fraunces.variable,
        plexMono.variable,
      )}
    >
      <body className="flex h-full bg-[#0a0a0f] text-zinc-100">
        <Providers>
          <div className="flex w-full">
            <Layout>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  )
}
