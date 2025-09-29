'use client'

import { useState, useRef, DragEvent } from 'react'
import { SOPStepContent, SOPStepActions } from '../ui/SOPStep'
import { AhrefsPageData, parseCsvContent } from '@/lib/sop/ahrefs-page'

export interface DataUploadFormProps {
  onComplete: (pages: AhrefsPageData[]) => void
  isLoading?: boolean
}

export function DataUploadForm({
  onComplete,
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
      onComplete(pages)
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

  const clearFile = () => {
    setUploadedFile(null)
    setPreviewData([])
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-4 text-zinc-700 dark:text-zinc-300">
          Select your Ahrefs CSV file to upload.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragOver
            ? 'border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20'
            : uploadedFile
              ? 'border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20'
              : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500'
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
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-amber-600 dark:border-amber-400"></div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Processing CSV file...
            </p>
          </div>
        ) : uploadedFile ? (
          <div className="space-y-2">
            <svg
              className="mx-auto h-8 w-8 text-amber-600 dark:text-amber-400"
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
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <strong>{uploadedFile.name}</strong> (
              {(uploadedFile.size / 1024).toFixed(1)} KB)
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Found{' '}
              {previewData.length > 0
                ? `${previewData.length}+ pages`
                : 'valid data'}
            </p>
            <button
              onClick={clearFile}
              className="text-sm text-red-600 underline hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-8 w-8 text-zinc-400 dark:text-zinc-500"
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
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Drop your CSV file here, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-amber-600 underline hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
              >
                browse to upload
              </button>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              CSV files up to 10MB
            </p>
          </div>
        )}
      </div>

      {previewData.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Data Preview
          </h4>
          <div className="overflow-x-auto rounded-md border bg-white dark:border-zinc-600 dark:bg-zinc-800">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                    Referring Domains
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                    Traffic
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-800">
                {previewData.map((page, index) => (
                  <tr key={index}>
                    <td className="max-w-xs truncate px-6 py-4 text-xs text-zinc-900 dark:text-zinc-100">
                      {page.url}
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-xs text-zinc-900 dark:text-zinc-100">
                      {page.pageTitle}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-900 dark:text-zinc-100">
                      {page.referringDomains}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-900 dark:text-zinc-100">
                      {page.organicTraffic}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Showing first {Math.min(5, previewData.length)} of{' '}
            {previewData.length} rows
          </p>
        </div>
      )}
    </div>
  )
}
