import { type Metadata } from 'next'

import { SimpleLayout } from '@/components/SimpleLayout'
import { ProjectCard, type Project } from './_components/ProjectCard'

const projects: Project[] = [
  {
    name: 'Typehyped',
    href: 'https://typehyped.com',
    domain: 'typehyped.com',
    description:
      'A typing practice site built to make getting faster feel good.',
  },
  {
    name: 'Typemaster',
    href: 'https://typemaster.io',
    domain: 'typemaster.io',
    description: 'Typing lessons and drills for building real keyboard speed.',
  },
]

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Things I built that are live on the internet.',
}

export default function Projects() {
  return (
    <SimpleLayout
      title="Projects"
      intro="Things I built that are live on the internet."
    >
      <ul role="list" className="grid gap-8 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.href} project={project} />
        ))}
      </ul>
    </SimpleLayout>
  )
}
