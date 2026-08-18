/**
 * Radio-driven tabs with no client JavaScript. Every panel is rendered into
 * the HTML up front and revealed by a `:checked` sibling selector (see the
 * [data-tabs] rules in tailwind.css), so all the content is present for
 * crawlers and for readers with JavaScript disabled.
 */
export function Tabs({
  name,
  legend,
  items,
}: {
  /** Unique radio-group name; must differ per tab strip on the page. */
  name: string
  legend?: React.ReactNode
  items: { key: string; label: React.ReactNode; content: React.ReactNode }[]
}) {
  return (
    <div data-tabs>
      {items.map((item, index) => (
        <input
          key={item.key}
          type="radio"
          name={name}
          id={`${name}-${item.key}`}
          defaultChecked={index === 0}
        />
      ))}

      <div
        data-chips
        className="flex flex-wrap items-center gap-2"
        role="tablist"
      >
        {legend && (
          <span className="mr-1 text-sm text-zinc-500 dark:text-zinc-400">
            {legend}
          </span>
        )}
        {items.map((item) => (
          <label
            key={item.key}
            data-chip
            htmlFor={`${name}-${item.key}`}
            className="rounded-full bg-zinc-200 px-3 py-1 text-sm text-zinc-600 transition hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            {item.label}
          </label>
        ))}
      </div>

      <div data-panels>
        {items.map((item) => (
          <div key={item.key} data-panel>
            {item.content}
          </div>
        ))}
      </div>
    </div>
  )
}
