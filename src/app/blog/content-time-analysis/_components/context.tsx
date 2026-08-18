'use client'

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useMemo,
} from 'react'
import {
  AhrefsPageData,
  enrichWithPublishedDates,
  PublishedDateProgress,
} from '@/lib/sop/ahrefs-page'
import { TimeBasedAnalysis } from '@/lib/sop/time-based-analysis'
import { AnalysisConfig } from '@/components/sop/forms/AnalysisConfigForm'

export type TimeAnalysisStepId = 'data-upload' | 'published-dates' | 'analysis'

interface TimeAnalysisSOPState {
  currentStep: TimeAnalysisStepId
  completedSteps: Set<TimeAnalysisStepId>
  uploadedPages?: AhrefsPageData[]
  analysisConfig?: AnalysisConfig
  timeBasedAnalysis?: TimeBasedAnalysis
  errors: Record<TimeAnalysisStepId, string>
  isLoading: Record<TimeAnalysisStepId, boolean>
  publishedDateProgress?: PublishedDateProgress
}

export interface TimeAnalysisProgressStep {
  id: TimeAnalysisStepId
  title: string
  isCompleted: boolean
  isActive: boolean
  hasError: boolean
}

export function useContentTimeAnalysisSOP() {
  const [state, setState] = useState<TimeAnalysisSOPState>({
    currentStep: 'data-upload',
    completedSteps: new Set(),
    errors: {} as Record<TimeAnalysisStepId, string>,
    isLoading: {} as Record<TimeAnalysisStepId, boolean>,
  })

  const setLoading = useCallback(
    (step: TimeAnalysisStepId, loading: boolean) => {
      setState((prev) => ({
        ...prev,
        isLoading: { ...prev.isLoading, [step]: loading },
      }))
    },
    [],
  )

  const setError = useCallback((step: TimeAnalysisStepId, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [step]: error },
    }))
  }, [])

  const clearError = useCallback((step: TimeAnalysisStepId) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [step]: '' },
    }))
  }, [])

  const completeStep = useCallback(
    (step: TimeAnalysisStepId, nextStep?: TimeAnalysisStepId) => {
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
    },
    [],
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

        // Published dates are required for time-based analysis
        if (state.uploadedPages) {
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

          // Keep the completed progress state visible (don't clear it)
          setState((prev) => ({
            ...prev,
            uploadedPages: enrichedPages,
            // Keep the final progress state with completion info
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

        // Generate time-based analysis
        const timeBasedAnalysis = TimeBasedAnalysis.fromPageData(
          state.uploadedPages,
          config.strategy,
        )

        setState((prev) => ({
          ...prev,
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
    (): TimeAnalysisProgressStep[] => [
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
        title: 'Time Analysis & Results',
        isCompleted: state.completedSteps.has('analysis'),
        isActive: state.currentStep === 'analysis',
        hasError: !!state.errors['analysis'],
      },
    ],
    [state.completedSteps, state.currentStep, state.errors],
  )

  const goToStep = useCallback((step: TimeAnalysisStepId) => {
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
    isStepActive: (step: TimeAnalysisStepId) => state.currentStep === step,
    isStepCompleted: (step: TimeAnalysisStepId) =>
      state.completedSteps.has(step),
    isStepLoading: (step: TimeAnalysisStepId) => !!state.isLoading[step],
    getStepError: (step: TimeAnalysisStepId) => state.errors[step],
    hasStepError: (step: TimeAnalysisStepId) => !!state.errors[step],
  }
}

type ContentTimeAnalysisSOPContextType = ReturnType<
  typeof useContentTimeAnalysisSOP
>

const ContentTimeAnalysisSOPContext =
  createContext<ContentTimeAnalysisSOPContextType | null>(null)

interface ContentTimeAnalysisSOPProviderProps {
  children: ReactNode
}

export function ContentTimeAnalysisSOPProvider({
  children,
}: ContentTimeAnalysisSOPProviderProps) {
  const sop = useContentTimeAnalysisSOP()

  return (
    <ContentTimeAnalysisSOPContext.Provider value={sop}>
      {children}
    </ContentTimeAnalysisSOPContext.Provider>
  )
}

export function useContentTimeAnalysisSOPContext() {
  const context = useContext(ContentTimeAnalysisSOPContext)
  if (!context) {
    throw new Error(
      'useContentTimeAnalysisSOPContext must be used within a ContentTimeAnalysisSOPProvider',
    )
  }
  return context
}
