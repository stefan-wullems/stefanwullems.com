import { type Metadata } from 'next'

import { PostList } from '@/components/PostCard'
import { SimpleLayout } from '@/components/SimpleLayout'
import { TagList } from '@/components/TagList'
import { getAllPosts, getAllTags } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Writing on SEO, content analysis, and building things on the web.',
}

export default async function BlogIndex() {
  let [posts, tags] = await Promise.all([getAllPosts(), getAllTags()])

  return (
    <SimpleLayout
      title="Blog"
      intro="Writing on SEO, content analysis, and building things on the web."
    >
      <TagList tags={tags} className="mb-12" />
      <PostList posts={posts} />
    </SimpleLayout>
  )
}
