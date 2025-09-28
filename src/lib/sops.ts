import glob from 'fast-glob'

interface Sop {
  title: string
  description: string
  author: string
  date: string
}

export interface SopWithSlug extends Sop {
  slug: string
}

async function importSops(sopFilename: string): Promise<SopWithSlug> {
  let { article } = (await import(`../app/sops/${sopFilename}`)) as {
    default: React.ComponentType
    article: Sop
  }

  return {
    slug: sopFilename.replace(/(\/page)?\.mdx$/, ''),
    ...article,
  }
}

export async function getAllSops() {
  let sopFilenames = await glob('*/page.mdx', {
    cwd: './src/app/sops',
  })

  let sops = await Promise.all(sopFilenames.map(importSops))

  return sops.sort((a, z) => +new Date(z.date) - +new Date(a.date))
}
