'use client'

import { useContentInventorySOPContext } from './context'
import {
  SOPStep,
  SOPStepActions,
  SOPStepContent,
} from '@/components/sop/ui/SOPStep'
import { DataUploadForm } from '@/components/sop'
import { ContentInventoryVisualization } from '@/components/sop/analyses/content-inventory'

export function UploadAhrefsPageData() {
  const sop = useContentInventorySOPContext()
  return (
    <SOPStep
      isCompleted={sop.isStepCompleted('data-upload')}
      isActive={sop.isStepActive('data-upload')}
      hasError={sop.hasStepError('data-upload')}
      errorMessage={sop.getStepError('data-upload')}
      title={'Data Upload'}
      description={'Upload your Ahrefs CSV export'}
      stepNumber={1}
    >
      <SOPStepContent>
        <DataUploadForm
          onComplete={sop.handleDataUpload}
          isLoading={sop.isStepLoading('data-upload')}
        />
      </SOPStepContent>
    </SOPStep>
  )
}

export function ContentInventoryAnalysisStep() {
  const sop = useContentInventorySOPContext()

  return (
    <SOPStep
      title="Content Inventory Analysis"
      description="Generate quartile rankings and composite performance scores for your content"
      stepNumber={2}
      isCompleted={sop.isStepCompleted('analysis')}
      isActive={sop.isStepActive('analysis')}
      hasError={sop.hasStepError('analysis')}
      errorMessage={sop.getStepError('analysis')}
    >
      <SOPStepContent>
        {!sop.isStepCompleted('analysis') && (
          <button
            onClick={() => sop.handleRunAnalysis()}
            disabled={!sop.isStepActive('analysis')}
            className="not:disabled:hover:bg-zinc-50 not:disabled:dark:hover:bg-zinc-700 w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            Run Analysis
          </button>
        )}
        {sop.isStepCompleted('analysis') && sop.state.uploadedPages && (
          <ContentInventoryVisualization
            data={sop.state.uploadedPages}
            error={sop.getStepError('analysis')}
          />
        )}
      </SOPStepContent>
    </SOPStep>
  )
}
