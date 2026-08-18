import { Card } from '@/components/Card'
import { type PostWithSlug } from '@/lib/blog'
import { formatDate } from '@/lib/formatDate'

export function PostCard({ post }: { post: PostWithSlug }) {
  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title href={`/blog/${post.slug}`}>{post.title}</Card.Title>
        <Card.Eyebrow
          as="time"
          dateTime={post.date}
          className="md:hidden"
          decorate
        >
          {formatDate(post.date)}
        </Card.Eyebrow>
        <Card.Description>{post.description}</Card.Description>
        {post.tags.length > 0 && (
          <p className="relative z-10 mt-3 text-sm text-zinc-400 dark:text-zinc-500">
            {post.tags.join(' · ')}
          </p>
        )}
        <Card.Cta>Read post</Card.Cta>
      </Card>
      <Card.Eyebrow
        as="time"
        dateTime={post.date}
        className="mt-1 max-md:hidden"
      >
        {formatDate(post.date)}
      </Card.Eyebrow>
    </article>
  )
}

export function PostList({ posts }: { posts: PostWithSlug[] }) {
  return (
    <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
      <div className="flex max-w-3xl flex-col space-y-16">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  )
}
