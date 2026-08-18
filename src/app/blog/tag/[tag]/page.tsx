import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PostList } from '@/components/PostCard'
import { SimpleLayout } from '@/components/SimpleLayout'
import { TagList } from '@/components/TagList'
import { getAllTags, getPostsByTag } from '@/lib/blog'

export async function generateStaticParams() {
  let tags = await getAllTags()

  return tags.map((tag) => ({ tag }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  let { tag } = await params

  return {
    title: `${tag} — Blog`,
    description: `Posts tagged ${tag}.`,
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  let { tag } = await params
  let [posts, tags] = await Promise.all([getPostsByTag(tag), getAllTags()])

  if (posts.length === 0) {
    notFound()
  }

  return (
    <SimpleLayout
      title={`Posts tagged “${tag}”`}
      intro={`${posts.length} ${posts.length === 1 ? 'post' : 'posts'} tagged ${tag}.`}
    >
      <TagList tags={tags} active={tag} className="mb-12" />
      <PostList posts={posts} />
    </SimpleLayout>
  )
}
