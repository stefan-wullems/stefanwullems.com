'use client';

import { useState } from 'react';
import { SOPStepContent, SOPStepActions } from './SOPStep';
import { AnalysisStrategy } from '@/lib/sop/time-based-analysis';

export interface AnalysisConfig {
  strategy: AnalysisStrategy;
  includePublishedDates: boolean;
  publishedDateDelay: number;
}

export interface AnalysisConfigFormProps {
  onComplete: (config: AnalysisConfig) => void;
  initialConfig?: AnalysisConfig;
  isLoading?: boolean;
  pageCount: number;
}

export function AnalysisConfigForm({
  onComplete,
  initialConfig,
  isLoading = false,
  pageCount,
}: AnalysisConfigFormProps) {
  const [strategy, setStrategy] = useState<AnalysisStrategy>(
    initialConfig?.strategy || 'median'
  );
  const [includePublishedDates, setIncludePublishedDates] = useState(
    initialConfig?.includePublishedDates ?? true
  );
  const [publishedDateDelay, setPublishedDateDelay] = useState(
    initialConfig?.publishedDateDelay || 500
  );

  const estimateTime = (): string => {
    if (!includePublishedDates) return 'Less than 1 minute';

    const totalTimeMs = pageCount * publishedDateDelay;
    const minutes = Math.ceil(totalTimeMs / 1000 / 60);

    if (minutes < 1) return 'Less than 1 minute';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: AnalysisConfig = {
      strategy,
      includePublishedDates,
      publishedDateDelay,
    };

    onComplete(config);
  };

  return (
    <SOPStepContent>
      <div className="space-y-6">
        <div>
          <p className="text-gray-700 mb-4">
            Configure how the analysis will be performed. These settings will affect the accuracy
            and processing time of your content audit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Time-Based Analysis Strategy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Time-Based Analysis Strategy
            </label>
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  id="strategy-median"
                  name="strategy"
                  type="radio"
                  value="median"
                  checked={strategy === 'median'}
                  onChange={(e) => setStrategy(e.target.value as AnalysisStrategy)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                  disabled={isLoading}
                />
                <div className="ml-3">
                  <label htmlFor="strategy-median" className="text-sm font-medium text-gray-700">
                    Median (Recommended)
                  </label>
                  <p className="text-sm text-gray-500">
                    Use median for websites with high variance in backlinks per page.
                    More robust against outliers and extreme values.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  id="strategy-average"
                  name="strategy"
                  type="radio"
                  value="average"
                  checked={strategy === 'average'}
                  onChange={(e) => setStrategy(e.target.value as AnalysisStrategy)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                  disabled={isLoading}
                />
                <div className="ml-3">
                  <label htmlFor="strategy-average" className="text-sm font-medium text-gray-700">
                    Average
                  </label>
                  <p className="text-sm text-gray-500">
                    Use average for smaller sites with consistent backlink patterns.
                    Provides more accurate time-based analysis for uniform data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Published Dates Configuration */}
          <div>
            <div className="flex items-center mb-3">
              <input
                id="include-published-dates"
                type="checkbox"
                checked={includePublishedDates}
                onChange={(e) => setIncludePublishedDates(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isLoading}
              />
              <label htmlFor="include-published-dates" className="ml-2 text-sm font-medium text-gray-700">
                Fetch Published Dates
              </label>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Enable this to fetch published dates for time-based analysis. This requires scraping each page
              and will significantly increase processing time.
            </p>

            {includePublishedDates && (
              <div className="ml-6 space-y-4">
                <div>
                  <label htmlFor="delay" className="block text-sm font-medium text-gray-700 mb-2">
                    Delay Between Requests (ms)
                  </label>
                  <select
                    id="delay"
                    value={publishedDateDelay}
                    onChange={(e) => setPublishedDateDelay(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  >
                    <option value={250}>250ms (Fast, may be blocked)</option>
                    <option value={500}>500ms (Recommended)</option>
                    <option value={1000}>1000ms (Conservative)</option>
                    <option value={2000}>2000ms (Very Conservative)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Higher delays are more respectful to servers but increase processing time
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-blue-800">
                        <strong>Estimated Processing Time:</strong> {estimateTime()}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Processing {pageCount} pages with {publishedDateDelay}ms delay
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Analysis Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• <strong>Strategy:</strong> {strategy === 'median' ? 'Median (robust against outliers)' : 'Average (more sensitive to data)'}</p>
              <p>• <strong>Published Dates:</strong> {includePublishedDates ? `Enabled (${publishedDateDelay}ms delay)` : 'Disabled'}</p>
              <p>• <strong>Processing Time:</strong> {estimateTime()}</p>
              <p>• <strong>Pages to Process:</strong> {pageCount}</p>
            </div>
          </div>

          <SOPStepActions>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {isLoading ? 'Configuring...' : 'Start Analysis'}
            </button>
          </SOPStepActions>
        </form>
      </div>
    </SOPStepContent>
  );
}
