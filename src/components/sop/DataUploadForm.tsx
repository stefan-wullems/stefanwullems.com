'use client'

import { useState, useRef, DragEvent } from 'react'
import { SOPStepContent, SOPStepActions } from './SOPStep'
import { AhrefsPageData, parseCsvContent } from '@/lib/sop/ahrefs-page'

export interface DataUploadFormProps {
  onComplete: (pages: AhrefsPageData[]) => void
  projectName: string
  isLoading?: boolean
}

export function DataUploadForm({
  onComplete,
  projectName,
  isLoading = false,
}: DataUploadFormProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<AhrefsPageData[]>([])
  const [error, setError] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateCsvFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return 'Please upload a CSV file'
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      return 'File size must be less than 10MB'
    }

    return null
  }

  const processCsvFile = async (file: File) => {
    setIsProcessing(true)
    setError('')

    try {
      const content = await file.text()
      const pages = parseCsvContent(content)

      if (pages.length === 0) {
        throw new Error('No valid data rows found in CSV file')
      }

      // Validate required columns by checking first page
      const firstPage = pages[0]
      if (!firstPage.url || !firstPage.pageTitle) {
        throw new Error('CSV must contain URL and Title columns')
      }

      setPreviewData(pages.slice(0, 5)) // Show first 5 rows as preview
      setUploadedFile(file)
      setError('')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to process CSV file',
      )
      setPreviewData([])
      setUploadedFile(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    const validationError = validateCsvFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    await processCsvFile(file)
  }

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFileSelect(file)
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (file) {
      await handleFileSelect(file)
    }
  }

  const handleSubmit = async () => {
    if (!uploadedFile) {
      setError('Please upload a CSV file first')
      return
    }

    setIsProcessing(true)
    try {
      const content = await uploadedFile.text()
      const pages = parseCsvContent(content)
      onComplete(pages)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to process CSV file',
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const clearFile = () => {
    setUploadedFile(null)
    setPreviewData([])
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <SOPStepContent>
      <div className="space-y-6">
        <div>
          <p className="mb-4 text-gray-700">
            Upload your Ahrefs CSV export to begin the analysis. Make sure
            you've exported the data with "SERP titles" enabled.
          </p>

          <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-4">
            <h4 className="mb-2 text-sm font-medium text-yellow-800">
              Export Instructions
            </h4>
            <ol className="space-y-1 text-sm text-yellow-700">
              <li>1. Go to Ahrefs Site Explorer → Top Pages</li>
              <li>2. Set date range to "Don't compare"</li>
              <li>3. Turn on "SERP titles"</li>
              <li>4. Export all rows as CSV with UTF-8 encoding</li>
              <li>5. Upload the CSV file below</li>
            </ol>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div
          className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : uploadedFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isProcessing || isLoading}
          />

          {isProcessing ? (
            <div className="space-y-2">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Processing CSV file...</p>
            </div>
          ) : uploadedFile ? (
            <div className="space-y-2">
              <svg
                className="mx-auto h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-gray-600">
                <strong>{uploadedFile.name}</strong> (
                {(uploadedFile.size / 1024).toFixed(1)} KB)
              </p>
              <p className="text-xs text-green-600">
                Found{' '}
                {previewData.length > 0
                  ? `${previewData.length}+ pages`
                  : 'valid data'}
              </p>
              <button
                onClick={clearFile}
                className="text-sm text-red-600 underline hover:text-red-700"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <svg
                className="mx-auto h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-600">
                Drop your CSV file here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 underline hover:text-blue-700"
                >
                  browse to upload
                </button>
              </p>
              <p className="text-xs text-gray-500">CSV files up to 10MB</p>
            </div>
          )}
        </div>

        {previewData.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-800">
              Data Preview
            </h4>
            <div className="overflow-x-auto rounded-md border bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Referring Domains
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Traffic
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {previewData.map((page, index) => (
                    <tr key={index}>
                      <td className="max-w-xs truncate px-6 py-4 text-xs text-gray-900">
                        {page.url}
                      </td>
                      <td className="max-w-xs truncate px-6 py-4 text-xs text-gray-900">
                        {page.pageTitle}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900">
                        {page.referringDomains}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900">
                        {page.organicTraffic}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Showing first {Math.min(5, previewData.length)} of{' '}
              {previewData.length} rows
            </p>
          </div>
        )}

        <SOPStepActions>
          <button
            onClick={handleSubmit}
            disabled={!uploadedFile || isProcessing || isLoading}
            className={`rounded-md px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none ${
              !uploadedFile || isProcessing || isLoading
                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Continue with Data'}
          </button>
        </SOPStepActions>
      </div>
    </SOPStepContent>
  )
}
