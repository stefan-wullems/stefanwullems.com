'use client'

import { useState, useCallback, useMemo } from 'react'
import { SOPStep } from './SOPStep'
import { ProjectSetupForm, ProjectConfig } from './ProjectSetupForm'
import { DataUploadForm } from './DataUploadForm'
import { AnalysisConfigForm, AnalysisConfig } from './AnalysisConfigForm'
import { ResultsTable } from './ResultsTable'
import { ProgressTracker, SOPStep as ProgressStep } from './ProgressTracker'
import { AhrefsPageData, enrichWithPublishedDates } from '@/lib/sop/ahrefs-page'
import { ContentInventory } from '@/lib/sop/content-inventory'
import { TimeBasedAnalysis } from '@/lib/sop/time-based-analysis'

type SOPStepId =
  | 'project-setup'
  | 'data-upload'
  | 'analysis-config'
  | 'run-analysis'
  | 'results'

interface SOPState {
  currentStep: SOPStepId
  completedSteps: Set<SOPStepId>
  projectConfig?: ProjectConfig
  uploadedPages?: AhrefsPageData[]
  analysisConfig?: AnalysisConfig
  enrichedPages?: AhrefsPageData[]
  contentInventory?: ContentInventory
  timeBasedAnalysis?: TimeBasedAnalysis
  errors: Record<SOPStepId, string>
  isLoading: Record<SOPStepId, boolean>
}

