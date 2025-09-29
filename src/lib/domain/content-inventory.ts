// Pure domain functions for content inventory analysis

import { AhrefsPageData } from './ahrefs-page'

export interface ContentInventoryItem {
  url: string
  publishDate?: string
  pageTitle: string
  compositeScore: number
  referringDomains: number
  rdQuartile: number
  referringDomainsPerVisit: number
  rdPerVisitQuartile: number
  organicTraffic: number
  trafficQuartile: number
}

// Pure mathematical functions
export const calculateQuartiles = (
  values: number[],
): [number, number, number] => {
  if (values.length === 0) return [0, 0, 0]

  // Filter out zeros for better quartile distribution
  const nonZeroValues = values.filter((v) => v > 0)

  if (nonZeroValues.length === 0) return [0, 0, 0]

  const sorted = nonZeroValues.sort((a, b) => a - b)
  const q1Index = Math.floor(sorted.length * 0.25)
  const q2Index = Math.floor(sorted.length * 0.5)
  const q3Index = Math.floor(sorted.length * 0.75)

  return [sorted[q1Index], sorted[q2Index], sorted[q3Index]]
}

export const getQuartile = (
  value: number,
  quartiles: [number, number, number],
): number => {
  const [q1, q2, q3] = quartiles

  if (value === 0) return 1
  if (value <= q1) return 2
  if (value <= q2) return 3
  if (value <= q3) return 4
  return 4
}

export const getTrafficQuartile = (
  traffic: number,
  quartiles: [number, number, number],
): number => {
  // For traffic quartile, 0 or missing traffic gets quartile 1 (worst performance)
  if (!traffic || traffic === 0) return 1
  return getQuartile(traffic, quartiles)
}

export const getRdPerVisitQuartile = (
  traffic: number,
  referringDomains: number,
  quartiles: [number, number, number],
): number => {
  // Priority 1: if traffic is 0 or missing, force Q1 regardless of RD
  if (!traffic || traffic === 0) return 1

  // Priority 2: if traffic is positive but RD is 0/missing, set to Q4
  if (!referringDomains || referringDomains === 0) return 4

  // Otherwise use normal quartile calculation for RD per visit ratio
  // Higher ratio = better performance = higher quartile number
  const ratio = referringDomains / traffic
  return getQuartile(ratio, quartiles)
}

// Composite score calculation
export const calculateCompositeScore = (
  rdQuartile: number,
  trafficQuartile: number,
  rdWeight: number = 1.0,
  trafficWeight: number = 1.0,
): number => rdQuartile * rdWeight + trafficQuartile * trafficWeight

// Pure data transformation functions
export const createInventoryItem = (
  pageData: AhrefsPageData,
  rdQuartile: number,
  trafficQuartile: number,
  rdPerVisitQuartile: number,
  referringDomainsPerVisit: number,
  compositeScore: number,
): ContentInventoryItem => ({
  url: pageData.url,
  publishDate: pageData.publishDate,
  pageTitle: pageData.pageTitle,
  compositeScore,
  referringDomains: pageData.referringDomains,
  rdQuartile,
  referringDomainsPerVisit,
  rdPerVisitQuartile,
  organicTraffic: pageData.organicTraffic,
  trafficQuartile,
})

// Higher-order functions for analysis
export const analyzePages = (
  pages: AhrefsPageData[],
): ContentInventoryItem[] => {
  if (pages.length === 0) return []

  // Calculate all quartiles
  const rdQuartiles = calculateQuartiles(pages.map((d) => d.referringDomains))
  const trafficQuartiles = calculateQuartiles(
    pages.map((d) => d.organicTraffic),
  )

  const rdPerVisitValues = pages.map((d) => {
    if (!d.organicTraffic || d.organicTraffic === 0 || !d.referringDomains) {
      return 0.0
    }
    return d.referringDomains / d.organicTraffic
  })

  const rdPerVisitQuartiles = calculateQuartiles(rdPerVisitValues)

  // Transform pages to inventory items
  return pages.map((pageData, index) => {
    const rdQuartile = getQuartile(pageData.referringDomains, rdQuartiles)
    const trafficQuartile = getTrafficQuartile(
      pageData.organicTraffic,
      trafficQuartiles,
    )
    const rdPerVisitQuartile = getRdPerVisitQuartile(
      pageData.organicTraffic,
      pageData.referringDomains,
      rdPerVisitQuartiles,
    )
    const compositeScore = calculateCompositeScore(rdQuartile, trafficQuartile)

    return createInventoryItem(
      pageData,
      rdQuartile,
      trafficQuartile,
      rdPerVisitQuartile,
      rdPerVisitValues[index],
      compositeScore,
    )
  })
}

// Sorting and filtering functions
export const sortByCompositeScore = (
  items: ContentInventoryItem[],
): ContentInventoryItem[] =>
  [...items].sort((a, b) => {
    if (b.compositeScore !== a.compositeScore) {
      return b.compositeScore - a.compositeScore
    }
    if (a.publishDate && b.publishDate) {
      return b.publishDate.localeCompare(a.publishDate)
    }
    return 0
  })

export const getTopPerformers = (
  items: ContentInventoryItem[],
  limit: number = 10,
): ContentInventoryItem[] => items.slice(0, limit)

export const filterByQuartile = (
  items: ContentInventoryItem[],
  quartile: number,
): ContentInventoryItem[] =>
  items.filter(
    (item) => item.rdQuartile === quartile || item.trafficQuartile === quartile,
  )

// CSV export function
export const toCsvContent = (items: ContentInventoryItem[]): string => {
  if (items.length === 0) return ''

  const headers = [
    'URL',
    'Publish Date',
    'Page Title',
    'Composite Score',
    'Referring Domains',
    'RD Quartile',
    'Referring Domains per Visit',
    'RD per Visit Quartile',
    'Organic Traffic',
    'Traffic Quartile',
  ]

  const rows = items.map((item) => [
    item.url,
    item.publishDate || '',
    item.pageTitle,
    item.compositeScore.toFixed(1),
    item.referringDomains.toString(),
    item.rdQuartile.toString(),
    item.referringDomainsPerVisit.toFixed(4),
    item.rdPerVisitQuartile.toString(),
    item.organicTraffic.toString(),
    item.trafficQuartile.toString(),
  ])

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n')
}

// Complete analysis pipeline
export const createContentInventory = (
  pages: AhrefsPageData[],
): ContentInventoryItem[] => {
  const items = analyzePages(pages)
  return sortByCompositeScore(items)
}
