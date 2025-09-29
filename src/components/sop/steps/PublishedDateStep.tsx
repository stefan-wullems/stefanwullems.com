'use client'

import { useState } from 'react'
import { SOPStep, SOPStepContent, SOPStepActions } from '../SOPStep'
import { useContentAuditSOPContext } from '../ContentAuditSOPContext'
import { PublishedDateProgressBar } from '../PublishedDateProgressBar'
import { AnalysisConfig } from '../AnalysisConfigForm'

export function PublishedDateStep() {
  const {
    handlePublishedDateConfig,
    isStepActive,
    isStepCompleted,
    hasStepError,
    getStepError,
    isStepLoading,
    state,
  } = useContentAuditSOPContext()

  const [includePublishedDates, setIncludePublishedDates] = useState(true)
  const [publishedDateDelay, setPublishedDateDelay] = useState(1000)

  const handleSubmit = () => {
    const config: AnalysisConfig = {
      strategy: 'median', // Default strategy for now
      includePublishedDates,
      publishedDateDelay,
    }
    handlePublishedDateConfig(config)
  }

  return (
    <SOPStep
      title="Published Date Fetching"
      description="Configure and fetch published dates for time-based analysis"
      stepNumber={2}
      isCompleted={isStepCompleted('published-dates')}
      isActive={isStepActive('published-dates')}
      hasError={hasStepError('published-dates')}
      errorMessage={getStepError('published-dates')}
    >
      <SOPStepContent>
        <div className="space-y-6">
          <div>
            <p className="text-gray-700 mb-4">
              Published dates enable powerful time-based analysis that shows how each page performs
              relative to content published before it. This step will fetch published dates from
              your <strong>{state.uploadedPages?.length || 0} pages</strong> if enabled.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
              <h4 className="text-sm font-medium text-amber-800 mb-2">Time-Based Analysis Benefits</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• See performance trends over time</li>
                <li>• Identify improving or declining content</li>
                <li>• Compare pages against historical benchmarks</li>
                <li>• Discover seasonal performance patterns</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                id="includePublishedDates"
                type="checkbox"
                checked={includePublishedDates}
                onChange={(e) => setIncludePublishedDates(e.target.checked)}
                disabled={isStepLoading('published-dates')}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <label htmlFor="includePublishedDates" className="text-sm font-medium text-gray-700">
                  Fetch published dates for time-based analysis
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Recommended for comprehensive analysis. This process takes several minutes but provides
                  valuable temporal insights.
                </p>
              </div>
            </div>

            {includePublishedDates && (
              <div className="ml-7 space-y-4">
                <div>
                  <label htmlFor="publishedDateDelay" className="block text-sm font-medium text-gray-700 mb-2">
                    Delay between requests (milliseconds)
                  </label>
                  <select
                    id="publishedDateDelay"
                    value={publishedDateDelay}
                    onChange={(e) => setPublishedDateDelay(Number(e.target.value))}
                    disabled={isStepLoading('published-dates')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={500}>500ms - Fast (may be blocked by some sites)</option>
                    <option value={1000}>1000ms - Balanced (recommended)</option>
                    <option value={2000}>2000ms - Conservative (slower but safer)</option>
                    <option value={3000}>3000ms - Very safe (slowest)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Higher delays are safer but take longer. 1000ms works well for most websites.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Estimated Time</h4>
                  <p className="text-sm text-blue-700">
                    With {publishedDateDelay}ms delay: approximately{' '}
                    <strong>
                      {Math.ceil(((state.uploadedPages?.length || 0) * publishedDateDelay) / 60000)} minutes
                    </strong>{' '}
                    for {state.uploadedPages?.length || 0} pages
                  </p>
                </div>
              </div>
            )}
          </div>

          {isStepLoading('published-dates') && (
            <>
              {state.publishedDateProgress ? (
                <PublishedDateProgressBar progress={state.publishedDateProgress} />
              ) : (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Preparing to fetch published dates...
                      </p>
                      <p className="text-sm text-blue-700">
                        Initializing published date fetching process.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <SOPStepActions>
          <button
            onClick={handleSubmit}
            disabled={isStepLoading('published-dates')}
            className={`rounded-md px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none ${
              isStepLoading('published-dates')
                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isStepLoading('published-dates')
              ? includePublishedDates
                ? 'Fetching Published Dates...'
                : 'Processing...'
              : includePublishedDates
              ? 'Fetch Published Dates'
              : 'Skip Published Dates'}
          </button>
        </SOPStepActions>
      </SOPStepContent>
    </SOPStep>
  )
}
