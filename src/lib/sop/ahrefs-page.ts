// Boundary layer for Ahrefs page data - handles parsing, validation, and side effects

import {
  AhrefsPageData,
  AhrefsRawRow,
  fromRawRow,
  fromRawRows,
  withPublishDate,
} from '../domain/ahrefs-page'

// Progress tracking interface for published date enrichment
export interface PublishedDateProgress {
  completed: number
  total: number
  currentUrl: string
  rate: number // URLs per second
  estimatedTimeRemaining: number // seconds
  elapsedTime: number // seconds
}

// Mapping from Ahrefs column names to internal camelCase names
const AHREFS_TO_CAMEL: Record<string, keyof AhrefsPageData> = {
  URL: 'url',
  Title: 'pageTitle',
  'Referring domains': 'referringDomains',
  Traffic: 'organicTraffic',
}

// RFC 4180 compliant CSV parser
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote (double quote)
          current += '"'
          i += 2
          continue
        } else {
          // End of quoted field
          inQuotes = false
        }
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        // Start of quoted field
        inQuotes = true
      } else if (char === ',') {
        // Field separator
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    i++
  }

  // Add the last field
  result.push(current)

  return result.map((field) => field.trim())
}

// Boundary function - parses CSV content and validates structure
export function parseCsvContent(csvContent: string): AhrefsPageData[] {
  // Handle different line endings and filter empty lines
  const lines = csvContent.split(/\r\n|\r|\n/).filter((line) => line.trim())
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header and one data row')
  }

  const headers = parseCsvLine(lines[0])
  const rows: Record<string, any>[] = []

  // Validate that we have the required columns (case-insensitive)
  const requiredColumns = ['URL', 'Title', 'Referring domains', 'Traffic']
  const headerLower = headers.map((h) => h.toLowerCase())
  const missingColumns = requiredColumns.filter(
    (col) => !headerLower.includes(col.toLowerCase()),
  )

  if (missingColumns.length > 0) {
    throw new Error(
      `Missing required columns: ${missingColumns.join(', ')}. Found columns: ${headers.join(', ')}`,
    )
  }

  let validRows = 0
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    try {
      const values = parseCsvLine(line)

      // Create row object
      const row: Record<string, any> = {}
      headers.forEach((header, index) => {
        row[header] = index < values.length ? values[index] : ''
      })

      // Only add rows that have URL and Title (minimum required)
      if (
        row['URL'] &&
        row['URL'].trim() &&
        row['Title'] &&
        row['Title'].trim()
      ) {
        rows.push(row)
        validRows++
      }
    } catch (error) {
      // Skip malformed rows but continue processing
      console.warn(`Skipping malformed row ${i}: ${error}`)
      continue
    }
  }

  if (validRows === 0) {
    throw new Error(
      'No valid data rows found. Please ensure your CSV has URL and Title columns with data.',
    )
  }

  return fromRawRows(rows)
}

// Boundary function - handles side effects and external API calls
export async function enrichWithPublishedDates(
  pages: AhrefsPageData[],
  cache?: Map<string, string>,
  delay: number = 500,
  onProgress?: (progress: PublishedDateProgress) => void,
): Promise<AhrefsPageData[]> {
  const enrichedPages: AhrefsPageData[] = []
  const cacheMap = cache || new Map<string, string>()
  const startTime = Date.now()
  let completed = 0

  // Report initial progress
  if (onProgress) {
    onProgress({
      completed: 0,
      total: pages.length,
      currentUrl: pages[0]?.url || 'Starting...',
      rate: 0,
      estimatedTimeRemaining: 0,
      elapsedTime: 0,
    })
  }

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]

    // Check cache first
    if (cacheMap.has(page.url)) {
      const cachedDate = cacheMap.get(page.url)
      enrichedPages.push(withPublishDate(page, cachedDate || ''))
      completed++

      // Report progress for cached items too
      if (onProgress) {
        const elapsedTime = (Date.now() - startTime) / 1000
        const rate = completed / Math.max(elapsedTime, 0.1) // Avoid very small divisors
        const remaining = pages.length - completed
        const estimatedTimeRemaining = remaining > 0 ? remaining / rate : 0

        onProgress({
          completed,
          total: pages.length,
          currentUrl: page.url,
          rate,
          estimatedTimeRemaining,
          elapsedTime,
        })
      }
      continue
    }

    // Simulate finding published date (in real implementation, would scrape the page)
    try {
      const publishDate = await findPublishedDate(page.url)
      cacheMap.set(page.url, publishDate)
      enrichedPages.push(withPublishDate(page, publishDate))
    } catch (error) {
      console.warn(`Failed to find published date for ${page.url}:`, error)
      enrichedPages.push(page)
    }

    completed++

    // Report progress after each URL
    if (onProgress) {
      const elapsedTime = (Date.now() - startTime) / 1000 // Convert to seconds
      const rate = completed / Math.max(elapsedTime, 0.1) // Avoid very small divisors
      const remaining = pages.length - completed
      const estimatedTimeRemaining = remaining > 0 ? remaining / rate : 0

      onProgress({
        completed,
        total: pages.length,
        currentUrl: page.url,
        rate,
        estimatedTimeRemaining,
        elapsedTime,
      })
    }

    // Add delay between requests (but not after the last one)
    if (delay > 0 && i < pages.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // Final progress report
  if (onProgress) {
    const elapsedTime = (Date.now() - startTime) / 1000
    const rate = completed / Math.max(elapsedTime, 0.1)

    onProgress({
      completed: pages.length,
      total: pages.length,
      currentUrl: 'Completed',
      rate,
      estimatedTimeRemaining: 0,
      elapsedTime,
    })
  }

  return enrichedPages
}

// Side effect - external API call simulation
async function findPublishedDate(url: string): Promise<string> {
  // This is a simplified implementation
  // In a real scenario, you would scrape the page for meta tags, JSON-LD, etc.

  // For now, return a mock date based on URL (for demo purposes)
  // In production, implement actual web scraping logic
  const mockDate = new Date()
  mockDate.setDate(mockDate.getDate() - Math.floor(Math.random() * 365))
  return mockDate.toISOString().split('T')[0]
}

// Re-export domain types and interfaces
export type { AhrefsPageData, AhrefsRawRow }

// Legacy class wrapper for backward compatibility (to be removed)
export class AhrefsPage {
  constructor(
    public url: string,
    public pageTitle: string,
    public referringDomains: number,
    public organicTraffic: number,
    public publishDate?: string,
  ) {}

  static fromCsvRow(row: Record<string, any>): AhrefsPage {
    const data = fromRawRow(row)
    return new AhrefsPage(
      data.url,
      data.pageTitle,
      data.referringDomains,
      data.organicTraffic,
      data.publishDate,
    )
  }

  static fromCsvData(csvData: Record<string, any>[]): AhrefsPage[] {
    return csvData.map((row) => AhrefsPage.fromCsvRow(row))
  }

  toData(): AhrefsPageData {
    return {
      url: this.url,
      pageTitle: this.pageTitle,
      referringDomains: this.referringDomains,
      organicTraffic: this.organicTraffic,
      publishDate: this.publishDate,
    }
  }

  withPublishDate(publishDate: string): AhrefsPage {
    return new AhrefsPage(
      this.url,
      this.pageTitle,
      this.referringDomains,
      this.organicTraffic,
      publishDate,
    )
  }
}
