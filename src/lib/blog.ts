import glob from 'fast-glob'

interface Post {
  title: string
  description: string
  author: string
  date: string
  tags?: string[]
}

export interface PostWithSlug extends Post {
  slug: string
  tags: string[]
}

async function importPost(postFilename: string): Promise<PostWithSlug> {
  let { article } = (await import(`../app/blog/${postFilename}`)) as {
    default: React.ComponentType
    article: Post
  }

  return {
    slug: postFilename.replace(/(\/page)?\.mdx$/, ''),
    ...article,
    tags: article.tags ?? [],
  }
}

export async function getAllPosts() {
  let postFilenames = await glob('*/page.mdx', {
    cwd: './src/app/blog',
  })

  let posts = await Promise.all(postFilenames.map(importPost))

  return posts.sort((a, z) => +new Date(z.date) - +new Date(a.date))
}

export async function getPostsByTag(tag: string) {
  let posts = await getAllPosts()

  return posts.filter((post) => post.tags.includes(tag))
}

export async function getAllTags() {
  let posts = await getAllPosts()
  let tags = new Set(posts.flatMap((post) => post.tags))

  return [...tags].sort()
}
