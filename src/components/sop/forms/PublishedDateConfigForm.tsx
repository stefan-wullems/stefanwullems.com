'use client'

import { useState } from 'react'
import { SOPStepContent, SOPStepActions } from '../ui/SOPStep'
import { PublishedDateProgressBar } from '../progress/PublishedDateProgressBar'
import { AnalysisConfig } from './AnalysisConfigForm'
import { PublishedDateProgress } from '@/lib/sop/ahrefs-page'

export interface PublishedDateConfigFormProps {
  onComplete: (config: AnalysisConfig) => Promise<void>
  isLoading: boolean
  progress?: PublishedDateProgress
  pageCount: number
  isRequired?: boolean
}

export function PublishedDateConfigForm({
  onComplete,
  isLoading,
  progress,
  pageCount,
}: PublishedDateConfigFormProps) {
  const [publishedDateDelay, setPublishedDateDelay] = useState(500)

  const handleSubmit = () => {
    const config: AnalysisConfig = {
      strategy: 'median', // Default strategy for now
      includePublishedDates: true, // TODO: remove and make it always true
      publishedDateDelay,
    }
    onComplete(config)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-4 text-zinc-700 dark:text-zinc-300">
          Configure published date fetching for your{' '}
          <strong>{pageCount} pages</strong>.
        </p>
      </div>

      <div className="space-y-4">
        <div className="ml-7 space-y-4">
          <div>
            <label
              htmlFor="publishedDateDelay"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Delay between requests (milliseconds)
            </label>
            <select
              id="publishedDateDelay"
              value={publishedDateDelay}
              onChange={(e) => setPublishedDateDelay(Number(e.target.value))}
              disabled={isLoading}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value={200}>
                200ms - Fast (may be blocked by some sites)
              </option>
              <option value={500}>500ms - Balanced (recommended)</option>
              <option value={1000}>
                1000ms - Conservative (slower but safer)
              </option>
            </select>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Higher delays are safer but take longer. 500ms works well for most
              websites.
            </p>
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <h4 className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-200">
              Estimated Time
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              With {publishedDateDelay}ms delay: approximately{' '}
              <strong>
                {Math.ceil((pageCount * publishedDateDelay) / 60000)} minutes
              </strong>{' '}
              for {pageCount} pages
            </p>
          </div>
        </div>
      </div>

      {(isLoading || progress?.isCompleted) && (
        <>
          {progress ? (
            <PublishedDateProgressBar progress={progress} />
          ) : (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-amber-600 dark:border-amber-400"></div>
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Preparing to fetch published dates...
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Initializing published date fetching process.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!progress?.isCompleted && (
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`rounded-md px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none ${
            isLoading
              ? 'cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-600 dark:text-zinc-400'
              : 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 dark:bg-amber-600 dark:hover:bg-amber-700'
          }`}
        >
          {isLoading ? 'Fetching Published Dates...' : 'Fetch Published Dates'}
        </button>
      )}
    </div>
  )
}
