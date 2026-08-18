import katex from 'katex'

/**
 * Renders LaTeX on the server. Deliberately not a client component — keeping it
 * server-side means katex's JS never ships to the browser, only its output.
 */
export function Math({
  children,
  display = false,
  className,
}: {
  children: string
  display?: boolean
  className?: string
}) {
  let html = katex.renderToString(children, {
    displayMode: display,
    throwOnError: false,
    output: 'html',
  })

  return (
    <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  )
}
