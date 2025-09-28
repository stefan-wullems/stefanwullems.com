// Pure domain functions for Ahrefs page data operations

export interface AhrefsPageData {
  url: string
  pageTitle: string
  referringDomains: number
  organicTraffic: number
  publishDate?: string
}

export interface AhrefsRawRow {
  URL: string
  Title: string
  'Referring domains': number
  Traffic: number
}

// Pure data transformation functions
export const createPageData = (
  url: string,
  pageTitle: string,
  referringDomains: number,
  organicTraffic: number,
  publishDate?: string,
): AhrefsPageData => ({
  url,
  pageTitle,
  referringDomains,
  organicTraffic,
  publishDate,
})

export const withPublishDate = (
  page: AhrefsPageData,
  publishDate: string,
): AhrefsPageData => ({
  ...page,
  publishDate,
})

export const fromRawRow = (row: Record<string, any>): AhrefsPageData => {
  const url = row['URL'] || row['url'] || ''
  const pageTitle = row['Title'] || row['pageTitle'] || row['title'] || ''
  const referringDomainsStr =
    row['Referring domains'] || row['referringDomains'] || '0'
  const organicTrafficStr =
    row['Traffic'] || row['organicTraffic'] || row['traffic'] || '0'

  const referringDomains =
    referringDomainsStr === '' ? 0 : parseInt(referringDomainsStr) || 0
  const organicTraffic =
    organicTrafficStr === '' ? 0 : parseInt(organicTrafficStr) || 0

  const publishDate = row['publishDate'] || row['publish_date'] || undefined

  return createPageData(
    url,
    pageTitle,
    referringDomains,
    organicTraffic,
    publishDate,
  )
}

export const fromRawRows = (rows: Record<string, any>[]): AhrefsPageData[] =>
  rows.map(fromRawRow)

// Higher-order functions for data operations
export const enrichPages = <T>(
  pages: AhrefsPageData[],
  enrichFn: (page: AhrefsPageData) => T,
): T[] => pages.map(enrichFn)

export const filterPagesWithDates = (
  pages: AhrefsPageData[],
): AhrefsPageData[] => pages.filter((page) => page.publishDate)

export const sortByDate = (pages: AhrefsPageData[]): AhrefsPageData[] =>
  [...pages].sort((a, b) => {
    if (!a.publishDate || !b.publishDate) return 0
    return a.publishDate.localeCompare(b.publishDate)
  })

export const groupByDate = (
  pages: AhrefsPageData[],
): Record<string, AhrefsPageData[]> =>
  pages.reduce(
    (groups, page) => {
      if (!page.publishDate) return groups
      const date = page.publishDate
      return {
        ...groups,
        [date]: [...(groups[date] || []), page],
      }
    },
    {} as Record<string, AhrefsPageData[]>,
  )

// Utility functions for data extraction
export const extractMetric = <K extends keyof AhrefsPageData>(
  pages: AhrefsPageData[],
  metric: K,
): AhrefsPageData[K][] => pages.map((page) => page[metric])

export const extractReferringDomains = (pages: AhrefsPageData[]): number[] =>
  extractMetric(pages, 'referringDomains')

export const extractOrganicTraffic = (pages: AhrefsPageData[]): number[] =>
  extractMetric(pages, 'organicTraffic')

export const calculateReferringDomainsPerVisit = (
  page: AhrefsPageData,
): number => {
  if (
    !page.organicTraffic ||
    page.organicTraffic === 0 ||
    !page.referringDomains
  ) {
    return 0.0
  }
  return page.referringDomains / page.organicTraffic
}

export const calculateReferringDomainsPerVisitForPages = (
  pages: AhrefsPageData[],
): number[] => pages.map(calculateReferringDomainsPerVisit)
