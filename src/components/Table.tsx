import * as React from 'react'

// ---- Types (simplified) ----
export type SortDirection = 'asc' | 'desc'

export type Column<T> = {
  /** Unique key for the column. If no accessor/value, this reads the field from the row. */
  key: keyof T | string
  /** Header content */
  header: React.ReactNode
  /** Custom cell renderer (receives the row) */
  accessor?: (row: T, rowIndex: number) => React.ReactNode
  /** Value accessor used for sorting and tooltip (defaults to row[key]) */
  value?: (row: T, rowIndex: number) => unknown
  /** Enable sort by this column */
  sortable?: boolean
  /** Truncate long content using CSS-only truncation */
  truncate?: boolean
}

export type TableProps<T> = {
  data: T[]
  columns: Column<T>[]
  /** Initial sort */
  initialSort?: { key: string; direction: SortDirection }
  /** Rows per page (default 10) */
  rowsPerPage?: number
  exportable?: boolean
  paginatable?: boolean
}

// ---- Utilities ----
function defaultSort(a: unknown, b: unknown) {
  const na = Number(a)
  const nb = Number(b)
  const aIsNum = !Number.isNaN(na) && a !== null && a !== ''
  const bIsNum = !Number.isNaN(nb) && b !== null && b !== ''
  if (aIsNum && bIsNum) return na - nb
  if (typeof a === 'boolean' && typeof b === 'boolean')
    return a === b ? 0 : a ? 1 : -1
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

// ---- CSV helpers ----
function csvEscape(val: unknown): string {
  if (val === null || val === undefined) return ''
  const s = String(val)
  const needsQuotes = /[",\n\r]/.test(s)
  const escaped = s.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

function headerText<T>(col: Column<T>): string {
  return typeof col.header === 'string' ? col.header : String(col.key)
}

export function Table<T>({
  data,
  columns,
  initialSort,
  rowsPerPage = 10,
  exportable = false,
  paginatable = true,
}: TableProps<T>) {
  const [{ key: sortKey, direction }, setSort] = React.useState<{
    key: string | null
    direction: SortDirection
  }>(() => ({
    key: initialSort?.key ?? null,
    direction: initialSort?.direction ?? 'asc',
  }))

  const [page, setPage] = React.useState(0) // 0-based

  // Reset page when data length, sorting, or rowsPerPage changes
  React.useEffect(() => {
    setPage(0)
  }, [data.length, sortKey, direction, rowsPerPage])

  const sorted = React.useMemo(() => {
    if (!sortKey) return data
    const col = columns.find((c) => String(c.key) === sortKey)
    if (!col) return data
    const getVal = (row: T, i: number) =>
      col.value ? col.value(row, i) : (row as any)[String(col.key)]
    const arr = [...data]
    arr.sort((a, b) => {
      const cmp = defaultSort(getVal(a, 0), getVal(b, 0))
      return direction === 'asc' ? cmp : -cmp
    })
    return arr
  }, [data, columns, sortKey, direction])

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage))
  const startIndex = page * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, sorted.length)
  const pageRows = React.useMemo(
    () => sorted.slice(startIndex, endIndex),
    [sorted, startIndex, endIndex],
  )

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' }
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

  const goToPage = (p: number) => {
    const clamped = Math.min(Math.max(p, 0), totalPages - 1)
    setPage(clamped)
  }

  // ---- CSV export (sorted, all rows) ----
  const exportCSV = React.useCallback(
    (filename = 'table.csv') => {
      const headers = columns.map((c) => csvEscape(headerText(c))).join(',')
      const lines = sorted.map((row, i) => {
        const cells = columns.map((c) => {
          const k = String(c.key)
          const val =
            typeof c.value === 'function' ? c.value(row, i) : (row as any)?.[k]
          return csvEscape(val)
        })
        return cells.join(',')
      })
      const csv = [headers, ...lines].join('\r\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    [columns, sorted],
  )

  const PageButton: React.FC<{
    label: React.ReactNode
    onClick: () => void
    disabled?: boolean
    isActive?: boolean
    ariaLabel?: string
  }> = ({ label, onClick, disabled, isActive, ariaLabel }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cx(
        'h-8 min-w-8 rounded-lg border px-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40',
        isActive
          ? 'border-transparent bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
          : 'border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
      )}
    >
      {label}
    </button>
  )

  // Helper to render compact page numbers with ellipses
  const PageNumbers = () => {
    const maxButtons = 3
    const pages: (number | '…')[] = []
    if (totalPages <= maxButtons) {
      for (let i = 0; i < totalPages; i++) pages.push(i)
    } else {
      const first = 0
      const last = totalPages - 1
      const near = [page - 1, page, page + 1].filter(
        (p) => p > first && p < last,
      )
      const ordered = [first, ...near, last].sort((a, b) => a - b)
      for (let i = 0; i < ordered.length; i++) {
        const curr = ordered[i]
        const prev = ordered[i - 1]
        if (i && curr - (prev as number) > 1) pages.push('…')
        pages.push(curr)
      }
    }

    return (
      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          p === '…' ? (
            <span
              key={`dots-${idx}`}
              className="px-2 text-sm text-zinc-500 dark:text-zinc-400"
            >
              …
            </span>
          ) : (
            <PageButton
              key={p}
              label={p + 1}
              onClick={() => goToPage(p)}
              isActive={p === page}
              ariaLabel={`Go to page ${p + 1}`}
            />
          ),
        )}
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block w-full py-2 align-middle">
          {/* Top toolbar */}
          {exportable && (
            <div className="mb-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => exportCSV()}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-white/15 dark:hover:bg-zinc-800"
                aria-label="Export as CSV"
                title="Export all rows (current sort) as CSV"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M3.5 2.75A.75.75 0 014.25 2h11.5a.75.75 0 01.75.75v6.5a.75.75 0 01-1.5 0V3.5h-10v12h4.25a.75.75 0 010 1.5H4.25a.75.75 0 01-.75-.75v-13.5z" />
                  <path d="M13.25 11a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H8.75a.75.75 0 010-1.5h6.22L13.25 12.06A.75.75 0 0113.25 11z" />
                </svg>
                Export CSV
              </button>
            </div>
          )}

          <div className="overflow-scroll border border-amber-500">
            <table className="min-w-full divide-y divide-zinc-300 dark:divide-white/15">
              <thead>
                <tr>
                  {columns.map((col) => {
                    const k = String(col.key)
                    const isSorted = sortKey === k
                    return (
                      <th
                        key={k}
                        scope="col"
                        className="bg-amber-500 px-2 py-3.5 text-left text-sm font-semibold whitespace-nowrap text-white"
                      >
                        {col.sortable ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(k)}
                            className="group inline-flex items-center gap-1"
                          >
                            <span>{col.header}</span>
                            <span
                              aria-hidden
                              className={cx(
                                'transition-transform',
                                isSorted &&
                                  direction === 'desc' &&
                                  'rotate-180',
                                !isSorted &&
                                  'opacity-30 group-hover:opacity-70',
                              )}
                            >
                              <svg
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="h-3.5 w-3.5"
                              >
                                <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                              </svg>
                            </span>
                          </button>
                        ) : (
                          col.header
                        )}
                      </th>
                    )
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200 bg-zinc-50 dark:divide-white dark:bg-zinc-800">
                {pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400"
                    >
                      No data to display.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row, idx) => {
                    const absoluteIndex = startIndex + idx

                    return (
                      <tr key={idx}>
                        {columns.map((col) => {
                          const k = String(col.key)
                          const rawVal = col.value
                            ? col.value(row, absoluteIndex)
                            : (row as any)[k]
                          const fullText = String(rawVal ?? '')
                          let content: React.ReactNode
                          if (col.accessor) {
                            content = col.accessor(row, absoluteIndex)
                          } else {
                            content = fullText
                          }
                          const cellInner = (
                            <span
                              title={fullText}
                              className={cx(
                                col.truncate && 'block max-w-[12rem] truncate',
                              )}
                            >
                              {content}
                            </span>
                          )
                          return (
                            <td
                              key={`${k}${idx}`}
                              className="px-2 py-2 text-sm whitespace-nowrap text-zinc-700 dark:text-zinc-200"
                            >
                              {cellInner}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              {sorted.length > 0 ? (
                <span>
                  Showing <span className="font-medium">{startIndex + 1}</span>
                  {'–'}
                  <span className="font-medium">{endIndex}</span> of{' '}
                  <span className="font-medium">{sorted.length}</span>
                </span>
              ) : (
                <span>Showing 0 of 0</span>
              )}
            </div>

            {paginatable && (
              <div className="flex items-center gap-1">
                <PageButton
                  label={
                    <span className="inline-flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.78 4.22a.75.75 0 010 1.06L8.56 9.5l4.22 4.22a.75.75 0 11-1.06 1.06l-4.75-4.75a.75.75 0 010-1.06l4.75-4.75a.75.75 0 011.06 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  }
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 0}
                  ariaLabel="Previous page"
                />

                <PageNumbers />

                <PageButton
                  label={
                    <span className="inline-flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.22 15.78a.75.75 0 010-1.06L11.44 10.5 7.22 6.28a.75.75 0 111.06-1.06l4.75 4.75a.75.75 0 010 1.06l-4.75 4.75a.75.75 0 01-1.06 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  }
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  ariaLabel="Next page"
                />

                {/* Go-to-page input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const form = e.currentTarget as HTMLFormElement
                    const input = form.querySelector(
                      'input[name="pageJump"]',
                    ) as HTMLInputElement
                    const next = Number(input.value)
                    if (!Number.isNaN(next)) {
                      goToPage(next - 1)
                    }
                  }}
                  className="ml-2 flex items-center gap-2"
                >
                  <label
                    htmlFor="pageJump"
                    className="text-xs text-zinc-600 dark:text-zinc-300"
                  >
                    Go to
                  </label>
                  <input
                    id="pageJump"
                    name="pageJump"
                    type="number"
                    min={1}
                    max={totalPages}
                    defaultValue={page + 1}
                    className="h-8 w-16 rounded-lg border border-zinc-300 bg-white px-2 text-sm dark:border-white/15 dark:bg-zinc-900"
                  />
                  <button
                    type="submit"
                    className="h-8 rounded-lg border border-zinc-300 px-3 text-sm hover:bg-zinc-50 dark:border-white/15 dark:hover:bg-zinc-800"
                  >
                    Go
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
