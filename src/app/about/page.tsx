import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'

import { Container } from '@/components/Container'
import { GitHubIcon, LinkedInIcon } from '@/components/SocialIcons'
import portraitImage from '@/images/linkedin-portrait.jpeg'

function SocialLink({
  className,
  href,
  children,
  icon: Icon,
}: {
  className?: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <li className={clsx(className, 'flex')}>
      <Link
        href={href}
        className="group flex font-mono text-sm text-zinc-300 transition hover:text-teal-300"
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-300" />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  )
}

function MailIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M6 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6Zm.245 2.187a.75.75 0 0 0-.99 1.126l6.25 5.5a.75.75 0 0 0 .99 0l6.25-5.5a.75.75 0 0 0-.99-1.126L12 12.251 6.245 7.187Z"
      />
    </svg>
  )
}

export const metadata: Metadata = {
  title: 'About',
  description:
    'I’m Stefan Wullems, a web developer who took the scenic route and came back building with AI.',
}

export default function About() {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
        <div className="lg:pl-20">
          <div className="max-w-xs px-2.5 lg:max-w-none">
            <Image
              src={portraitImage}
              alt=""
              sizes="(min-width: 1024px) 32rem, 20rem"
              className="aspect-square rotate-3 rounded-2xl bg-zinc-800 object-cover"
            />
          </div>
        </div>
        <div className="lg:order-first lg:row-span-2">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
            I’m Stefan. I build things, usually the long way around.
          </h1>
          <div className="mt-6 space-y-7 text-base text-zinc-400">
            <p>
              I started programming at 18 when my cousin and I finally began
              working on the game we had been imagining for months. He did
              design and art, and I had to learn how to code. Brimming with
              confidence from making a sphere move in certain ways, I started
              applying for software jobs, until a kind recruiter pointed me at
              a web development bootcamp instead. Ten weeks of hard, exciting
              work launched me into a career that took me across Europe, from
              small startups to rapidly growing unicorns.
            </p>
            <p>
              I gravitated to the strange corners of the industry: Elm,
              Haskell, Rust, event sourcing, domain-driven design. The kinds
              of teams that argue about type systems over lunch. I refactored a
              hundred-thousand-line codebase, built a UI library from scratch,
              and led the automation of an insurance process I couldn’t
              pronounce at first. I loved the craft. But a few years in, I
              couldn’t shake the feeling I had lost something along the way.
            </p>
            <p>
              So I stepped out. I started a tiny coaching practice, earned a
              propedeuse in Psychology at the Open Universiteit, followed a
              marketing traineeship, built an event sourcing library for fun,
              and painted houses to pay the bills. The detour taught me more
              about people, myself included, than any framework ever did.
            </p>
            <p>
              Now I’m back to building, with new eyes. I work at the
              intersection of web development and AI automation: designing
              workflows where AI does real work: generating content, resolving
              technical issues, giving non-technical teams superpowers they
              could only borrow from engineers before. The tools have changed
              more in the last two years than in my first ten, and I find that
              genuinely thrilling.
            </p>
          </div>
        </div>
        <div className="lg:pl-20">
          <ul role="list">
            <SocialLink
              href="https://github.com/stefan-wullems"
              icon={GitHubIcon}
            >
              Follow on GitHub
            </SocialLink>
            <SocialLink
              href="https://www.linkedin.com/in/stefan-wullems-572854242/"
              icon={LinkedInIcon}
              className="mt-4"
            >
              Follow on LinkedIn
            </SocialLink>
            <SocialLink
              href="mailto:stefanwullems1998@gmail.com"
              icon={MailIcon}
              className="mt-8 border-t border-white/5 pt-8"
            >
              stefanwullems1998@gmail.com
            </SocialLink>
          </ul>
        </div>
      </div>
    </Container>
  )
}
