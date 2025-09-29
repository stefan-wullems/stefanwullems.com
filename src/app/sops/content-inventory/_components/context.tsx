'use client'

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { AhrefsPageData } from '@/lib/sop/ahrefs-page'
import { ContentInventory } from '@/lib/sop/content-inventory'

export type InventoryStepId = 'data-upload' | 'analysis'

interface InventorySOPState {
  currentStep: InventoryStepId
  completedSteps: Set<InventoryStepId>
  uploadedPages?: AhrefsPageData[]
  contentInventory?: ContentInventory
  errors: Record<InventoryStepId, string>
  isLoading: Record<InventoryStepId, boolean>
}

export interface InventoryProgressStep {
  id: InventoryStepId
  title: string
  isCompleted: boolean
  isActive: boolean
  hasError: boolean
}

export function useContentInventorySOP() {
  const [state, setState] = useState<InventorySOPState>({
    currentStep: 'data-upload',
    completedSteps: new Set(),
    errors: {} as Record<InventoryStepId, string>,
    isLoading: {} as Record<InventoryStepId, boolean>,
  })

  const setLoading = useCallback((step: InventoryStepId, loading: boolean) => {
    setState((prev) => ({
      ...prev,
      isLoading: { ...prev.isLoading, [step]: loading },
    }))
  }, [])

  const setError = useCallback((step: InventoryStepId, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [step]: error },
    }))
  }, [])

  const clearError = useCallback((step: InventoryStepId) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [step]: '' },
    }))
  }, [])

  const completeStep = useCallback(
    (step: InventoryStepId, nextStep?: InventoryStepId) => {
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

        completeStep('data-upload', 'analysis')
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

  const handleRunAnalysis = useCallback(async () => {
    if (!state.uploadedPages) return

    setLoading('analysis', true)
    clearError('analysis')

    try {
      completeStep('analysis')
    } catch (error) {
      setError(
        'analysis',
        error instanceof Error ? error.message : 'Failed to run analysis',
      )
    } finally {
      setLoading('analysis', false)
    }
  }, [state.uploadedPages, completeStep, setLoading, clearError, setError])

  // Progress tracker steps
  const progressSteps = useMemo(
    (): InventoryProgressStep[] => [
      {
        id: 'data-upload',
        title: 'Data Upload',
        isCompleted: state.completedSteps.has('data-upload'),
        isActive: state.currentStep === 'data-upload',
        hasError: !!state.errors['data-upload'],
      },
      {
        id: 'analysis',
        title: 'Content Inventory Analysis',
        isCompleted: state.completedSteps.has('analysis'),
        isActive: state.currentStep === 'analysis',
        hasError: !!state.errors['analysis'],
      },
    ],
    [state.completedSteps, state.currentStep, state.errors],
  )

  const goToStep = useCallback((step: InventoryStepId) => {
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
    handleRunAnalysis,

    // Utilities
    goToStep,
    setError,
    clearError,

    // Helper getters
    isStepActive: (step: InventoryStepId) => state.currentStep === step,
    isStepCompleted: (step: InventoryStepId) => state.completedSteps.has(step),
    isStepLoading: (step: InventoryStepId) => !!state.isLoading[step],
    getStepError: (step: InventoryStepId) => state.errors[step],
    hasStepError: (step: InventoryStepId) => !!state.errors[step],
  }
}

type ContentInventorySOPContextType = ReturnType<typeof useContentInventorySOP>

const ContentInventorySOPContext =
  createContext<ContentInventorySOPContextType | null>(null)

interface ContentInventorySOPProviderProps {
  children: ReactNode
}

export function ContentInventorySOPProvider({
  children,
}: ContentInventorySOPProviderProps) {
  const sop = useContentInventorySOP()

  return (
    <ContentInventorySOPContext.Provider value={sop}>
      {children}
    </ContentInventorySOPContext.Provider>
  )
}

export function useContentInventorySOPContext() {
  const context = useContext(ContentInventorySOPContext)
  if (!context) {
    throw new Error(
      'useContentInventorySOPContext must be used within a ContentInventorySOPProvider',
    )
  }
  return context
}
