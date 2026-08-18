import Image from 'next/image'
import Link from 'next/link'

import { fetchOpenGraph } from '@/lib/openGraph'

export interface Project {
  name: string
  href: string
  domain: string
  description: string
}

export async function ProjectCard({ project }: { project: Project }) {
  let og = await fetchOpenGraph(project.href)

  return (
    <li className="group">
      <Link
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 transition duration-300 hover:border-teal-500/40 hover:shadow-[0_0_30px_rgba(45,212,191,0.08)]"
      >
        {og.image && (
          <div className="relative aspect-[1200/630] w-full overflow-hidden border-b border-zinc-800 bg-zinc-950">
            <Image
              src={og.image}
              alt={`${project.name} preview`}
              width={og.imageWidth ?? 1200}
              height={og.imageHeight ?? 630}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              // These are someone else's OG endpoints; don't re-host them.
              unoptimized
            />
          </div>
        )}

        <div className="p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold tracking-tight text-zinc-100 transition duration-300 group-hover:text-teal-300">
            {project.name}
          </h2>
          <p className="mt-2 text-base text-zinc-400">
            {og.description ?? project.description}
          </p>
          <p className="mt-3 font-mono text-xs tracking-[0.2em] text-zinc-600 lowercase">
            {project.domain}
          </p>
        </div>
      </Link>
    </li>
  )
}
