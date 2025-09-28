import { AhrefsPage } from './ahrefs-page';

export interface TimeBasedAnalysisItem {
  url: string;
  title: string;
  referringDomains: number;
  timeBasedIndex: number;
  publishDate: string;
}

export type AnalysisStrategy = 'median' | 'average';

export class TimeBasedAnalysis {
  constructor(public items: TimeBasedAnalysisItem[]) {}

  static fromAhrefsPages(pages: AhrefsPage[], strategy: AnalysisStrategy = 'median'): TimeBasedAnalysis {
    if (pages.length === 0) {
      return new TimeBasedAnalysis([]);
    }

    // Filter out pages without publish dates and sort by date
    const pagesWithDates = pages
      .filter(page => page.publishDate)
      .sort((a, b) => a.publishDate!.localeCompare(b.publishDate!));

    if (pagesWithDates.length === 0) {
      return new TimeBasedAnalysis([]);
    }

    // Calculate prior aggregates for each unique publish date
    const priorAggregateDict = calculatePriorAggregates(pagesWithDates, strategy);

    // Build analysis items
    const items: TimeBasedAnalysisItem[] = pagesWithDates.map(page => {
      const priorAggregate = priorAggregateDict[page.publishDate!];

      // If no prior aggregate (first date) or prior aggregate is 0, use raw referring domains
      const timeBasedIndex = (!priorAggregate || priorAggregate === 0)
        ? page.referringDomains
        : page.referringDomains / priorAggregate;

      return {
        url: page.url,
        title: page.pageTitle,
        referringDomains: page.referringDomains,
        timeBasedIndex,
        publishDate: page.publishDate!,
      };
    });

    return new TimeBasedAnalysis(items);
  }

  getOutperformers(threshold: number = 1.0): TimeBasedAnalysisItem[] {
    return this.items.filter(item => item.timeBasedIndex > threshold);
  }

  getUnderperformers(threshold: number = 1.0): TimeBasedAnalysisItem[] {
    return this.items.filter(item => item.timeBasedIndex < threshold);
  }

  getByDateRange(startDate: string, endDate: string): TimeBasedAnalysisItem[] {
    return this.items.filter(item =>
      item.publishDate >= startDate && item.publishDate <= endDate
    );
  }

  exportToCsv(): string {
    if (this.items.length === 0) {
      return '';
    }

    const headers = [
      'URL',
      'Title',
      'Referring Domains',
      'Time-Based Index',
      'Publish Date'
    ];

    const rows = this.items.map(item => [
      item.url,
      item.title,
      item.referringDomains.toString(),
      item.timeBasedIndex.toFixed(4),
      item.publishDate
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  getPerformanceStats(): {
    totalPages: number;
    outperformers: number;
    underperformers: number;
    averageIndex: number;
    medianIndex: number;
  } {
    if (this.items.length === 0) {
      return {
        totalPages: 0,
        outperformers: 0,
        underperformers: 0,
        averageIndex: 0,
        medianIndex: 0,
      };
    }

    const indices = this.items.map(item => item.timeBasedIndex);
    const outperformers = indices.filter(index => index > 1.0).length;
    const underperformers = indices.filter(index => index < 1.0).length;

    const sum = indices.reduce((acc, index) => acc + index, 0);
    const averageIndex = sum / indices.length;

    const sortedIndices = [...indices].sort((a, b) => a - b);
    const medianIndex = sortedIndices[Math.floor(sortedIndices.length / 2)];

    return {
      totalPages: this.items.length,
      outperformers,
      underperformers,
      averageIndex,
      medianIndex,
    };
  }
}

function calculatePriorAggregates(
  pages: AhrefsPage[],
  strategy: AnalysisStrategy
): Record<string, number> {
  const priorAggregateDict: Record<string, number> = {};
  const priorValues: number[] = [];

  // Get unique dates in chronological order
  const uniqueDates = Array.from(new Set(pages.map(p => p.publishDate!))).sort();

  for (const dateValue of uniqueDates) {
    if (priorValues.length > 0) {
      if (strategy === 'median') {
        priorAggregateDict[dateValue] = calculateMedian(priorValues);
      } else if (strategy === 'average') {
        priorAggregateDict[dateValue] = calculateAverage(priorValues);
      }
    } else {
      // No prior data for first date
      priorAggregateDict[dateValue] = 0;
    }

    // Add all referring domains values for this date to prior values
    const referringDomainsForDate = pages
      .filter(p => p.publishDate === dateValue)
      .map(p => p.referringDomains);

    priorValues.push(...referringDomainsForDate);
  }

  return priorAggregateDict;
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;

  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}
