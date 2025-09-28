import { type Metadata } from 'next'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { type SopWithSlug, getAllSops } from '@/lib/sops'
import { formatDate } from '@/lib/formatDate'

function Article({ article }: { article: SopWithSlug }) {
  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title href={`/sops/${article.slug}`}>{article.title}</Card.Title>
        <Card.Eyebrow
          as="time"
          dateTime={article.date}
          className="md:hidden"
          decorate
        >
          {formatDate(article.date)}
        </Card.Eyebrow>
        <Card.Description>{article.description}</Card.Description>
        <Card.Cta>View SOP</Card.Cta>
      </Card>
      <Card.Eyebrow
        as="time"
        dateTime={article.date}
        className="mt-1 max-md:hidden"
      >
        {formatDate(article.date)}
      </Card.Eyebrow>
    </article>
  )
}

export const metadata: Metadata = {
  title: 'SOPs',
  description:
    'Interactive Standard Operating Procedures for SEO, content analysis, and digital marketing workflows.',
}

export default async function ArticlesIndex() {
  let articles = await getAllSops()

  return (
    <SimpleLayout
      title="Interactive Standard Operating Procedures"
      intro="Step-by-step interactive workflows for SEO analysis, content auditing, and digital marketing processes."
    >
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {articles.map((sop) => (
            <Article key={sop.slug} article={sop} />
          ))}
        </div>
      </div>
    </SimpleLayout>
  )
}
