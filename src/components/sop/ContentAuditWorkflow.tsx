'use client'

import { useContentAuditSOPContext } from './ContentAuditSOPContext'
import { SOPProgressTracker } from './SOPProgressTracker'
import { DataUploadStep, PublishedDateStep, AnalysisStep } from './steps'

interface ContentAuditWorkflowProps {
  showProgressTracker?: boolean
  showAllSteps?: boolean
}

export function ContentAuditWorkflow({
  showProgressTracker = true,
  showAllSteps = true,
}: ContentAuditWorkflowProps = {}) {
  const sop = useContentAuditSOPContext()

  return (
    <div className="space-y-8">
      {showProgressTracker && <SOPProgressTracker />}

      <div className="space-y-8">
        {showAllSteps ? (
          <>
            <DataUploadStep />
            <PublishedDateStep />
            <AnalysisStep />
          </>
        ) : (
          <>
            {sop.isStepActive('data-upload') && <DataUploadStep />}
            {sop.isStepActive('published-dates') && <PublishedDateStep />}
            {sop.isStepActive('analysis') && <AnalysisStep />}
          </>
        )}
      </div>
    </div>
  )
}

// Individual step components for use in MDX
export function DataUploadStepWrapper() {
  return <DataUploadStep />
}

export function PublishedDateStepWrapper() {
  return <PublishedDateStep />
}

export function AnalysisStepWrapper() {
  return <AnalysisStep />
}

export function ProgressTrackerWrapper() {
  return <SOPProgressTracker />
}
