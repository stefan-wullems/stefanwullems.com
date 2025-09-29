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
import { Table } from '@/components/Table'

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
  const [strategy, setStrategy] = useState<'median' | 'average'>('average')

  const handleRunAnalysis = async () => {
    const config: AnalysisConfig = {
      strategy,
      includePublishedDates: true,
      publishedDateDelay: sop.state.analysisConfig?.publishedDateDelay || 1000,
    }

    await sop.handleRunAnalysis(config)
  }

  const timeAnalysis = sop.state.timeBasedAnalysis
  const stats = timeAnalysis?.getPerformanceStats()

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
                <option value="average">
                  Average (Recommended) - Traditional mathematical mean
                </option>
                <option value="median">
                  Median - More stable with outliers, use only with larger
                  websites
                </option>
              </select>
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
                : sop.isStepCompleted('analysis')
                  ? 'Re-run Analysis'
                  : 'Run Time-Based Analysis'}
            </button>
          </div>

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
              <Table
                columns={[
                  { header: 'URL', key: 'url', sortable: true, truncate: true },
                  {
                    header: 'Title',
                    key: 'title',
                    sortable: true,
                    truncate: true,
                  },
                  {
                    key: 'publishDate',
                    header: 'Publish Date',
                    sortable: true,
                  },
                  {
                    key: 'timeBasedIndex',
                    header: 'Time Based Index',
                    sortable: true,
                  },
                  {
                    key: 'referringDomains',
                    header: 'Referring Domains',
                    sortable: true,
                  },
                ]}
                data={timeAnalysis.items}
              />
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
