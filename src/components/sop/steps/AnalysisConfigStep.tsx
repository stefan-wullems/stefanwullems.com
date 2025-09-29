'use client'

import { useState } from 'react'
import { SOPStep, SOPStepContent, SOPStepActions } from '../SOPStep'
import { useContentAuditSOPContext } from '../ContentAuditSOPContext'
import { ResultsTable } from '../ResultsTable'
import { AnalysisConfig } from '../AnalysisConfigForm'

export function AnalysisStep() {
  const {
    handleRunAnalysis,
    isStepActive,
    isStepCompleted,
    hasStepError,
    getStepError,
    isStepLoading,
    state,
  } = useContentAuditSOPContext()

  const [strategy, setStrategy] = useState<'median' | 'average'>('median')
  const [activeTab, setActiveTab] = useState<
    'content-inventory' | 'time-based'
  >('content-inventory')

  const handleSubmit = () => {
    const config: AnalysisConfig = {
      strategy,
      includePublishedDates:
        state.analysisConfig?.includePublishedDates || false,
      publishedDateDelay: state.analysisConfig?.publishedDateDelay || 1000,
    }
    handleRunAnalysis(config)
  }

  const hasResults = state.contentInventory && state.timeBasedAnalysis

  return (
    <SOPStep
      title="Analysis & Results"
      description="Configure analysis strategy, run analysis, and view results"
      stepNumber={3}
      isCompleted={isStepCompleted('analysis')}
      isActive={isStepActive('analysis')}
      hasError={hasStepError('analysis')}
      errorMessage={getStepError('analysis')}
    >
      <SOPStepContent>
        <div className="space-y-6">
          {!hasResults ? (
            // Configuration and execution phase
            <>
              <div>
                <p className="mb-4 text-gray-700">
                  Configure and run your content audit analysis on{' '}
                  <strong>{state.uploadedPages?.length || 0} pages</strong>.
                  {state.analysisConfig?.includePublishedDates && (
                    <span className="font-medium text-green-600">
                      {' '}
                      Published dates have been fetched and will be included in
                      the analysis.
                    </span>
                  )}
                </p>

                <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                  <h4 className="mb-2 text-sm font-medium text-blue-800">
                    Analysis Strategy
                  </h4>
                  <p className="mb-3 text-sm text-blue-700">
                    Choose how to calculate performance benchmarks for your
                    content inventory analysis.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-base font-medium text-gray-900">
                    Analysis Strategy
                  </label>
                  <p className="text-sm text-gray-500">
                    Choose your calculation method
                  </p>
                  <fieldset className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="median"
                          name="strategy"
                          type="radio"
                          value="median"
                          checked={strategy === 'median'}
                          onChange={(e) =>
                            setStrategy(e.target.value as 'median' | 'average')
                          }
                          disabled={isStepLoading('analysis')}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="median" className="ml-3 block">
                          <div className="text-sm font-medium text-gray-700">
                            Median (Recommended)
                          </div>
                          <div className="text-sm text-gray-500">
                            More stable results when dealing with high backlink
                            variance. Best for most websites.
                          </div>
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="average"
                          name="strategy"
                          type="radio"
                          value="average"
                          checked={strategy === 'average'}
                          onChange={(e) =>
                            setStrategy(e.target.value as 'median' | 'average')
                          }
                          disabled={isStepLoading('analysis')}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="average" className="ml-3 block">
                          <div className="text-sm font-medium text-gray-700">
                            Average (Mean)
                          </div>
                          <div className="text-sm text-gray-500">
                            Traditional averaging method. Can be skewed by
                            outliers with many backlinks.
                          </div>
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>

                {isStepLoading('analysis') && (
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Running Analysis...
                        </p>
                        <p className="text-sm text-blue-700">
                          Processing your data and generating content audit
                          insights.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Results phase
            <>
              <div>
                <div className="mb-4">
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Content Audit Results
                  </h3>
                  <p className="text-sm text-gray-600">
                    Analysis complete! View your comprehensive content audit
                    results below. Strategy used:{' '}
                    <span className="font-medium">{strategy}</span>
                  </p>
                </div>

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
                        {state.contentInventory?.items.length || 0}
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
                        {state.timeBasedAnalysis?.items.length || 0}
                      </span>
                    </button>
                  </nav>
                </div>
              </div>

              {/* Content Inventory Results */}
              {activeTab === 'content-inventory' && (
                <div>
                  <div className="mb-4">
                    <h4 className="text-md mb-2 font-medium text-gray-900">
                      Content Inventory Analysis
                    </h4>
                    <p className="text-sm text-gray-600">
                      Comprehensive performance ranking combining traffic and
                      link metrics. Higher composite scores indicate better
                      overall performance.
                    </p>
                  </div>

                  <ResultsTable
                    data={state.contentInventory?.items || []}
                    type="content-inventory"
                    title="Content Inventory"
                    onExportCsv={() =>
                      state.contentInventory?.exportToCsv() || ''
                    }
                  />
                </div>
              )}

              {/* Time-Based Analysis Results */}
              {activeTab === 'time-based' && (
                <div>
                  <div className="mb-4">
                    <h4 className="text-md mb-2 font-medium text-gray-900">
                      Time-Based Performance Analysis
                    </h4>
                    <p className="text-sm text-gray-600">
                      Performance indices showing how each page performs
                      relative to content published before it. Values {'>'}1.0
                      indicate above-average performance.
                    </p>
                  </div>

                  <ResultsTable
                    data={state.timeBasedAnalysis?.items || []}
                    type="time-based-analysis"
                    title="Time-Based Analysis"
                    onExportCsv={() =>
                      state.timeBasedAnalysis?.exportToCsv() || ''
                    }
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
                      Total pages analyzed:{' '}
                      {state.contentInventory?.items.length || 0}
                    </div>
                    <div>
                      Top performers (Q4):{' '}
                      {state.contentInventory?.getByQuartile(4).length || 0}
                    </div>
                    <div>
                      Above average (Q3):{' '}
                      {state.contentInventory?.getByQuartile(3).length || 0}
                    </div>
                    <div>
                      Below average (Q2):{' '}
                      {state.contentInventory?.getByQuartile(2).length || 0}
                    </div>
                    <div>
                      Needs attention (Q1):{' '}
                      {state.contentInventory?.getByQuartile(1).length || 0}
                    </div>
                  </div>
                </div>

                {state.timeBasedAnalysis &&
                  state.timeBasedAnalysis.items.length > 0 && (
                    <div className="rounded-lg bg-green-50 p-4">
                      <h4 className="mb-2 font-medium text-green-900">
                        Time-Based Analysis Summary
                      </h4>
                      <div className="space-y-1 text-sm text-green-800">
                        {(() => {
                          const stats =
                            state.timeBasedAnalysis?.getPerformanceStats()
                          return (
                            <>
                              <div>
                                Pages with time data: {stats.totalPages}
                              </div>
                              <div>
                                Outperformers ({'>'}1.0): {stats.outperformers}
                              </div>
                              <div>
                                Underperformers ({'<'}1.0):{' '}
                                {stats.underperformers}
                              </div>
                              <div>
                                Average index: {stats.averageIndex.toFixed(2)}
                              </div>
                              <div>
                                Median index: {stats.medianIndex.toFixed(2)}
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  )}
              </div>
            </>
          )}
        </div>

        {!hasResults && (
          <SOPStepActions>
            <button
              onClick={handleSubmit}
              disabled={!state.uploadedPages || isStepLoading('analysis')}
              className={`rounded-md px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                !state.uploadedPages || isStepLoading('analysis')
                  ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                  : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              {isStepLoading('analysis')
                ? 'Running Analysis...'
                : 'Run Analysis'}
            </button>
          </SOPStepActions>
        )}
      </SOPStepContent>
    </SOPStep>
  )
}
