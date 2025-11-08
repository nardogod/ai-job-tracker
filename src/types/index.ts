/**
 * Type definitions for AI Job Tracker
 */

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  postedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchOptions {
  location?: string;
  keywords?: string[];
  maxResults?: number;
}

export interface SearchResult {
  jobs: Job[];
  total: number;
  query: string;
}

