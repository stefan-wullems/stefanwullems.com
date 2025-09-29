import { Table } from '@/components/Table'
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
    <div className="">
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
        <Table
          data={inventory.items}
          columns={[
            { header: 'URL', key: 'url', sortable: true, truncate: true },
            {
              header: 'Title',
              key: 'pageTitle',
              sortable: true,
              truncate: true,
            },
            {
              header: 'Composite Score',
              key: 'compositeScore',
              sortable: true,
            },
            {
              header: 'Referring Domains',
              key: 'referringDomains',
              sortable: true,
            },
            {
              header: 'RD Quartile',
              key: 'rdQuartile',
              sortable: true,
              accessor: (item) => (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${QUARTILE_COLORS[item.rdQuartile] || QUARTILE_COLORS.default}`}
                >
                  Q{item.rdQuartile}
                </span>
              ),
            },
            {
              header: 'Organic Traffic',
              key: 'organicTraffic',
              sortable: true,
            },
            {
              header: 'Traffic Quartile',
              key: 'trafficQuartile',
              sortable: true,
              accessor: (item) => (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${QUARTILE_COLORS[item.trafficQuartile] || QUARTILE_COLORS.default}`}
                >
                  Q{item.trafficQuartile}
                </span>
              ),
            },
            // {
            //   header: 'Referring Domains per Visit',
            //   key: 'referringDomainsPerVisit',
            //   sortable: true,
            // },
            // {
            //   header: 'Referring Domains per Visit Quartile',
            //   key: 'rdPerVisitQuartile',
            //   sortable: true,
            //   accessor: (item) => (
            //     <span
            //       className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${QUARTILE_COLORS[item.rdPerVisitQuartile] || QUARTILE_COLORS.default}`}
            //     >
            //       Q{item.rdPerVisitQuartile}
            //     </span>
            //   ),
            // },
          ]}
        />
      )}
    </div>
  )
}
