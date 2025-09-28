'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  AhrefsPageData,
  enrichWithPublishedDates,
  PublishedDateProgress,
} from '@/lib/sop/ahrefs-page'
import { ContentInventory } from '@/lib/sop/content-inventory'
import { TimeBasedAnalysis } from '@/lib/sop/time-based-analysis'
import { ProjectConfig } from '@/components/sop/ProjectSetupForm'
import { AnalysisConfig } from '@/components/sop/AnalysisConfigForm'

export type SOPStepId =
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
  publishedDateProgress?: PublishedDateProgress
}

export interface ProgressStep {
  id: SOPStepId
  title: string
  isCompleted: boolean
  isActive: boolean
  hasError: boolean
}

export function useContentAuditSOP() {
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
        // Set up progress callback
        const onProgress = (progress: PublishedDateProgress) => {
          setState((prev) => ({
            ...prev,
            publishedDateProgress: progress,
          }))
        }

        pages = await enrichWithPublishedDates(
          pages,
          undefined, // No cache for demo
          state.analysisConfig.publishedDateDelay,
          onProgress,
        )

        // Keep the final progress state visible for a moment before clearing
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Clear progress when done
        setState((prev) => ({
          ...prev,
          publishedDateProgress: undefined,
        }))
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
        title: 'Analysis Config',
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
        title: 'Results',
        isCompleted: state.completedSteps.has('results'),
        isActive: state.currentStep === 'results',
        hasError: !!state.errors['results'],
      },
    ],
    [state.completedSteps, state.currentStep, state.errors],
  )

  const goToStep = useCallback((step: SOPStepId) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
    }))
  }, [])

  return {
    // State
    state,
    progressSteps,

    // Step handlers
    handleProjectSetup,
    handleDataUpload,
    handleAnalysisConfig,
    handleRunAnalysis,

    // Utilities
    goToStep,
    setError,
    clearError,

    // Helper getters
    isStepActive: (step: SOPStepId) => state.currentStep === step,
    isStepCompleted: (step: SOPStepId) => state.completedSteps.has(step),
    isStepLoading: (step: SOPStepId) => !!state.isLoading[step],
    getStepError: (step: SOPStepId) => state.errors[step],
    hasStepError: (step: SOPStepId) => !!state.errors[step],
  }
}
