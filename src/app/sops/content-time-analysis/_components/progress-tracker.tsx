'use client'

import { ProgressTracker } from '@/components/sop/ui/ProgressTracker'
import { useContentTimeAnalysisSOPContext } from './context'

export function TimeAnalysisProgressTracker() {
  const { progressSteps, state } = useContentTimeAnalysisSOPContext()

  return (
    <ProgressTracker steps={progressSteps} currentStepId={state.currentStep} />
  )
}
