import Link from 'next/link'
import clsx from 'clsx'

export function TagList({
  tags,
  active,
  className,
}: {
  tags: string[]
  active?: string
  className?: string
}) {
  if (tags.length === 0) {
    return null
  }

  return (
    <ul className={clsx(className, 'flex flex-wrap gap-2')}>
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/blog/tag/${tag}`}
            aria-current={tag === active ? 'page' : undefined}
            className={clsx(
              'block rounded-full px-3 py-1 text-sm transition',
              tag === active
                ? 'bg-teal-500 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700',
            )}
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  )
}
