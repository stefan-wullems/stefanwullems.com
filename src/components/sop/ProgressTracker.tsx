'use client';

import { useMemo } from 'react';

export interface SOPStep {
  id: string;
  title: string;
  isCompleted: boolean;
  isActive: boolean;
  hasError: boolean;
}

export interface ProgressTrackerProps {
  steps: SOPStep[];
  currentStepId: string;
  className?: string;
}

export function ProgressTracker({
  steps,
  currentStepId,
  className = '',
}: ProgressTrackerProps) {
  const progressStats = useMemo(() => {
    const completed = steps.filter(step => step.isCompleted).length;
    const total = steps.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const hasErrors = steps.some(step => step.hasError);

    return {
      completed,
      total,
      percentage,
      hasErrors,
    };
  }, [steps]);

  const getStepStatus = (step: SOPStep, index: number) => {
    if (step.hasError) {
      return {
        icon: (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ),
        bgColor: 'bg-red-500',
        textColor: 'text-red-500',
        borderColor: 'border-red-200',
      };
    }

    if (step.isCompleted) {
      return {
        icon: (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ),
        bgColor: 'bg-green-500',
        textColor: 'text-green-600',
        borderColor: 'border-green-200',
      };
    }

    if (step.isActive || step.id === currentStepId) {
      return {
        icon: (
          <span className="text-sm font-medium text-white">
            {index + 1}
          </span>
        ),
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-200',
      };
    }

    return {
      icon: (
        <span className="text-sm font-medium text-gray-500">
          {index + 1}
        </span>
      ),
      bgColor: 'bg-gray-300',
      textColor: 'text-gray-500',
      borderColor: 'border-gray-200',
    };
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">Progress</h3>
          <span className="text-sm text-gray-500">
            {progressStats.completed} of {progressStats.total} completed
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              progressStats.hasErrors ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progressStats.percentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span className="font-medium">{progressStats.percentage}%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative">
              <div className="flex items-start">
                <div className="flex-shrink-0 relative">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${status.bgColor} text-white`}
                  >
                    {status.icon}
                  </div>
                  {!isLast && (
                    <div
                      className={`absolute top-8 left-4 w-px h-6 ${
                        steps[index + 1]?.isCompleted || steps[index + 1]?.isActive
                          ? 'bg-blue-300'
                          : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>

                <div className="ml-3 min-w-0 flex-1">
                  <div className="flex items-center">
                    <p
                      className={`text-sm font-medium ${
                        step.id === currentStepId
                          ? 'text-blue-600'
                          : step.isCompleted
                          ? 'text-green-600'
                          : step.hasError
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {step.title}
                    </p>

                    {step.id === currentStepId && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Current
                      </span>
                    )}

                    {step.isCompleted && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    )}

                    {step.hasError && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Error
                      </span>
                    )}
                  </div>

                  {step.hasError && (
                    <p className="text-xs text-red-600 mt-1">
                      Please fix the issues and try again
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {progressStats.hasErrors && (
        <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800">
                Some steps have errors that need to be resolved before continuing.
              </p>
            </div>
          </div>
        </div>
      )}

      {progressStats.percentage === 100 && !progressStats.hasErrors && (
        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-green-800">
                🎉 Content audit completed successfully! Your analysis is ready.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function useSOPProgress(steps: SOPStep[]) {
  return useMemo(() => {
    const completed = steps.filter(step => step.isCompleted).length;
    const total = steps.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const hasErrors = steps.some(step => step.hasError);
    const isComplete = percentage === 100 && !hasErrors;
    const currentStep = steps.find(step => step.isActive && !step.isCompleted);

    return {
      completed,
      total,
      percentage,
      hasErrors,
      isComplete,
      currentStep,
    };
  }, [steps]);
}
