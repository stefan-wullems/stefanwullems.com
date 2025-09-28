'use client'

import { useContentAuditSOPContext } from './ContentAuditSOPContext'
import { SOPProgressTracker } from './SOPProgressTracker'
import {
  ProjectSetupStep,
  DataUploadStep,
  AnalysisConfigStep,
  RunAnalysisStep,
  ResultsStep,
} from './steps'

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
            <ProjectSetupStep />
            <DataUploadStep />
            <AnalysisConfigStep />
            <RunAnalysisStep />
            <ResultsStep />
          </>
        ) : (
          <>
            {sop.isStepActive('project-setup') && <ProjectSetupStep />}
            {sop.isStepActive('data-upload') && <DataUploadStep />}
            {sop.isStepActive('analysis-config') && <AnalysisConfigStep />}
            {sop.isStepActive('run-analysis') && <RunAnalysisStep />}
            {sop.isStepActive('results') && <ResultsStep />}
          </>
        )}
      </div>
    </div>
  )
}

// Individual step components for use in MDX
export function ProjectSetupStepWrapper() {
  return <ProjectSetupStep />
}

export function DataUploadStepWrapper() {
  return <DataUploadStep />
}

export function AnalysisConfigStepWrapper() {
  return <AnalysisConfigStep />
}

export function RunAnalysisStepWrapper() {
  return <RunAnalysisStep />
}

export function ResultsStepWrapper() {
  return <ResultsStep />
}

export function ProgressTrackerWrapper() {
  return <SOPProgressTracker />
}
