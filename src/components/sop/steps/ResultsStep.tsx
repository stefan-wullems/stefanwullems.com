'use client'

import { useState } from 'react'
import { SOPStep } from '../SOPStep'
import { ResultsTable } from '../ResultsTable'
import { useContentAuditSOPContext } from '../ContentAuditSOPContext'

export function ResultsStep() {
  const { isStepActive, isStepCompleted, hasStepError, getStepError, state } =
    useContentAuditSOPContext()

  const [activeTab, setActiveTab] = useState<
    'content-inventory' | 'time-based'
  >('content-inventory')

  return (
    <SOPStep
      title="Analysis Results"
      description="View and export your content audit analysis results"
      stepNumber={5}
      isCompleted={isStepCompleted('results')}
      isActive={isStepActive('results')}
      hasError={hasStepError('results')}
      errorMessage={getStepError('results')}
    >
      {state.contentInventory && state.timeBasedAnalysis ? (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('content-inventory')}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === 'content-inventory'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Content Inventory
                <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-900">
                  {state.contentInventory.items.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('time-based')}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === 'time-based'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Time-Based Analysis
                <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-900">
                  {state.timeBasedAnalysis.items.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Content Inventory Results */}
          {activeTab === 'content-inventory' && (
            <div>
              <div className="mb-4">
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Content Inventory Analysis
                </h3>
                <p className="text-sm text-gray-600">
                  Comprehensive performance ranking combining traffic and link
                  metrics. Higher composite scores indicate better overall
                  performance.
                </p>
              </div>

              <ResultsTable
                data={state.contentInventory.items}
                type="content-inventory"
                title="Content Inventory"
                onExportCsv={() => state.contentInventory!.exportToCsv()}
              />
            </div>
          )}

          {/* Time-Based Analysis Results */}
          {activeTab === 'time-based' && (
            <div>
              <div className="mb-4">
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Time-Based Performance Analysis
                </h3>
                <p className="text-sm text-gray-600">
                  Performance indices showing how each page performs relative to
                  content published before it. Values {'>'}1.0 indicate
                  above-average performance.
                </p>
              </div>

              <ResultsTable
                data={state.timeBasedAnalysis.items}
                type="time-based-analysis"
                title="Time-Based Analysis"
                onExportCsv={() => state.timeBasedAnalysis!.exportToCsv()}
              />
            </div>
          )}

          {/* Summary Statistics */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 font-medium text-blue-900">
                Content Inventory Summary
              </h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div>
                  Total pages analyzed: {state.contentInventory.items.length}
                </div>
                <div>
                  Top performers (Q4):{' '}
                  {state.contentInventory.getByQuartile(4).length}
                </div>
                <div>
                  Above average (Q3):{' '}
                  {state.contentInventory.getByQuartile(3).length}
                </div>
                <div>
                  Below average (Q2):{' '}
                  {state.contentInventory.getByQuartile(2).length}
                </div>
                <div>
                  Needs attention (Q1):{' '}
                  {state.contentInventory.getByQuartile(1).length}
                </div>
              </div>
            </div>

            {state.timeBasedAnalysis.items.length > 0 && (
              <div className="rounded-lg bg-green-50 p-4">
                <h4 className="mb-2 font-medium text-green-900">
                  Time-Based Analysis Summary
                </h4>
                <div className="space-y-1 text-sm text-green-800">
                  {(() => {
                    const stats = state.timeBasedAnalysis.getPerformanceStats()
                    return (
                      <>
                        <div>Pages with time data: {stats.totalPages}</div>
                        <div>
                          Outperformers ({'>'}1.0): {stats.outperformers}
                        </div>
                        <div>
                          Underperformers ({'<'}1.0): {stats.underperformers}
                        </div>
                        <div>
                          Average index: {stats.averageIndex.toFixed(2)}
                        </div>
                        <div>Median index: {stats.medianIndex.toFixed(2)}</div>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            No analysis results available. Please complete the previous steps to
            run the analysis.
          </p>
        </div>
      )}
    </SOPStep>
  )
}
