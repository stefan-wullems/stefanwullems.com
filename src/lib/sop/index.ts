// Main exports for SOP library - boundary layer with backward compatibility

// Boundary layer exports (classes for backward compatibility)
export {
  AhrefsPage,
  parseCsvContent,
  enrichWithPublishedDates,
} from './ahrefs-page'
export { ContentInventory } from './content-inventory'
export { TimeBasedAnalysis } from './time-based-analysis'

// Domain layer exports (pure functions and data)
export * as AhrefsPageDomain from '../domain/ahrefs-page'
export * as ContentInventoryDomain from '../domain/content-inventory'
export * as TimeBasedAnalysisDomain from '../domain/time-based-analysis'

// Type exports from boundary layer
export type { AhrefsPageData, AhrefsRawRow } from './ahrefs-page'
export type { ContentInventoryItem } from './content-inventory'
export type {
  TimeBasedAnalysisItem,
  AnalysisStrategy,
} from './time-based-analysis'

// Direct domain type exports for convenience
export type {
  AhrefsPageData as DomainAhrefsPageData,
  AhrefsRawRow as DomainAhrefsRawRow,
} from '../domain/ahrefs-page'

export type { ContentInventoryItem as DomainContentInventoryItem } from '../domain/content-inventory'

export type {
  TimeBasedAnalysisItem as DomainTimeBasedAnalysisItem,
  AnalysisStrategy as DomainAnalysisStrategy,
} from '../domain/time-based-analysis'
