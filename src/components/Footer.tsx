import Link from 'next/link'

import { ContainerInner, ContainerOuter } from '@/components/Container'

function NavLink({
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
      className="transition hover:text-teal-300"
    >
      {children}
    </Link>
  )
}

export function Footer() {
  return (
    <footer className="mt-32 flex-none">
      <ContainerOuter>
        <div className="border-t border-white/5 pt-10 pb-16">
          <ContainerInner>
            <div className="flex flex-col items-center justify-between gap-6 font-mono text-xs tracking-[0.15em] text-zinc-500 lowercase md:flex-row">
              <div className="flex flex-wrap justify-center gap-x-7 gap-y-1">
                <NavLink href="/about">about</NavLink>
                <NavLink href="/sops">sops</NavLink>
                <NavLink href="https://github.com/stefan-wullems">
                  github
                </NavLink>
                <NavLink href="https://www.linkedin.com/in/stefan-wullems-572854242/">
                  linkedin
                </NavLink>
              </div>
              <p className="text-zinc-600">
                © {new Date().getFullYear()} stefan wullems
              </p>
            </div>
          </ContainerInner>
        </div>
      </ContainerOuter>
    </footer>
  )
}
