interface Entry {
  number: string
  title: string
  href: string
  children?: Entry[]
}

const CONTENTS: Entry[] = [
  {
    number: '1',
    title: 'Definitions',
    href: '#definitions',
    children: [
      {
        number: '1.1',
        title: 'Linear approximation',
        href: '#linear-approximation',
        children: [
          {
            number: '1.1.1',
            title: 'Slope intuition',
            href: '#slope-intuition',
          },
          {
            number: '1.1.2',
            title: 'Reconstructing a and b',
            href: '#reconstructing-a-and-b',
          },
        ],
      },
      {
        number: '1.2',
        title: 'Quadratic approximation',
        href: '#quadratic-approximation',
        children: [
          {
            number: '1.2.1',
            title: 'Parabola intuition',
            href: '#parabola-intuition',
          },
          {
            number: '1.2.2',
            title: 'Reconstructing a, b and c',
            href: '#reconstructing-a-b-and-c',
          },
        ],
      },
    ],
  },
  {
    number: '2',
    title: 'Cheatsheet',
    href: '#cheatsheet',
    children: [
      {
        number: '2.1',
        title: 'Near 0',
        href: '#near-0',
        children: [
          {
            number: '2.1.1',
            title: 'Trigonometric',
            href: '#trigonometric',
            children: [
              { number: '2.1.1.1', title: 'sin x', href: '#fn-sin' },
              { number: '2.1.1.2', title: 'cos x', href: '#fn-cos' },
              { number: '2.1.1.3', title: 'tan x', href: '#fn-tan' },
              { number: '2.1.1.4', title: 'sec x', href: '#fn-sec' },
              { number: '2.1.1.5', title: 'cot x', href: '#fn-cot' },
              { number: '2.1.1.6', title: 'csc x', href: '#fn-csc' },
            ],
          },
          {
            number: '2.1.2',
            title: 'Exponents and logarithms',
            href: '#exponents-and-logarithms',
            children: [
              { number: '2.1.2.1', title: 'eˣ', href: '#fn-exp' },
              { number: '2.1.2.2', title: 'ln(1 + x)', href: '#fn-ln' },
              { number: '2.1.2.3', title: '(1 + x)ʳ', href: '#fn-pow' },
              { number: '2.1.2.4', title: 'aˣ', href: '#fn-apow' },
            ],
          },
        ],
      },
    ],
  },
  {
    number: '3',
    title: 'Combining approximations',
    href: '#combining-approximations',
  },
]

function List({ entries, depth = 0 }: { entries: Entry[]; depth?: number }) {
  return (
    <ul className={depth === 0 ? 'space-y-2' : 'mt-1 space-y-1'}>
      {entries.map((entry) => (
        <li key={entry.href}>
          <a
            href={entry.href}
            className="group flex gap-3 text-zinc-600 transition hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400"
          >
            <span className="w-14 shrink-0 font-mono text-sm text-zinc-400 dark:text-zinc-500">
              {entry.number}
            </span>
            <span className={depth === 0 ? 'font-medium' : 'text-sm'}>
              {entry.title}
            </span>
          </a>
          {entry.children && (
            <div className="ml-4 border-l border-zinc-200 pl-3 dark:border-zinc-800">
              <List entries={entry.children} depth={depth + 1} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

export function TableOfContents() {
  return (
    <nav
      aria-label="Table of contents"
      className="not-prose mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/60"
    >
      <h2 className="text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
        Contents
      </h2>
      <div className="mt-4">
        <List entries={CONTENTS} />
      </div>
    </nav>
  )
}
