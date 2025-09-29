'use client'

import { SOPStep } from '../SOPStep'
import { DataUploadForm } from '../DataUploadForm'
import { useContentAuditSOPContext } from '../ContentAuditSOPContext'

export function DataUploadStep() {
  const {
    handleDataUpload,
    isStepActive,
    isStepCompleted,
    hasStepError,
    getStepError,
    isStepLoading,
    state,
  } = useContentAuditSOPContext()

  return (
    <SOPStep
      title="Data Upload"
      description="Upload your Ahrefs CSV export to begin the analysis"
      stepNumber={1}
      isCompleted={isStepCompleted('data-upload')}
      isActive={isStepActive('data-upload')}
      hasError={hasStepError('data-upload')}
      errorMessage={getStepError('data-upload')}
    >
      <DataUploadForm
        onComplete={handleDataUpload}
        isLoading={isStepLoading('data-upload')}
      />
    </SOPStep>
  )
}
