// Pure domain functions for time-based analysis

import { AhrefsPageData } from './ahrefs-page'

export interface TimeBasedAnalysisItem {
  url: string
  title: string
  referringDomains: number
  timeBasedIndex: number
  publishDate: string
}

export type AnalysisStrategy = 'median' | 'average'

// Pure mathematical functions
export const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0

  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  } else {
    return sorted[middle]
  }
}

export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0
  const sum = values.reduce((acc, val) => acc + val, 0)
  return sum / values.length
}

// Strategy-based aggregate calculation
export const calculateAggregate = (
  values: number[],
  strategy: AnalysisStrategy,
): number => {
  switch (strategy) {
    case 'median':
      return calculateMedian(values)
    case 'average':
      return calculateAverage(values)
    default:
      return calculateMedian(values)
  }
}

// Time-based index calculation
export const calculateTimeBasedIndex = (
  referringDomains: number,
  priorAggregate: number,
): number => {
  if (!priorAggregate || priorAggregate === 0) {
    return referringDomains
  }
  return referringDomains / priorAggregate
}

// Prior aggregates calculation
export const calculatePriorAggregates = (
  pages: AhrefsPageData[],
  strategy: AnalysisStrategy,
): Record<string, number> => {
  const priorAggregateDict: Record<string, number> = {}
  const priorValues: number[] = []

  // Get unique dates in chronological order
  const uniqueDates = Array.from(
    new Set(pages.map(p => p.publishDate!)),
  ).sort()

  for (const dateValue of uniqueDates) {
    if (priorValues.length > 0) {
      priorAggregateDict[dateValue] = calculateAggregate(priorValues, strategy)
    } else {
      // No prior data for first date
      priorAggregateDict[dateValue] = 0
    }

    // Add all referring domains values for this date to prior values
    const referringDomainsForDate = pages
      .filter(p => p.publishDate === dateValue)
      .map(p => p.referringDomains)

    priorValues.push(...referringDomainsForDate)
  }

  return priorAggregateDict
}

// Pure data transformation functions
export const createAnalysisItem = (
  page: AhrefsPageData,
  timeBasedIndex: number,
): TimeBasedAnalysisItem => ({
  url: page.url,
  title: page.pageTitle,
  referringDomains: page.referringDomains,
  timeBasedIndex,
  publishDate: page.publishDate!,
})

// Higher-order analysis functions
export const analyzePages = (
  pages: AhrefsPageData[],
  strategy: AnalysisStrategy = 'median',
): TimeBasedAnalysisItem[] => {
  if (pages.length === 0) return []

  // Filter and sort pages with dates
  const pagesWithDates = pages
    .filter(page => page.publishDate)
    .sort((a, b) => a.publishDate!.localeCompare(b.publishDate!))

  if (pagesWithDates.length === 0) return []

  // Calculate prior aggregates
  const priorAggregateDict = calculatePriorAggregates(pagesWithDates, strategy)

  // Transform to analysis items
  return pagesWithDates.map(page => {
    const priorAggregate = priorAggregateDict[page.publishDate!]
    const timeBasedIndex = calculateTimeBasedIndex(page.referringDomains, priorAggregate)
    return createAnalysisItem(page, timeBasedIndex)
  })
}

// Filtering functions
export const filterOutperformers = (
  items: TimeBasedAnalysisItem[],
  threshold: number = 1.0,
): TimeBasedAnalysisItem[] =>
  items.filter(item => item.timeBasedIndex > threshold)

export const filterUnderperformers = (
  items: TimeBasedAnalysisItem[],
  threshold: number = 1.0,
): TimeBasedAnalysisItem[] =>
  items.filter(item => item.timeBasedIndex < threshold)

export const filterByDateRange = (
  items: TimeBasedAnalysisItem[],
  startDate: string,
  endDate: string,
): TimeBasedAnalysisItem[] =>
  items.filter(item =>
    item.publishDate >= startDate && item.publishDate <= endDate
  )

// Performance statistics calculation
export const calculatePerformanceStats = (items: TimeBasedAnalysisItem[]) => {
  if (items.length === 0) {
    return {
      totalPages: 0,
      outperformers: 0,
      underperformers: 0,
      averageIndex: 0,
      medianIndex: 0,
    }
  }

  const indices = items.map(item => item.timeBasedIndex)
  const outperformers = indices.filter(index => index > 1.0).length
  const underperformers = indices.filter(index => index < 1.0).length

  const averageIndex = calculateAverage(indices)
  const medianIndex = calculateMedian(indices)

  return {
    totalPages: items.length,
    outperformers,
    underperformers,
    averageIndex,
    medianIndex,
  }
}

// CSV export function
export const toCsvContent = (items: TimeBasedAnalysisItem[]): string => {
  if (items.length === 0) return ''

  const headers = [
    'URL',
    'Title',
    'Referring Domains',
    'Time-Based Index',
    'Publish Date',
  ]

  const rows = items.map(item => [
    item.url,
    item.title,
    item.referringDomains.toString(),
    item.timeBasedIndex.toFixed(4),
    item.publishDate,
  ])

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
}

// Complete analysis pipeline
export const createTimeBasedAnalysis = (
  pages: AhrefsPageData[],
  strategy: AnalysisStrategy = 'median',
): TimeBasedAnalysisItem[] =>
  analyzePages(pages, strategy)
