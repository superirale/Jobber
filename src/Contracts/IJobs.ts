export interface ScrapedJob {
  title: string;
  url: string;
  location: string;
  salary: string;
  date: string;
  company: string;
}

export enum JobSite {
  indeed = "indeed",
  totaljobs = "totaljobs",
}

export interface SubscriptionItem {
  url: string;
  site: JobSite;
  pages: number;
  keywords?: string[];
}

export type Subscription = Record<number, SubscriptionItem[]>;
