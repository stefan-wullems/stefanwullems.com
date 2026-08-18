'use client'

import { ProgressTracker } from '@/components/sop/ui/ProgressTracker'
import { useContentInventorySOPContext } from './context'

export function InventoryProgressTracker() {
  const { progressSteps, state } = useContentInventorySOPContext()

  return (
    <ProgressTracker steps={progressSteps} currentStepId={state.currentStep} />
  )
}
