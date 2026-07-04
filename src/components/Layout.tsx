'use client'

import { usePathname } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'

export function Layout({ children }: { children: React.ReactNode }) {
  let isHomePage = usePathname() === '/'

  if (isHomePage) {
    return <main className="w-full">{children}</main>
  }

  return (
    <div className="relative flex w-full flex-col">
      {/* faint echo of the homepage aurora at the top of inner pages */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_55%_70%_at_30%_-10%,rgba(45,212,191,0.08),transparent),radial-gradient(ellipse_45%_60%_at_75%_-10%,rgba(139,92,246,0.07),transparent)]"
      />
      <Header />
      <main className="relative flex-auto">{children}</main>
      <Footer />
    </div>
  )
}
