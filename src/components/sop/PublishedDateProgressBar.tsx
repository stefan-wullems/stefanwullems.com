'use client'

import { PublishedDateProgress } from '@/lib/sop/ahrefs-page'

interface PublishedDateProgressBarProps {
  progress: PublishedDateProgress
}

export function PublishedDateProgressBar({
  progress,
}: PublishedDateProgressBarProps) {
  const {
    completed,
    total,
    currentUrl,
    rate,
    estimatedTimeRemaining,
    elapsedTime,
  } = progress

  const progressPercentage = (completed / total) * 100

  // Format time in a human-readable way
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.round(seconds % 60)
      return `${minutes}m ${remainingSeconds}s`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}h ${minutes}m`
    }
  }

  // Format rate
  const formatRate = (rate: number): string => {
    if (rate >= 1) {
      return `${rate.toFixed(1)} URLs/sec`
    } else {
      const urlsPerMinute = rate * 60
      return `${urlsPerMinute.toFixed(1)} URLs/min`
    }
  }

  // Truncate URL for display
  const truncateUrl = (url: string, maxLength: number = 50): string => {
    if (url.length <= maxLength) return url
    return `${url.substring(0, maxLength - 3)}...`
  }

  const isCompleted = completed >= total

  return (
    <div
      className={`space-y-4 rounded-lg border p-4 ${
        isCompleted
          ? 'border-green-200 bg-green-50'
          : 'border-blue-200 bg-blue-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <h4
          className={`text-sm font-medium ${
            isCompleted ? 'text-green-800' : 'text-blue-800'
          }`}
        >
          {isCompleted ? 'Published Dates Fetched' : 'Fetching Published Dates'}
        </h4>
        <span
          className={`text-sm font-medium ${
            isCompleted ? 'text-green-700' : 'text-blue-700'
          }`}
        >
          {completed} / {total}
        </span>
      </div>

      {/* Progress Bar */}
      <div
        className={`h-3 w-full overflow-hidden rounded-full ${
          isCompleted ? 'bg-green-200' : 'bg-blue-200'
        }`}
      >
        <div
          className={`h-3 rounded-full transition-all duration-300 ease-out ${
            isCompleted ? 'bg-green-600' : 'bg-blue-600'
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Progress Statistics */}
      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
        <div className="space-y-1">
          <div
            className={`font-medium ${
              isCompleted ? 'text-green-600' : 'text-blue-600'
            }`}
          >
            Progress
          </div>
          <div
            className={`${isCompleted ? 'text-green-800' : 'text-blue-800'}`}
          >
            {progressPercentage.toFixed(1)}% complete
          </div>
        </div>

        <div className="space-y-1">
          <div
            className={`font-medium ${
              isCompleted ? 'text-green-600' : 'text-blue-600'
            }`}
          >
            Rate
          </div>
          <div
            className={`${isCompleted ? 'text-green-800' : 'text-blue-800'}`}
          >
            {formatRate(rate)}
          </div>
        </div>

        <div className="space-y-1">
          <div
            className={`font-medium ${
              isCompleted ? 'text-green-600' : 'text-blue-600'
            }`}
          >
            {isCompleted ? 'Total Time' : 'Time Remaining'}
          </div>
          <div
            className={`${isCompleted ? 'text-green-800' : 'text-blue-800'}`}
          >
            {isCompleted
              ? formatTime(elapsedTime)
              : estimatedTimeRemaining > 0
                ? formatTime(estimatedTimeRemaining)
                : 'Calculating...'}
          </div>
        </div>
      </div>

      {/* Current URL and Elapsed Time */}
      <div
        className={`space-y-2 border-t pt-2 ${
          isCompleted ? 'border-green-200' : 'border-blue-200'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span
            className={`font-medium ${
              isCompleted ? 'text-green-600' : 'text-blue-600'
            }`}
          >
            Elapsed Time:
          </span>
          <span
            className={`${isCompleted ? 'text-green-700' : 'text-blue-700'}`}
          >
            {formatTime(elapsedTime)}
          </span>
        </div>

        {!isCompleted && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-blue-600">
              Currently Processing:
            </div>
            <div
              className="rounded border bg-white/50 px-2 py-1 font-mono text-xs text-blue-700"
              title={currentUrl}
            >
              {truncateUrl(currentUrl)}
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="flex items-center space-x-2">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
              <svg
                className="h-3 w-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-xs font-medium text-green-700">
              All published dates fetched successfully!
            </span>
          </div>
        )}
      </div>

      {/* Helpful Information */}
      {!isCompleted && (
        <div className="rounded bg-white/30 p-2 text-xs text-blue-600">
          <p className="mb-1">
            <strong>Why this takes time:</strong> We add delays between requests
            to be respectful to websites and avoid being blocked.
          </p>
          <p>
            <strong>Tip:</strong> You can reduce the delay in Analysis Config
            for faster processing (but use responsibly).
          </p>
        </div>
      )}
    </div>
  )
}
