import { AhrefsPage, AhrefsPageData } from './ahrefs-page';

export interface ContentInventoryItem {
  url: string;
  publishDate?: string;
  pageTitle: string;
  compositeScore: number;
  referringDomains: number;
  rdQuartile: number;
  referringDomainsPerVisit: number;
  rdPerVisitQuartile: number;
  organicTraffic: number;
  trafficQuartile: number;
}

// Weights for composite score
const RD_WEIGHT = 1.0;
const TRAFFIC_WEIGHT = 1.0;

export class ContentInventory {
  constructor(public items: ContentInventoryItem[]) {}

  static fromAhrefsPages(pages: AhrefsPage[]): ContentInventory {
    if (pages.length === 0) {
      return new ContentInventory([]);
    }

    const data = pages.map(page => page.toData());

    // Calculate quartiles
    const rdQuartiles = calculateQuartiles(data.map(d => d.referringDomains));
    const trafficQuartiles = calculateQuartiles(data.map(d => d.organicTraffic));

    // Calculate referring domains per visit
    const rdPerVisitValues = data.map(d => {
      if (!d.organicTraffic || d.organicTraffic === 0 || !d.referringDomains) {
        return 0.0;
      }
      return d.referringDomains / d.organicTraffic;
    });

    const rdPerVisitQuartiles = calculateQuartiles(rdPerVisitValues);

    const items: ContentInventoryItem[] = data.map((pageData, index) => {
      const rdQuartile = getQuartile(pageData.referringDomains, rdQuartiles);
      const trafficQuartile = getTrafficQuartile(pageData.organicTraffic, trafficQuartiles);
      const rdPerVisitQuartile = getRdPerVisitQuartile(
        pageData.organicTraffic,
        pageData.referringDomains,
        rdPerVisitQuartiles
      );

      const compositeScore = (rdQuartile * RD_WEIGHT) + (trafficQuartile * TRAFFIC_WEIGHT);

      return {
        url: pageData.url,
        publishDate: pageData.publishDate,
        pageTitle: pageData.pageTitle,
        compositeScore,
        referringDomains: pageData.referringDomains,
        rdQuartile,
        referringDomainsPerVisit: rdPerVisitValues[index],
        rdPerVisitQuartile,
        organicTraffic: pageData.organicTraffic,
        trafficQuartile,
      };
    });

    // Sort by composite score descending, then by publish date descending
    items.sort((a, b) => {
      if (b.compositeScore !== a.compositeScore) {
        return b.compositeScore - a.compositeScore;
      }
      if (a.publishDate && b.publishDate) {
        return b.publishDate.localeCompare(a.publishDate);
      }
      return 0;
    });

    return new ContentInventory(items);
  }

  getTopPerformers(limit: number = 10): ContentInventoryItem[] {
    return this.items.slice(0, limit);
  }

  getByQuartile(quartile: number): ContentInventoryItem[] {
    return this.items.filter(item =>
      item.rdQuartile === quartile || item.trafficQuartile === quartile
    );
  }

  exportToCsv(): string {
    if (this.items.length === 0) {
      return '';
    }

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
      'Traffic Quartile'
    ];

    const rows = this.items.map(item => [
      item.url,
      item.publishDate || '',
      item.pageTitle,
      item.compositeScore.toFixed(1),
      item.referringDomains.toString(),
      item.rdQuartile.toString(),
      item.referringDomainsPerVisit.toFixed(4),
      item.rdPerVisitQuartile.toString(),
      item.organicTraffic.toString(),
      item.trafficQuartile.toString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }
}

function calculateQuartiles(values: number[]): [number, number, number] {
  if (values.length === 0) return [0, 0, 0];

  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q2Index = Math.floor(sorted.length * 0.5);
  const q3Index = Math.floor(sorted.length * 0.75);

  return [
    sorted[q1Index],
    sorted[q2Index],
    sorted[q3Index]
  ];
}

function getQuartile(value: number, quartiles: [number, number, number]): number {
  const [q1, q2, q3] = quartiles;

  if (value === 0) return 1;
  if (value <= q1) return 1;
  if (value <= q2) return 2;
  if (value <= q3) return 3;
  return 4;
}

function getTrafficQuartile(traffic: number, quartiles: [number, number, number]): number {
  // For traffic quartile, 0 or missing traffic gets quartile 4 (worst performance)
  if (!traffic || traffic === 0) return 4;
  return getQuartile(traffic, quartiles);
}

function getRdPerVisitQuartile(
  traffic: number,
  referringDomains: number,
  quartiles: [number, number, number]
): number {
  // Priority 1: if traffic is 0 or missing, force Q4 regardless of RD
  if (!traffic || traffic === 0) return 4;

  // Priority 2: if traffic is positive but RD is 0/missing, set to Q1
  if (!referringDomains || referringDomains === 0) return 1;

  // Otherwise use normal quartile calculation
  const ratio = referringDomains / traffic;
  return getQuartile(ratio, quartiles);
}
