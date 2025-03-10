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

export interface Subscription {
  [chatId: number]: {
    site: JobSite;
    url: string;
    pages: number;
  }[];
}
