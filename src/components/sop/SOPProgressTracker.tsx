'use client'

import { ProgressTracker } from './ProgressTracker'
import { useContentAuditSOPContext } from './ContentAuditSOPContext'

export function SOPProgressTracker() {
  const { progressSteps, state } = useContentAuditSOPContext()

  return (
    <ProgressTracker steps={progressSteps} currentStepId={state.currentStep} />
  )
}
