// Boundary layer for content inventory - handles data transformation and presentation

import { AhrefsPageData } from '../domain/ahrefs-page'
import {
  ContentInventoryItem,
  createContentInventory,
  getTopPerformers,
  filterByQuartile,
  toCsvContent,
} from '../domain/content-inventory'

export class ContentInventory {
  constructor(public items: ContentInventoryItem[]) {}

  static fromAhrefsPages(
    pages: { toData(): AhrefsPageData }[],
  ): ContentInventory {
    const pageData = pages.map((page) => page.toData())
    const items = createContentInventory(pageData)
    return new ContentInventory(items)
  }

  static fromPageData(pages: AhrefsPageData[]): ContentInventory {
    const items = createContentInventory(pages)
    return new ContentInventory(items)
  }

  getTopPerformers(limit: number = 10): ContentInventoryItem[] {
    return getTopPerformers(this.items, limit)
  }

  getByQuartile(quartile: number): ContentInventoryItem[] {
    return filterByQuartile(this.items, quartile)
  }

  exportToCsv(): string {
    return toCsvContent(this.items)
  }
}

// Re-export domain types
export type { ContentInventoryItem }
