'use client'

import { SOPStep, SOPStepContent, SOPStepActions } from '../SOPStep'
import { useContentAuditSOPContext } from '../ContentAuditSOPContext'
import { PublishedDateProgressBar } from '../PublishedDateProgressBar'

export function RunAnalysisStep() {
  const {
    handleRunAnalysis,
    isStepActive,
    isStepCompleted,
    hasStepError,
    getStepError,
    isStepLoading,
    state,
  } = useContentAuditSOPContext()

  const canRunAnalysis = !!(state.uploadedPages && state.analysisConfig)

  return (
    <SOPStep
      title="Run Analysis"
      description="Process your data and generate content audit results"
      stepNumber={4}
      isCompleted={isStepCompleted('run-analysis')}
      isActive={isStepActive('run-analysis')}
      hasError={hasStepError('run-analysis')}
      errorMessage={getStepError('run-analysis')}
    >
      <SOPStepContent>
        <div className="space-y-6">
          <div>
            <p className="mb-4 text-gray-700">
              Ready to analyze your content! This step will process{' '}
              <strong>{state.uploadedPages?.length || 0} pages</strong> and
              generate comprehensive content audit insights.
            </p>

            {state.analysisConfig?.includePublishedDates && (
              <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4">
                <h4 className="mb-2 text-sm font-medium text-amber-800">
                  Published Date Analysis Enabled
                </h4>
                <p className="text-sm text-amber-700">
                  This analysis will include published date fetching with a{' '}
                  {state.analysisConfig.publishedDateDelay}ms delay between
                  requests. This may take several minutes depending on the
                  number of pages.
                </p>
              </div>
            )}

            {state.analysisConfig && (
              <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 text-sm font-medium text-blue-800">
                  Analysis Configuration
                </h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>
                    <strong>Strategy:</strong>{' '}
                    {state.analysisConfig.strategy === 'median'
                      ? 'Median (recommended for most sites)'
                      : 'Average'}
                  </li>
                  <li>
                    <strong>Published dates:</strong>{' '}
                    {state.analysisConfig.includePublishedDates
                      ? 'Included'
                      : 'Excluded'}
                  </li>
                  {state.analysisConfig.includePublishedDates && (
                    <li>
                      <strong>Request delay:</strong>{' '}
                      {state.analysisConfig.publishedDateDelay}ms
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {isStepLoading('run-analysis') && (
            <>
              {state.publishedDateProgress ? (
                <PublishedDateProgressBar
                  progress={state.publishedDateProgress}
                />
              ) : (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        {state.analysisConfig?.includePublishedDates
                          ? 'Preparing to fetch published dates...'
                          : 'Running Analysis...'}
                      </p>
                      <p className="text-sm text-blue-700">
                        {state.analysisConfig?.includePublishedDates
                          ? 'Initializing published date fetching process.'
                          : 'Processing your data. This should only take a few seconds.'}
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
            onClick={handleRunAnalysis}
            disabled={!canRunAnalysis || isStepLoading('run-analysis')}
            className={`rounded-md px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none ${
              !canRunAnalysis || isStepLoading('run-analysis')
                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
            }`}
          >
            {isStepLoading('run-analysis')
              ? 'Running Analysis...'
              : 'Run Analysis'}
          </button>
        </SOPStepActions>
      </SOPStepContent>
    </SOPStep>
  )
}
