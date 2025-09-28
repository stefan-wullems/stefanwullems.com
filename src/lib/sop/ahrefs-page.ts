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

export class AhrefsPage {
  constructor(
    public url: string,
    public pageTitle: string,
    public referringDomains: number,
    public organicTraffic: number,
    public publishDate?: string,
  ) {}

  static fromCsvRow(row: Record<string, any>): AhrefsPage {
    const url = row['URL'] || row['url'] || ''
    const pageTitle = row['Title'] || row['pageTitle'] || row['title'] || ''
    const referringDomainsStr =
      row['Referring domains'] || row['referringDomains'] || '0'
    const organicTrafficStr =
      row['Traffic'] || row['organicTraffic'] || row['traffic'] || '0'

    // Handle empty strings and non-numeric values
    const referringDomains =
      referringDomainsStr === '' ? 0 : parseInt(referringDomainsStr) || 0
    const organicTraffic =
      organicTrafficStr === '' ? 0 : parseInt(organicTrafficStr) || 0

    const publishDate = row['publishDate'] || row['publish_date'] || undefined

    return new AhrefsPage(
      url,
      pageTitle,
      referringDomains,
      organicTraffic,
      publishDate,
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

export function parseCsvContent(csvContent: string): AhrefsPage[] {
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

  return AhrefsPage.fromCsvData(rows)
}

export async function enrichWithPublishedDates(
  pages: AhrefsPage[],
  cache?: Map<string, string>,
  delay: number = 500,
): Promise<AhrefsPage[]> {
  const enrichedPages: AhrefsPage[] = []
  const cacheMap = cache || new Map<string, string>()

  for (const page of pages) {
    // Check cache first
    if (cacheMap.has(page.url)) {
      const cachedDate = cacheMap.get(page.url)
      enrichedPages.push(page.withPublishDate(cachedDate || ''))
      continue
    }

    // Simulate finding published date (in real implementation, would scrape the page)
    try {
      const publishDate = await findPublishedDate(page.url)
      cacheMap.set(page.url, publishDate)
      enrichedPages.push(page.withPublishDate(publishDate))

      // Add delay to be respectful
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    } catch (error) {
      console.warn(`Failed to find published date for ${page.url}:`, error)
      enrichedPages.push(page)
    }
  }

  return enrichedPages
}

async function findPublishedDate(url: string): Promise<string> {
  // This is a simplified implementation
  // In a real scenario, you would scrape the page for meta tags, JSON-LD, etc.

  // For now, return a mock date based on URL (for demo purposes)
  // In production, implement actual web scraping logic
  const mockDate = new Date()
  mockDate.setDate(mockDate.getDate() - Math.floor(Math.random() * 365))
  return mockDate.toISOString().split('T')[0]
}
