'use client'

import { SOPStep } from '../SOPStep'
import { ProjectSetupForm } from '../ProjectSetupForm'
import { useContentAuditSOPContext } from '../ContentAuditSOPContext'

export function ProjectSetupStep() {
  const {
    handleProjectSetup,
    isStepActive,
    isStepCompleted,
    hasStepError,
    getStepError,
    isStepLoading,
  } = useContentAuditSOPContext()

  return (
    <SOPStep
      title="Project Setup"
      description="Configure your content audit project settings"
      stepNumber={1}
      isCompleted={isStepCompleted('project-setup')}
      isActive={isStepActive('project-setup')}
      hasError={hasStepError('project-setup')}
      errorMessage={getStepError('project-setup')}
    >
      <ProjectSetupForm
        onComplete={handleProjectSetup}
        isLoading={isStepLoading('project-setup')}
      />
    </SOPStep>
  )
}
