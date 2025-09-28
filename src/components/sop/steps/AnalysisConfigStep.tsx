'use client'

import { SOPStep } from '../SOPStep'
import { AnalysisConfigForm } from '../AnalysisConfigForm'
import { useContentAuditSOPContext } from '../ContentAuditSOPContext'

export function AnalysisConfigStep() {
  const {
    handleAnalysisConfig,
    isStepActive,
    isStepCompleted,
    hasStepError,
    getStepError,
    isStepLoading,
    state,
  } = useContentAuditSOPContext()

  return (
    <SOPStep
      title="Analysis Configuration"
      description="Configure how your content audit analysis will be performed"
      stepNumber={3}
      isCompleted={isStepCompleted('analysis-config')}
      isActive={isStepActive('analysis-config')}
      hasError={hasStepError('analysis-config')}
      errorMessage={getStepError('analysis-config')}
    >
      <AnalysisConfigForm
        onComplete={handleAnalysisConfig}
        pageCount={state.uploadedPages?.length || 0}
        isLoading={isStepLoading('analysis-config')}
      />
    </SOPStep>
  )
}
