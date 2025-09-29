'use client'

import { useMemo } from 'react'

export interface SOPStep {
  id: string
  title: string
  isCompleted: boolean
  isActive: boolean
  hasError: boolean
}

export interface ProgressTrackerProps {
  steps: SOPStep[]
  currentStepId: string
  className?: string
}

export function ProgressTracker({
  steps,
  currentStepId,
  className = '',
}: ProgressTrackerProps) {
  const progressStats = useMemo(() => {
    const completed = steps.filter((step) => step.isCompleted).length
    const total = steps.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    const hasErrors = steps.some((step) => step.hasError)

    return {
      completed,
      total,
      percentage,
      hasErrors,
    }
  }, [steps])

  const getStepStatus = (step: SOPStep, index: number) => {
    if (step.hasError) {
      return {
        icon: (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ),
        bgColor: 'bg-red-500 dark:bg-red-600',
        textColor: 'text-red-500 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-800',
      }
    }

    if (step.isCompleted) {
      return {
        icon: (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ),
        bgColor: 'bg-amber-500 dark:bg-amber-600',
        textColor: 'text-amber-600 dark:text-amber-400',
        borderColor: 'border-amber-200 dark:border-amber-800',
      }
    }

    if (step.isActive || step.id === currentStepId) {
      return {
        icon: (
          <span className="text-sm font-medium text-white">{index + 1}</span>
        ),
        bgColor: 'bg-amber-500 dark:bg-amber-600',
        textColor: 'text-amber-600 dark:text-amber-400',
        borderColor: 'border-amber-200 dark:border-amber-800',
      }
    }

    return {
      icon: (
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {index + 1}
        </span>
      ),
      bgColor: 'bg-zinc-300 dark:bg-zinc-600',
      textColor: 'text-zinc-500 dark:text-zinc-400',
      borderColor: 'border-zinc-200 dark:border-zinc-700',
    }
  }

  return (
    <div
      className={`rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 ${className}`}
    >
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Progress
          </h3>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {progressStats.completed} of {progressStats.total} completed
          </span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              progressStats.hasErrors
                ? 'bg-red-500 dark:bg-red-600'
                : 'bg-amber-500 dark:bg-amber-600'
            }`}
            style={{ width: `${progressStats.percentage}%` }}
          />
        </div>

        <div className="mt-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>0%</span>
          <span className="font-medium">{progressStats.percentage}%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index)
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="relative">
              <div className="flex items-start">
                <div className="relative flex-shrink-0">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${status.bgColor} text-white`}
                  >
                    {status.icon}
                  </div>
                  {!isLast && (
                    <div
                      className={`absolute top-8 left-4 h-6 w-px ${
                        steps[index + 1]?.isCompleted ||
                        steps[index + 1]?.isActive
                          ? 'bg-amber-300 dark:bg-amber-600'
                          : 'bg-zinc-300 dark:bg-zinc-600'
                      }`}
                    />
                  )}
                </div>

                <div className="ml-3 min-w-0 flex-1">
                  <div className="flex items-center">
                    <p
                      className={`text-sm font-medium ${
                        step.id === currentStepId
                          ? 'text-amber-600 dark:text-amber-400'
                          : step.isCompleted
                            ? 'text-amber-600 dark:text-amber-400'
                            : step.hasError
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>

                  {step.hasError && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      Please fix the issues and try again
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {progressStats.hasErrors && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400 dark:text-red-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                Some steps have errors that need to be resolved before
                continuing.
              </p>
            </div>
          </div>
        </div>
      )}

      {progressStats.percentage === 100 && !progressStats.hasErrors && (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex">
            <svg
              className="h-5 w-5 text-amber-400 dark:text-amber-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                🎉 Content audit completed successfully! Your analysis is ready.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function useSOPProgress(steps: SOPStep[]) {
  return useMemo(() => {
    const completed = steps.filter((step) => step.isCompleted).length
    const total = steps.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    const hasErrors = steps.some((step) => step.hasError)
    const isComplete = percentage === 100 && !hasErrors
    const currentStep = steps.find((step) => step.isActive && !step.isCompleted)

    return {
      completed,
      total,
      percentage,
      hasErrors,
      isComplete,
      currentStep,
    }
  }, [steps])
}
