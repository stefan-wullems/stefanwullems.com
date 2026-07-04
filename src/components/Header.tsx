'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

import { Container } from '@/components/Container'

function NavItem({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  let isActive = usePathname().startsWith(href)

  return (
    <li>
      <Link
        href={href}
        className={clsx(
          'transition duration-300',
          isActive
            ? 'text-teal-300 [text-shadow:0_0_12px_rgba(45,212,191,0.45)]'
            : 'text-zinc-500 hover:text-teal-300 hover:[text-shadow:0_0_12px_rgba(45,212,191,0.45)]',
        )}
      >
        {children}
      </Link>
    </li>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-sm">
      <Container className="w-full">
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            aria-label="Home"
            className="font-display text-lg font-semibold tracking-tight text-zinc-200 transition hover:text-teal-300"
          >
            sw<span className="text-teal-400">.</span>
          </Link>
          <nav>
            <ul className="flex gap-7 font-mono text-xs tracking-[0.2em] lowercase">
              <NavItem href="/about">about</NavItem>
              <NavItem href="/sops">sops</NavItem>
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  )
}
