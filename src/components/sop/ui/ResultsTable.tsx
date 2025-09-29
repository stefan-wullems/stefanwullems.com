'use client'

import { useState } from 'react'
import { ContentInventoryItem } from '@/lib/sop/content-inventory'
import { TimeBasedAnalysisItem } from '@/lib/sop/time-based-analysis'

export interface ResultsTableProps {
  data: ContentInventoryItem[] | TimeBasedAnalysisItem[]
  type: 'content-inventory' | 'time-based-analysis'
  title: string
  onExportCsv: () => string
}

export function ResultsTable({
  data,
  type,
  title,
  onExportCsv,
}: ResultsTableProps) {
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  const handleExportCsv = () => {
    const csvContent = onExportCsv()
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `${title.toLowerCase().replace(/\s+/g, '-')}.csv`,
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1)
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0

    const aValue = (a as any)[sortField]
    const bValue = (b as any)[sortField]

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    const aStr = String(aValue || '')
    const bStr = String(bValue || '')

    if (sortDirection === 'asc') {
      return aStr.localeCompare(bStr)
    } else {
      return bStr.localeCompare(aStr)
    }
  })

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = sortedData.slice(startIndex, endIndex)

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return (
        <svg
          className="h-4 w-4 text-zinc-400 dark:text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      )
    }

    return sortDirection === 'asc' ? (
      <svg
        className="h-4 w-4 text-amber-600 dark:text-amber-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="h-4 w-4 text-amber-600 dark:text-amber-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    )
  }

  const renderContentInventoryTable = () => {
    const inventoryData = data as ContentInventoryItem[]

    return (
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              <button
                onClick={() => handleSort('url')}
                className="flex items-center space-x-1 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <span>URL</span>
                <SortIcon field="url" />
              </button>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              <button
                onClick={() => handleSort('pageTitle')}
                className="flex items-center space-x-1 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <span>Title</span>
                <SortIcon field="pageTitle" />
              </button>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              <button
                onClick={() => handleSort('compositeScore')}
                className="flex items-center space-x-1 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <span>Score</span>
                <SortIcon field="compositeScore" />
              </button>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              <button
                onClick={() => handleSort('referringDomains')}
                className="flex items-center space-x-1 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <span>RDs</span>
                <SortIcon field="referringDomains" />
              </button>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              <button
                onClick={() => handleSort('organicTraffic')}
                className="flex items-center space-x-1 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <span>Traffic</span>
                <SortIcon field="organicTraffic" />
              </button>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              <button
                onClick={() => handleSort('quartileRank')}
                className="flex items-center space-x-1 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <span>RD/Visit Q</span>
                <SortIcon field="rdPerVisitQuartile" />
              </button>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              <button
                onClick={() => handleSort('publishDate')}
                className="flex items-center space-x-1 hover:text-gray-700"
              >
                <span>Published</span>
                <SortIcon field="publishDate" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-800">
          {paginatedData.map((item, index) => (
            <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <td className="max-w-xs px-6 py-4 text-xs text-amber-600 dark:text-amber-400">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate hover:underline"
                >
                  {item.url}
                </a>
              </td>
              <td className="max-w-xs px-6 py-4 text-xs text-zinc-900 dark:text-zinc-100">
                <div
                  className="truncate"
                  title={(item as ContentInventoryItem).pageTitle}
                >
                  {(item as ContentInventoryItem).pageTitle}
                </div>
              </td>
              <td className="px-6 py-4 text-xs">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    (item as ContentInventoryItem).compositeScore >= 7
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      : (item as ContentInventoryItem).compositeScore >= 5
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  {(item as ContentInventoryItem).compositeScore.toFixed(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-zinc-900 dark:text-zinc-100">
                {item.referringDomains}
                <span
                  className={`ml-1 text-xs ${
                    (item as ContentInventoryItem).rdQuartile === 4
                      ? 'text-amber-600 dark:text-amber-400'
                      : (item as ContentInventoryItem).rdQuartile === 3
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : (item as ContentInventoryItem).rdQuartile === 2
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  (Q{(item as ContentInventoryItem).rdQuartile})
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-zinc-900 dark:text-zinc-100">
                {(item as ContentInventoryItem).organicTraffic}
                <span
                  className={`ml-1 text-xs ${
                    (item as ContentInventoryItem).trafficQuartile === 4
                      ? 'text-amber-600 dark:text-amber-400'
                      : (item as ContentInventoryItem).trafficQuartile === 3
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : (item as ContentInventoryItem).trafficQuartile === 2
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  (Q{(item as ContentInventoryItem).trafficQuartile})
                </span>
              </td>
              <td className="px-6 py-4 text-center text-xs">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    (item as ContentInventoryItem).rdPerVisitQuartile === 4
                      ? 'bg-green-100 text-green-800'
                      : (item as ContentInventoryItem).rdPerVisitQuartile === 3
                        ? 'bg-yellow-100 text-yellow-800'
                        : (item as ContentInventoryItem).rdPerVisitQuartile ===
                            2
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                  }`}
                >
                  Q{(item as ContentInventoryItem).rdPerVisitQuartile}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-zinc-900 dark:text-zinc-100">
                {item.publishDate || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  const renderTimeBasedTable = () => {
    const timeData = data as TimeBasedAnalysisItem[]

    return (
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              <button
                onClick={() => handleSort('url')}
                className="flex items-center space-x-1 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <span>URL</span>
                <SortIcon field="url" />
              </button>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              <button
                onClick={() => handleSort('pageTitle')}
                className="flex items-center space-x-1 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <span>Title</span>
                <SortIcon field="title" />
              </button>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              <button
                onClick={() => handleSort('referringDomainsPerVisit')}
                className="flex items-center space-x-1 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <span>RDs</span>
                <SortIcon field="referringDomains" />
              </button>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              <button
                onClick={() => handleSort('referringDomains')}
                className="flex items-center space-x-1 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <span>Time Index</span>
                <SortIcon field="timeBasedIndex" />
              </button>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              <button
                onClick={() => handleSort('organicTraffic')}
                className="flex items-center space-x-1 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <span>Published</span>
                <SortIcon field="publishDate" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-800">
          {paginatedData.map((item, index) => (
            <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <td className="max-w-xs px-6 py-4 text-xs text-amber-600 dark:text-amber-400">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate hover:underline"
                >
                  {item.url}
                </a>
              </td>
              <td className="px-6 py-4 text-xs text-zinc-900 dark:text-zinc-100">
                <div
                  className="truncate"
                  title={(item as TimeBasedAnalysisItem).title}
                >
                  {(item as TimeBasedAnalysisItem).title}
                </div>
              </td>
              <td className="px-6 py-4 text-xs text-zinc-900 dark:text-zinc-100">
                {item.referringDomains}
              </td>
              <td className="px-6 py-4 text-xs">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    (item as TimeBasedAnalysisItem).timeBasedIndex >= 1.5
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      : (item as TimeBasedAnalysisItem).timeBasedIndex >= 1.0
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : (item as TimeBasedAnalysisItem).timeBasedIndex >= 0.5
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  {(item as TimeBasedAnalysisItem).timeBasedIndex.toFixed(2)}
                </span>
              </td>
              <td className="max-w-xs px-6 py-4 text-xs text-zinc-900 dark:text-zinc-100">
                {(item as TimeBasedAnalysisItem).publishDate}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pageNumbers = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return (
      <div className="flex items-center justify-between border-t border-zinc-200 bg-white px-4 py-3 sm:px-6 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(endIndex, sortedData.length)}
              </span>{' '}
              of <span className="font-medium">{sortedData.length}</span>{' '}
              results
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-zinc-400 ring-1 ring-zinc-300 ring-inset hover:bg-zinc-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-500 dark:ring-zinc-600 dark:hover:bg-zinc-800"
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    pageNumber === currentPage
                      ? 'z-10 bg-amber-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:bg-amber-600'
                      : 'text-zinc-900 ring-1 ring-zinc-300 ring-inset hover:bg-zinc-50 focus:z-20 focus:outline-offset-0 dark:text-zinc-100 dark:ring-zinc-600 dark:hover:bg-zinc-800'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-zinc-400 ring-1 ring-zinc-300 ring-inset hover:bg-zinc-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-500 dark:ring-zinc-600 dark:hover:bg-zinc-800"
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-800">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
            No data
          </h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            No data available for analysis.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {sortedData.length} {sortedData.length === 1 ? 'result' : 'results'}
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none dark:bg-amber-600 dark:hover:bg-amber-700"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-4-4m4 4l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="ring-opacity-5 overflow-hidden shadow ring-1 ring-black md:rounded-lg">
        <div className="overflow-x-auto">
          {type === 'content-inventory'
            ? renderContentInventoryTable()
            : renderTimeBasedTable()}
        </div>

        {renderPagination()}
      </div>
    </div>
  )
}
