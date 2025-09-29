'use client'

import { useState } from 'react'
import { useContentTimeAnalysisSOPContext } from './context'
import {
  SOPStep,
  SOPStepActions,
  SOPStepContent,
} from '@/components/sop/ui/SOPStep'
import { AnalysisConfig } from '@/components/sop/forms/AnalysisConfigForm'
import { DataUploadForm, PublishedDateConfigForm } from '@/components/sop'

export function UploadAhrefsPageData() {
  const sop = useContentTimeAnalysisSOPContext()
  return (
    <SOPStep
      isCompleted={sop.isStepCompleted('data-upload')}
      isActive={sop.isStepActive('data-upload')}
      hasError={sop.hasStepError('data-upload')}
      errorMessage={sop.getStepError('data-upload')}
      title={'Data Upload'}
      description={'Upload your Ahrefs CSV export'}
      stepNumber={1}
    >
      <SOPStepContent>
        <DataUploadForm
          onComplete={sop.handleDataUpload}
          isLoading={sop.isStepLoading('data-upload')}
        />
      </SOPStepContent>
    </SOPStep>
  )
}

export function TimePublishedDateStepWrapper() {
  const sop = useContentTimeAnalysisSOPContext()
  return (
    <SOPStep
      stepNumber={2}
      title={'Published Date Configuration'}
      description={'Configure and fetch published dates for temporal analysis'}
      isCompleted={sop.isStepCompleted('published-dates')}
      isActive={sop.isStepActive('published-dates')}
      hasError={sop.hasStepError('published-dates')}
      errorMessage={sop.getStepError('published-dates')}
    >
      <SOPStepContent>
        <PublishedDateConfigForm
          onComplete={sop.handlePublishedDateConfig}
          isLoading={sop.isStepLoading('published-dates')}
          progress={sop.state.publishedDateProgress}
          pageCount={sop.state.uploadedPages?.length || 0}
          isRequired
        />
      </SOPStepContent>
    </SOPStep>
  )
}

export function TimeAnalysisStep() {
  const sop = useContentTimeAnalysisSOPContext()
  const [strategy, setStrategy] = useState<'median' | 'average'>('median')

  const handleRunAnalysis = async () => {
    const config: AnalysisConfig = {
      strategy,
      includePublishedDates: true,
      publishedDateDelay: sop.state.analysisConfig?.publishedDateDelay || 1000,
    }

    await sop.handleRunAnalysis(config)
  }

  const handleExportCsv = () => {
    if (!sop.state.timeBasedAnalysis) return

    const csvContent = sop.state.timeBasedAnalysis.exportToCsv()
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'time-based-analysis.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const timeAnalysis = sop.state.timeBasedAnalysis
  const stats = timeAnalysis?.getPerformanceStats()
  const outperformers = timeAnalysis?.getOutperformers(1.2) || []
  const underperformers = timeAnalysis?.getUnderperformers(0.8) || []

  return (
    <SOPStep
      title="Time-Based Performance Analysis"
      description="Configure analysis strategy and generate temporal performance insights"
      stepNumber={3}
      isCompleted={sop.isStepCompleted('analysis')}
      isActive={sop.isStepActive('analysis')}
      hasError={sop.hasStepError('analysis')}
      errorMessage={sop.getStepError('analysis')}
    >
      <SOPStepContent>
        <div className="space-y-6">
          {/* Configuration */}
          {!sop.isStepCompleted('analysis') && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="strategy"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Analysis Strategy
                </label>
                <select
                  id="strategy"
                  value={strategy}
                  onChange={(e) =>
                    setStrategy(e.target.value as 'median' | 'average')
                  }
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="median">
                    Median (Recommended) - More stable with outliers
                  </option>
                  <option value="average">
                    Average - Traditional mathematical mean
                  </option>
                </select>
              </div>

              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <div className="flex items-start space-x-3">
                  <div className="text-amber-600 dark:text-amber-400">ℹ</div>
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    {strategy === 'median'
                      ? 'Median strategy is recommended for most websites as it provides more stable results when dealing with high traffic variance.'
                      : 'Average strategy uses traditional mathematical averaging but can be skewed by pages with exceptionally high traffic.'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleRunAnalysis}
                disabled={
                  sop.isStepLoading('analysis') || !sop.state.uploadedPages
                }
                className={`w-full rounded-md px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                  sop.isStepLoading('analysis') || !sop.state.uploadedPages
                    ? 'cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-600 dark:text-zinc-400'
                    : 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 dark:bg-amber-600 dark:hover:bg-amber-700'
                }`}
              >
                {sop.isStepLoading('analysis')
                  ? 'Running Analysis...'
                  : 'Run Time-Based Analysis'}
              </button>
            </div>
          )}

          {/* Error Display */}
          {sop.hasStepError('analysis') && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-center space-x-3">
                <div className="text-red-600 dark:text-red-400">⚠</div>
                <div className="text-sm text-red-800 dark:text-red-200">
                  {sop.getStepError('analysis')}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {timeAnalysis && stats && (
            <div className="space-y-6">
              {/* Performance Statistics */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Performance Overview
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="text-2xl font-bold">{stats.totalPages}</div>
                    <div className="text-sm text-zinc-500">Total Pages</div>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.outperformers}
                    </div>
                    <div className="text-sm text-zinc-500">Outperformers</div>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.underperformers}
                    </div>
                    <div className="text-sm text-zinc-500">Underperformers</div>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="text-2xl font-bold">
                      {stats.averageIndex.toFixed(2)}
                    </div>
                    <div className="text-sm text-zinc-500">Avg Index</div>
                  </div>
                </div>
              </div>

              {/* Top Outperformers */}
              {outperformers.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                    <span className="text-green-600">↗</span>
                    Top Outperformers (Index &gt; 1.2)
                  </h3>
                  <div className="space-y-2">
                    {outperformers.slice(0, 5).map((item, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1 truncate text-sm font-medium">
                              {item.title || item.url}
                            </div>
                            <div className="text-xs text-zinc-500">
                              Published: {item.publishDate} • RD:{' '}
                              {item.referringDomains}
                            </div>
                          </div>
                          <span className="ml-2 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200">
                            {item.timeBasedIndex.toFixed(2)}x
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Underperformers */}
              {underperformers.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                    <span className="text-red-600">↘</span>
                    Underperformers (Index &lt; 0.8)
                  </h3>
                  <div className="space-y-2">
                    {underperformers.slice(0, 5).map((item, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1 truncate text-sm font-medium">
                              {item.title || item.url}
                            </div>
                            <div className="text-xs text-zinc-500">
                              Published: {item.publishDate} • RD:{' '}
                              {item.referringDomains}
                            </div>
                          </div>
                          <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                            {item.timeBasedIndex.toFixed(2)}x
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export Button */}
              <button
                onClick={handleExportCsv}
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:ring-2 focus:ring-amber-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <span className="mr-2">⬇</span>
                Export Time Analysis to CSV
              </button>

              {/* Interpretation Guide */}
              <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-600 dark:text-blue-400">📊</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Understanding Performance Index:</strong>
                    <br />• &gt; 1.5: Exceptional performers significantly
                    outpacing historical averages
                    <br />• 1.0-1.5: Solid performers exceeding typical
                    benchmarks
                    <br />• 0.5-1.0: Below average content with improvement
                    opportunities
                    <br />• &lt; 0.5: Underperformers requiring immediate
                    attention
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SOPStepContent>
    </SOPStep>
  )
}

export function TimeAnalysisStepWrapper() {
  return <TimeAnalysisStep />
}
