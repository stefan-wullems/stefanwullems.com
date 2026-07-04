import Link from 'next/link'

import { AuroraHero } from '@/components/AuroraHero'

function QuietLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const external = href.startsWith('http')
  return (
    <Link
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="text-zinc-500 transition duration-300 hover:text-teal-300 hover:[text-shadow:0_0_12px_rgba(45,212,191,0.5)]"
    >
      {children}
    </Link>
  )
}

export default function Home() {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#0a0a0f]">
      <AuroraHero text="what’s up?" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-7 pb-12 sm:pb-16">
        <h1 className="animate-hero-fade font-display text-3xl font-semibold tracking-tight text-zinc-100 [animation-delay:1.8s] sm:text-4xl">
          Stefan Wullems
        </h1>
        <p className="animate-hero-fade -mt-3 font-mono text-[0.7rem] tracking-[0.45em] text-zinc-500 uppercase [animation-delay:2.2s]">
          web developer&ensp;·&ensp;ai automation
        </p>
        <nav
          aria-label="Main"
          className="animate-hero-fade pointer-events-auto flex gap-7 font-mono text-xs tracking-[0.2em] lowercase [animation-delay:2.8s] sm:gap-9"
        >
          <QuietLink href="/about">about</QuietLink>
          <QuietLink href="/sops">sops</QuietLink>
          <QuietLink href="https://github.com/stefan-wullems">github</QuietLink>
          <QuietLink href="https://www.linkedin.com/in/stefan-wullems-572854242/">
            linkedin
          </QuietLink>
        </nav>
      </div>
    </div>
  )
}
