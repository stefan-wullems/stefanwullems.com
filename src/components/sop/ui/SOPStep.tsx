'use client'

import { ReactNode } from 'react'
import { CheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid'

export interface SOPStepProps {
  title: string
  description?: string
  stepNumber: number
  isCompleted?: boolean
  isActive?: boolean
  hasError?: boolean
  errorMessage?: string
  children: ReactNode
  onComplete?: () => void
}

export function SOPStep({
  title,
  description,
  stepNumber,
  isCompleted = false,
  isActive = true,
  hasError = false,
  errorMessage,
  children,
}: SOPStepProps) {
  const stepStatusIcon = () => {
    if (hasError) {
      return (
        <ExclamationCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
      )
    }
    if (isCompleted) {
      return (
        <CheckIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      )
    }
    return (
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-sm font-medium ${
          isActive
            ? 'bg-amber-500 text-white dark:bg-amber-600 dark:text-white'
            : 'bg-zinc-300 text-zinc-500 dark:bg-zinc-600 dark:text-zinc-400'
        }`}
      >
        {stepNumber}
      </span>
    )
  }

  return (
    <div className="mb-8">
      <div className="border-b border-zinc-200 pb-4 dark:border-zinc-700">
        <div className="flex items-center space-x-3">
          {stepStatusIcon()}
          <div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            )}
          </div>
        </div>
        {hasError && errorMessage && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {errorMessage}
          </div>
        )}
      </div>

      <div className="mt-6">{children}</div>
    </div>
  )
}

export function SOPStepContent({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>
}

export function SOPStepActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex space-x-3 border-t border-zinc-200 pt-6 dark:border-zinc-700">
      {children}
    </div>
  )
}
