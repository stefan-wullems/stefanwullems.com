'use client';

import { useState, ReactNode } from 'react';
import { CheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

export interface SOPStepProps {
  title: string;
  description?: string;
  stepNumber: number;
  isCompleted?: boolean;
  isActive?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  children: ReactNode;
  onComplete?: () => void;
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
  onComplete,
}: SOPStepProps) {
  const [isExpanded, setIsExpanded] = useState(isActive);

  const handleToggle = () => {
    if (!isActive && !isCompleted) return;
    setIsExpanded(!isExpanded);
  };

  const stepStatusIcon = () => {
    if (hasError) {
      return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
    }
    if (isCompleted) {
      return <CheckIcon className="h-5 w-5 text-green-500" />;
    }
    return (
      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-sm font-medium ${
        isActive ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'
      }`}>
        {stepNumber}
      </span>
    );
  };

  const stepStatusColor = () => {
    if (hasError) return 'border-red-200 bg-red-50';
    if (isCompleted) return 'border-green-200 bg-green-50';
    if (isActive) return 'border-blue-200 bg-blue-50';
    return 'border-gray-200 bg-gray-50';
  };

  return (
    <div className={`border rounded-lg ${stepStatusColor()} mb-4`}>
      <div
        className={`p-4 cursor-pointer ${isActive || isCompleted ? 'hover:bg-opacity-80' : 'cursor-not-allowed opacity-60'}`}
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {stepStatusIcon()}
            <div>
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isCompleted && (
              <span className="text-sm text-green-600 font-medium">Completed</span>
            )}
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {hasError && errorMessage && (
          <div className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded">
            {errorMessage}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="border-t pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function SOPStepContent({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

export function SOPStepActions({ children }: { children: ReactNode }) {
  return <div className="flex space-x-2 pt-4 border-t">{children}</div>;
}
