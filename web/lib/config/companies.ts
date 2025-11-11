/**
 * Swedish Lever Companies Configuration
 *
 * Configuration for Swedish companies that use Lever job board
 * for their career pages.
 *
 * @example
 * ```ts
 * import { SWEDISH_LEVER_COMPANIES } from '@/lib/config/companies';
 *
 * // Get all companies
 * const companies = SWEDISH_LEVER_COMPANIES;
 *
 * // Filter by company
 * const klarna = companies.find(c => c.id === 'klarna');
 *
 * // Get company URLs
 * const urls = companies.map(c => c.url);
 * ```
 *
 * To add a new company:
 * 1. Add a new object to the SWEDISH_LEVER_COMPANIES array
 * 2. Ensure the URL follows the pattern: https://jobs.lever.co/{company-id}
 * 3. Include all required fields: id, name, url, location, industry, size, focus, description
 * 4. Update tests in JobScraperService.lever.test.ts if needed
 */

export const SWEDISH_LEVER_COMPANIES = [
  {
    id: "klarna",
    name: "Klarna",
    url: "https://jobs.lever.co/klarna",
    location: "Stockholm, Sweden",
    industry: "Fintech",
    size: "5000+",
    focus: ["AI", "ML", "Fraud Detection", "Payments"],
    description: "Europe's highest valued private fintech",
  },
  {
    id: "spotify",
    name: "Spotify",
    url: "https://jobs.lever.co/spotify",
    location: "Stockholm, Sweden",
    industry: "Music Streaming",
    size: "8000+",
    focus: ["ML", "Recommendations", "NLP", "Audio AI"],
    description: "Global music streaming leader",
  },
  {
    id: "binance",
    name: "Binance",
    url: "https://jobs.lever.co/binance",
    location: "Stockholm, Sweden",
    industry: "Cryptocurrency",
    size: "8000+",
    focus: ["Blockchain", "Data Analytics", "ML Trading"],
    description: "World's largest crypto exchange",
  },
  {
    id: "palantir",
    name: "Palantir Technologies",
    url: "https://jobs.lever.co/palantir",
    location: "Stockholm, Sweden",
    industry: "Big Data",
    size: "3500+",
    focus: ["Data Platforms", "AI Analytics", "ML"],
    description: "Enterprise data and AI platform",
  },
  {
    id: "trustly",
    name: "Trustly",
    url: "https://jobs.lever.co/trustly",
    location: "Stockholm, Sweden",
    industry: "Fintech",
    size: "400+",
    focus: ["Payment Tech", "ML", "Fraud Detection"],
    description: "Online banking payments platform",
  },
] as const;

export type SwedishLeverCompany = (typeof SWEDISH_LEVER_COMPANIES)[number];
