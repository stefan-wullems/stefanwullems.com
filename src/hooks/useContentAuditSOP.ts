'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  AhrefsPageData,
  enrichWithPublishedDates,
  PublishedDateProgress,
} from '@/lib/sop/ahrefs-page'
import { ContentInventory } from '@/lib/sop/content-inventory'
import { TimeBasedAnalysis } from '@/lib/sop/time-based-analysis'

import { AnalysisConfig } from '@/components/sop/AnalysisConfigForm'

export type SOPStepId = 'data-upload' | 'published-dates' | 'analysis'

interface SOPState {
  currentStep: SOPStepId
  completedSteps: Set<SOPStepId>
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
    currentStep: 'data-upload',
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

        completeStep('data-upload', 'published-dates')
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

  const handlePublishedDateConfig = useCallback(
    async (config: AnalysisConfig) => {
      setLoading('published-dates', true)
      clearError('published-dates')

      try {
        setState((prev) => ({
          ...prev,
          analysisConfig: config,
        }))

        // If published dates are enabled, fetch them now
        if (config.includePublishedDates && state.uploadedPages) {
          // Set up progress callback
          const onProgress = (progress: PublishedDateProgress) => {
            setState((prev) => ({
              ...prev,
              publishedDateProgress: progress,
            }))
          }

          const enrichedPages = await enrichWithPublishedDates(
            state.uploadedPages,
            undefined, // No cache for demo
            config.publishedDateDelay,
            onProgress,
          )

          // Keep the final progress state visible for a moment before clearing
          await new Promise((resolve) => setTimeout(resolve, 1500))

          setState((prev) => ({
            ...prev,
            uploadedPages: enrichedPages,
            publishedDateProgress: undefined,
          }))
        }

        completeStep('published-dates', 'analysis')
      } catch (error) {
        setError(
          'published-dates',
          error instanceof Error
            ? error.message
            : 'Failed to fetch published dates',
        )
      } finally {
        setLoading('published-dates', false)
      }
    },
    [completeStep, setLoading, clearError, setError, state.uploadedPages],
  )

  const handleRunAnalysis = useCallback(
    async (config: AnalysisConfig) => {
      if (!state.uploadedPages) return

      setLoading('analysis', true)
      clearError('analysis')

      try {
        // Update config first
        setState((prev) => ({
          ...prev,
          analysisConfig: config,
        }))

        // Generate content inventory
        const contentInventory = ContentInventory.fromPageData(
          state.uploadedPages,
        )

        // Generate time-based analysis
        const timeBasedAnalysis = TimeBasedAnalysis.fromPageData(
          state.uploadedPages,
          config.strategy,
        )

        setState((prev) => ({
          ...prev,
          enrichedPages: state.uploadedPages,
          contentInventory,
          timeBasedAnalysis,
        }))

        completeStep('analysis')
      } catch (error) {
        setError(
          'analysis',
          error instanceof Error ? error.message : 'Failed to run analysis',
        )
      } finally {
        setLoading('analysis', false)
      }
    },
    [state.uploadedPages, completeStep, setLoading, clearError, setError],
  )

  // Progress tracker steps
  const progressSteps = useMemo(
    (): ProgressStep[] => [
      {
        id: 'data-upload',
        title: 'Data Upload',
        isCompleted: state.completedSteps.has('data-upload'),
        isActive: state.currentStep === 'data-upload',
        hasError: !!state.errors['data-upload'],
      },
      {
        id: 'published-dates',
        title: 'Published Dates',
        isCompleted: state.completedSteps.has('published-dates'),
        isActive: state.currentStep === 'published-dates',
        hasError: !!state.errors['published-dates'],
      },
      {
        id: 'analysis',
        title: 'Analysis & Results',
        isCompleted: state.completedSteps.has('analysis'),
        isActive: state.currentStep === 'analysis',
        hasError: !!state.errors['analysis'],
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
    handleDataUpload,
    handlePublishedDateConfig,
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
