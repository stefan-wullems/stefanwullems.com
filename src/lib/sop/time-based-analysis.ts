// Boundary layer for time-based analysis - handles data transformation and presentation

import { AhrefsPageData } from '../domain/ahrefs-page'
import {
  TimeBasedAnalysisItem,
  AnalysisStrategy,
  createTimeBasedAnalysis,
  filterOutperformers,
  filterUnderperformers,
  filterByDateRange,
  calculatePerformanceStats,
  toCsvContent,
} from '../domain/time-based-analysis'

export class TimeBasedAnalysis {
  constructor(public items: TimeBasedAnalysisItem[]) {}

  static fromAhrefsPages(
    pages: { toData(): AhrefsPageData }[],
    strategy: AnalysisStrategy = 'median',
  ): TimeBasedAnalysis {
    const pageData = pages.map((page) => page.toData())
    const items = createTimeBasedAnalysis(pageData, strategy)
    return new TimeBasedAnalysis(items)
  }

  static fromPageData(
    pages: AhrefsPageData[],
    strategy: AnalysisStrategy = 'median',
  ): TimeBasedAnalysis {
    const items = createTimeBasedAnalysis(pages, strategy)
    return new TimeBasedAnalysis(items)
  }

  getOutperformers(threshold: number = 1.0): TimeBasedAnalysisItem[] {
    return filterOutperformers(this.items, threshold)
  }

  getUnderperformers(threshold: number = 1.0): TimeBasedAnalysisItem[] {
    return filterUnderperformers(this.items, threshold)
  }

  getByDateRange(startDate: string, endDate: string): TimeBasedAnalysisItem[] {
    return filterByDateRange(this.items, startDate, endDate)
  }

  exportToCsv(): string {
    return toCsvContent(this.items)
  }

  getPerformanceStats(): {
    totalPages: number
    outperformers: number
    underperformers: number
    averageIndex: number
    medianIndex: number
  } {
    return calculatePerformanceStats(this.items)
  }
}

// Re-export domain types
export type { TimeBasedAnalysisItem, AnalysisStrategy }
