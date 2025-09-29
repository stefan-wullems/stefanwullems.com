import { AhrefsPageData, ContentInventory } from '@/lib/sop'
import { useMemo } from 'react'

const QUARTILE_COLORS = {
  4: 'bg-green-100 text-green-800 border-green-200',
  3: 'bg-blue-100 text-blue-800 border-blue-200',
  2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  1: 'bg-red-100 text-red-800 border-red-200',
  default: 'bg-gray-100 text-gray-800 border-gray-200',
} as Record<number | 'default', string>

interface ContentInventoryVisualization {
  data: AhrefsPageData[]
  error?: string
}

export function ContentInventoryVisualization({
  data,
  error,
}: ContentInventoryVisualization) {
  const inventory = useMemo(() => ContentInventory.fromPageData(data), [data])

  const topPerformers = inventory?.getTopPerformers(5) || []
  const q4Items = inventory?.getByQuartile(4) || []
  const q1Items = inventory?.getByQuartile(1) || []

  const handleExportCsv = () => {
    if (!inventory) return
    const csvContent = inventory.exportToCsv()
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'content-inventory.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center space-x-3">
            <div className="text-red-600 dark:text-red-400">⚠</div>
            <div className="text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {inventory && (
        <div className="space-y-6">
          {/* Overview Statistics */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Inventory Overview</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                <div className="text-2xl font-bold">
                  {inventory.items.length}
                </div>
                <div className="text-sm text-zinc-500">Total Pages</div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                <div className="text-2xl font-bold text-green-600">
                  {q4Items.length}
                </div>
                <div className="text-sm text-zinc-500">Q4 (Top 25%)</div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                <div className="text-2xl font-bold text-red-600">
                  {q1Items.length}
                </div>
                <div className="text-sm text-zinc-500">Q1 (Bottom 25%)</div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                <div className="text-2xl font-bold">
                  {(
                    topPerformers.reduce(
                      (sum, item) => sum + item.compositeScore,
                      0,
                    ) / Math.max(topPerformers.length, 1)
                  ).toFixed(1)}
                </div>
                <div className="text-sm text-zinc-500">Avg Top Score</div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          {topPerformers.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <span className="text-yellow-600">⭐</span>
                Top Performers (Highest Composite Scores)
              </h3>
              <div className="space-y-2">
                {topPerformers.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 truncate text-sm font-medium">
                          {item.pageTitle || item.url}
                        </div>
                        <div className="mb-2 text-xs text-zinc-500">
                          Traffic: {item.organicTraffic?.toLocaleString()} • RD:{' '}
                          {item.referringDomains} • RD/Visit:{' '}
                          {item.referringDomainsPerVisit.toFixed(3)}
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${QUARTILE_COLORS[item.trafficQuartile] || QUARTILE_COLORS.default}`}
                          >
                            Traffic Q{item.trafficQuartile}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${QUARTILE_COLORS[item.rdQuartile] || QUARTILE_COLORS.default}`}
                          >
                            RD Q{item.rdQuartile}
                          </span>
                        </div>
                      </div>
                      <span className="ml-2 text-lg font-bold text-zinc-800 dark:text-zinc-200">
                        {item.compositeScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Performers */}
          {q1Items.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <span className="text-red-600">⚠️</span>
                Q1 Pages (Bottom 25% - Priority for Improvement)
              </h3>
              <div className="space-y-2">
                {q1Items.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 truncate text-sm font-medium">
                          {item.pageTitle || item.url}
                        </div>
                        <div className="mb-2 text-xs text-zinc-500">
                          Traffic: {item.organicTraffic?.toLocaleString()} • RD:{' '}
                          {item.referringDomains} • RD/Visit:{' '}
                          {item.referringDomainsPerVisit.toFixed(3)}
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${QUARTILE_COLORS[item.trafficQuartile] || QUARTILE_COLORS.default}`}
                          >
                            Traffic Q{item.trafficQuartile}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${QUARTILE_COLORS[item.rdQuartile] || QUARTILE_COLORS.default}`}
                          >
                            RD Q{item.rdQuartile}
                          </span>
                        </div>
                      </div>
                      <span className="ml-2 text-zinc-600 dark:text-zinc-400">
                        {item.compositeScore}
                      </span>
                    </div>
                  </div>
                ))}
                {q1Items.length > 5 && (
                  <div className="text-center text-sm text-zinc-500">
                    ... and {q1Items.length - 5} more Q1 pages
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExportCsv}
            className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:ring-2 focus:ring-amber-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <span className="mr-2">⬇</span>
            Export Content Inventory to CSV
          </button>

          {/* Interpretation Guide */}
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 dark:text-blue-400">📦</div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Understanding Your Content Inventory:</strong>
                <br />• <strong>Composite Score (2-8)</strong>: Higher scores
                indicate better overall performance
                <br />• <strong>Q4 (Top 25%)</strong>: Your star performers -
                analyze what makes them successful
                <br />• <strong>Q1 (Bottom 25%)</strong>: Priority candidates
                for major improvements or removal
                <br />• <strong>RD per Visit</strong>: Shows link-building
                efficiency relative to traffic
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