export function ContentAuditSOP() {
  const [state, setState] = useState<SOPState>({
    currentStep: 'project-setup',
    completedSteps: new Set(),
    errors: {} as Record<SOPStepId, string>,
    isLoading: {} as Record<SOPStepId, boolean>,
  })

  const setLoading = useCallback((step: SOPStepId, loading: boolean) => {
    setState((prev) => ({
      ...prev,
      isLoading: { ...prev.isLoading, [step]: loading },
    }))
  }, [])

  const setError = useCallback((step: SOPStepId, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [step]: error },
    }))
  }, [])

  const clearError = useCallback((step: SOPStepId) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [step]: '' },
    }))
  }, [])

  const completeStep = useCallback((step: SOPStepId, nextStep?: SOPStepId) => {
    setState((prev) => {
      const newCompletedSteps = new Set(prev.completedSteps)
      newCompletedSteps.add(step)

      return {
        ...prev,
        completedSteps: newCompletedSteps,
        currentStep: nextStep || prev.currentStep,
        errors: { ...prev.errors, [step]: '' },
      }
    })
  }, [])

  const handleProjectSetup = useCallback(
    async (config: ProjectConfig) => {
      setLoading('project-setup', true)
      clearError('project-setup')

      try {
        // In a real implementation, this would create the project structure
        // For now, we'll just simulate the API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setState((prev) => ({
          ...prev,
          projectConfig: config,
        }))

        completeStep('project-setup', 'data-upload')
      } catch (error) {
        setError(
          'project-setup',
          error instanceof Error ? error.message : 'Failed to create project',
        )
      } finally {
        setLoading('project-setup', false)
      }
    },
    [completeStep, setLoading, clearError, setError],
  )

  const handleDataUpload = useCallback(
    async (pages: AhrefsPageData[]) => {
      setLoading('data-upload', true)
      clearError('data-upload')

      try {
        // Validate the data
        if (pages.length === 0) {
          throw new Error('No valid pages found in the uploaded data')
        }

        setState((prev) => ({
          ...prev,
          uploadedPages: pages,
        }))

        completeStep('data-upload', 'analysis-config')
      } catch (error) {
        setError(
          'data-upload',
          error instanceof Error
            ? error.message
            : 'Failed to process uploaded data',
        )
      } finally {
        setLoading('data-upload', false)
      }
    },
    [completeStep, setLoading, clearError, setError],
  )

  const handleAnalysisConfig = useCallback(
    async (config: AnalysisConfig) => {
      setLoading('analysis-config', true)
      clearError('analysis-config')

      try {
        setState((prev) => ({
          ...prev,
          analysisConfig: config,
        }))

        completeStep('analysis-config', 'run-analysis')
      } catch (error) {
        setError(
          'analysis-config',
          error instanceof Error
            ? error.message
            : 'Failed to configure analysis',
        )
      } finally {
        setLoading('analysis-config', false)
      }
    },
    [completeStep, setLoading, clearError, setError],
  )

  const handleRunAnalysis = useCallback(async () => {
    if (!state.uploadedPages || !state.analysisConfig) return

    setLoading('run-analysis', true)
    clearError('run-analysis')

    try {
      let pages = state.uploadedPages

      // Enrich with published dates if requested
      if (state.analysisConfig.includePublishedDates) {
        pages = await enrichWithPublishedDates(
          pages,
          undefined, // No cache for demo
          state.analysisConfig.publishedDateDelay,
        )
      }

      // Generate content inventory
      const contentInventory = ContentInventory.fromPageData(pages)

      // Generate time-based analysis
      const timeBasedAnalysis = TimeBasedAnalysis.fromPageData(
        pages,
        state.analysisConfig.strategy,
      )

      setState((prev) => ({
        ...prev,
        enrichedPages: pages,
        contentInventory,
        timeBasedAnalysis,
      }))

      completeStep('run-analysis', 'results')
    } catch (error) {
      setError(
        'run-analysis',
        error instanceof Error ? error.message : 'Failed to run analysis',
      )
    } finally {
      setLoading('run-analysis', false)
    }
  }, [
    state.uploadedPages,
    state.analysisConfig,
    completeStep,
    setLoading,
    clearError,
    setError,
  ])

  // Progress tracker steps
  const progressSteps = useMemo(
    (): ProgressStep[] => [
      {
        id: 'project-setup',
        title: 'Project Setup',
        isCompleted: state.completedSteps.has('project-setup'),
        isActive: state.currentStep === 'project-setup',
        hasError: !!state.errors['project-setup'],
      },
      {
        id: 'data-upload',
        title: 'Data Upload',
        isCompleted: state.completedSteps.has('data-upload'),
        isActive: state.currentStep === 'data-upload',
        hasError: !!state.errors['data-upload'],
      },
      {
        id: 'analysis-config',
        title: 'Analysis Configuration',
        isCompleted: state.completedSteps.has('analysis-config'),
        isActive: state.currentStep === 'analysis-config',
        hasError: !!state.errors['analysis-config'],
      },
      {
        id: 'run-analysis',
        title: 'Run Analysis',
        isCompleted: state.completedSteps.has('run-analysis'),
        isActive: state.currentStep === 'run-analysis',
        hasError: !!state.errors['run-analysis'],
      },
      {
        id: 'results',
        title: 'View Results',
        isCompleted: state.completedSteps.has('results'),
        isActive: state.currentStep === 'results',
        hasError: !!state.errors['results'],
      },
    ],
    [state.currentStep, state.completedSteps, state.errors],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Progress Sidebar */}
        <div className="mb-8 lg:col-span-1 lg:mb-0">
          <ProgressTracker
            steps={progressSteps}
            currentStepId={state.currentStep}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Content Audit with Ahrefs
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Step-by-step guide to analyze your content performance using
                Ahrefs data
              </p>
            </div>

            {/* Step 1: Project Setup */}
            <SOPStep
              title="Set Up Your Project"
              description="Create a project workspace for your content audit analysis"
              stepNumber={1}
              isCompleted={state.completedSteps.has('project-setup')}
              isActive={
                state.currentStep === 'project-setup' ||
                !state.completedSteps.has('project-setup')
              }
              hasError={!!state.errors['project-setup']}
              errorMessage={state.errors['project-setup']}
            >
              <ProjectSetupForm
                onComplete={handleProjectSetup}
                initialConfig={state.projectConfig}
                isLoading={state.isLoading['project-setup']}
              />
            </SOPStep>

            {/* Step 2: Data Upload */}
            <SOPStep
              title="Upload Ahrefs Data"
              description="Export and upload your Ahrefs Top Pages CSV data"
              stepNumber={2}
              isCompleted={state.completedSteps.has('data-upload')}
              isActive={state.currentStep === 'data-upload'}
              hasError={!!state.errors['data-upload']}
              errorMessage={state.errors['data-upload']}
            >
              {state.projectConfig && (
                <DataUploadForm
                  onComplete={handleDataUpload}
                  projectName={state.projectConfig.projectName}
                  isLoading={state.isLoading['data-upload']}
                />
              )}
            </SOPStep>

            {/* Step 3: Analysis Configuration */}
            <SOPStep
              title="Configure Analysis"
              description="Set up analysis parameters and published date options"
              stepNumber={3}
              isCompleted={state.completedSteps.has('analysis-config')}
              isActive={state.currentStep === 'analysis-config'}
              hasError={!!state.errors['analysis-config']}
              errorMessage={state.errors['analysis-config']}
            >
              {state.uploadedPages && (
                <AnalysisConfigForm
                  onComplete={handleAnalysisConfig}
                  initialConfig={state.analysisConfig}
                  isLoading={state.isLoading['analysis-config']}
                  pageCount={state.uploadedPages.length}
                />
              )}
            </SOPStep>

            {/* Step 4: Run Analysis */}
            <SOPStep
              title="Run Analysis"
              description="Process your data and generate content audit results"
              stepNumber={4}
              isCompleted={state.completedSteps.has('run-analysis')}
              isActive={state.currentStep === 'run-analysis'}
              hasError={!!state.errors['run-analysis']}
              errorMessage={state.errors['run-analysis']}
            >
              {state.analysisConfig && (
                <div className="space-y-4">
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                    <h4 className="mb-2 text-sm font-medium text-blue-800">
                      Analysis Summary
                    </h4>
                    <div className="space-y-1 text-sm text-blue-700">
                      <p>
                        • <strong>Strategy:</strong>{' '}
                        {state.analysisConfig.strategy}
                      </p>
                      <p>
                        • <strong>Published Dates:</strong>{' '}
                        {state.analysisConfig.includePublishedDates
                          ? 'Enabled'
                          : 'Disabled'}
                      </p>
                      <p>
                        • <strong>Pages to Process:</strong>{' '}
                        {state.uploadedPages?.length || 0}
                      </p>
                    </div>
                  </div>

                  {state.isLoading['run-analysis'] && (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                      <p className="text-sm text-gray-600">
                        Running analysis... This may take a few minutes.
                      </p>
                      {state.analysisConfig.includePublishedDates && (
                        <p className="mt-2 text-xs text-gray-500">
                          Fetching published dates for{' '}
                          {state.uploadedPages?.length || 0} pages
                        </p>
                      )}
                    </div>
                  )}

                  {!state.isLoading['run-analysis'] &&
                    !state.completedSteps.has('run-analysis') && (
                      <div className="flex space-x-2 border-t pt-4">
                        <button
                          onClick={handleRunAnalysis}
                          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                        >
                          Start Analysis
                        </button>
                      </div>
                    )}
                </div>
              )}
            </SOPStep>

            {/* Step 5: Results */}
            <SOPStep
              title="Analysis Results"
              description="View and export your content audit results"
              stepNumber={5}
              isCompleted={state.completedSteps.has('results')}
              isActive={state.currentStep === 'results'}
              hasError={!!state.errors['results']}
              errorMessage={state.errors['results']}
            >
              {state.contentInventory && state.timeBasedAnalysis && (
                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Content Inventory Analysis
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                      Comprehensive content performance analysis with composite
                      scores, quartile rankings, and performance metrics.
                    </p>
                    <ResultsTable
                      data={state.contentInventory.items}
                      type="content-inventory"
                      title="Content Inventory"
                      onExportCsv={() => state.contentInventory!.exportToCsv()}
                    />
                  </div>

                  <div>
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Time-Based Analysis
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                      Performance trends over time showing how each page
                      performs relative to content published before it.
                    </p>
                    <ResultsTable
                      data={state.timeBasedAnalysis.items}
                      type="time-based-analysis"
                      title="Time-Based Analysis"
                      onExportCsv={() => state.timeBasedAnalysis!.exportToCsv()}
                    />
                  </div>

                  {state.timeBasedAnalysis.items.length > 0 && (
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                      <h4 className="mb-2 text-sm font-medium text-gray-800">
                        Analysis Summary
                      </h4>
                      {(() => {
                        const stats =
                          state.timeBasedAnalysis!.getPerformanceStats()
                        return (
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              • <strong>Total Pages:</strong> {stats.totalPages}
                            </p>
                            <p>
                              • <strong>Outperformers:</strong>{' '}
                              {stats.outperformers} pages (index &gt; 1.0)
                            </p>
                            <p>
                              • <strong>Underperformers:</strong>{' '}
                              {stats.underperformers} pages (index &lt; 1.0)
                            </p>
                            <p>
                              • <strong>Average Index:</strong>{' '}
                              {stats.averageIndex.toFixed(2)}
                            </p>
                            <p>
                              • <strong>Median Index:</strong>{' '}
                              {stats.medianIndex.toFixed(2)}
                            </p>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              )}
            </SOPStep>
          </div>
        </div>
      </div>
    </div>
  )
}
