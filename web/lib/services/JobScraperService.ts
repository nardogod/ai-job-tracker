/**
 * JobScraperService
 * 
 * Service wrapper around JobScraper that enhances jobs with additional
 * metadata like isAIRelated, department, and team fields.
 * 
 * Features:
 * - Caching of scraped results (5 minutes TTL)
 * - Rate limiting for parallel requests
 * - Detailed logging
 * - Retry logic for failed requests
 * - Enhanced error handling
 */

import { JobScraper, ScrapedJob, ScrapeOptions } from '@/lib/utils/scraper';

export interface EnhancedJob extends ScrapedJob {
  isAIRelated?: boolean;
  department?: string;
  team?: string;
}

interface CacheEntry {
  jobs: EnhancedJob[];
  timestamp: number;
}

interface JobScraperServiceOptions {
  enableCache?: boolean;
  enableLogging?: boolean;
  cacheTTL?: number; // Time to live in milliseconds (default: 5 minutes)
  rateLimitDelay?: number; // Delay between requests in milliseconds (default: 500ms)
  maxRetries?: number; // Maximum retry attempts (default: 3)
}

export class JobScraperService {
  private scraper: JobScraper;
  private cache: Map<string, CacheEntry>;
  private options: Required<JobScraperServiceOptions>;
  private readonly AI_KEYWORDS = [
    'ai',
    'ml',
    'machine learning',
    'llm',
    'artificial intelligence',
    'data scientist',
    'deep learning',
    'neural network',
    'nlp',
    'computer vision',
    'generative ai',
    'prompt engineer',
    'data science',
    'analytics',
    'research',
    'blockchain',
    'engineering',
    'software',
    'risk',
    'product'
  ];

  /**
   * Additional keywords per company to improve detection when 0 results
   * These are company-specific keywords that might indicate relevant jobs
   */
  private readonly ADDITIONAL_KEYWORDS: Record<string, string[]> = {
    klarna: ['fraud', 'payment', 'fintech', 'risk', 'credit', 'banking'],
    binance: ['blockchain', 'crypto', 'trading', 'quant', 'exchange', 'defi'],
    palantir: ['data platform', 'analytics', 'software engineer', 'data engineer', 'backend'],
    spotify: ['recommendation', 'audio', 'music', 'streaming', 'backend', 'data'],
    trustly: ['payment', 'banking', 'fintech', 'risk', 'fraud', 'backend'],
  };

  constructor(options: JobScraperServiceOptions = {}) {
    this.scraper = new JobScraper();
    this.cache = new Map();
    this.options = {
      enableCache: options.enableCache ?? true,
      enableLogging: options.enableLogging ?? process.env.NODE_ENV === 'development',
      cacheTTL: options.cacheTTL ?? 5 * 60 * 1000, // 5 minutes
      rateLimitDelay: options.rateLimitDelay ?? 500, // 500ms between requests
      maxRetries: options.maxRetries ?? 3,
    };
  }

  /**
   * Checks if a job is AI/ML related based on title and description
   * Also uses company-specific keywords to improve detection
   */
  private isAIRelated(title: string, description?: string, companyId?: string): boolean {
    const text = `${title} ${description || ''}`.toLowerCase();
    
    // Check standard AI keywords
    const hasAIKeyword = this.AI_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
    
    // If no AI keyword found, check company-specific keywords
    if (!hasAIKeyword && companyId) {
      const additionalKeywords = this.ADDITIONAL_KEYWORDS[companyId.toLowerCase()] || [];
      return additionalKeywords.some(keyword => text.includes(keyword.toLowerCase()));
    }
    
    return hasAIKeyword;
  }

  /**
   * Extracts department/team from job title or description
   */
  private extractDepartment(job: ScrapedJob): { department?: string; team?: string } {
    const title = job.title.toLowerCase();
    const description = (job.description || '').toLowerCase();
    const combined = `${title} ${description}`;

    // Try to extract department/team from common patterns
    const departmentMatch = combined.match(/(?:department|dept)[:\s]+([a-z\s]+)/i);
    const teamMatch = combined.match(/(?:team)[:\s]+([a-z\s]+)/i);

    return {
      department: departmentMatch ? departmentMatch[1].trim() : undefined,
      team: teamMatch ? teamMatch[1].trim() : undefined,
    };
  }

  /**
   * Enhances a scraped job with additional metadata
   */
  private enhanceJob(job: ScrapedJob, companyId?: string): EnhancedJob {
    const { department, team } = this.extractDepartment(job);
    const isAIRelated = this.isAIRelated(job.title, job.description, companyId);

    return {
      ...job,
      isAIRelated,
      department,
      team,
    };
  }

  /**
   * Logs messages if logging is enabled
   */
  private log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (!this.options.enableLogging) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      console[level === 'error' ? 'error' : 'log'](logMessage, data);
    } else {
      console[level === 'error' ? 'error' : 'log'](logMessage);
    }
  }

  /**
   * Gets cache key for a URL
   */
  private getCacheKey(url: string, options?: ScrapeOptions): string {
    const optionsKey = options ? JSON.stringify(options) : '';
    return `${url}::${optionsKey}`;
  }

  /**
   * Gets cached jobs if available and not expired
   */
  private getCachedJobs(url: string, options?: ScrapeOptions): EnhancedJob[] | null {
    if (!this.options.enableCache) return null;

    const cacheKey = this.getCacheKey(url, options);
    const entry = this.cache.get(cacheKey);

    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > this.options.cacheTTL) {
      this.cache.delete(cacheKey);
      this.log('info', 'Cache expired', { url, age: `${Math.round(age / 1000)}s` });
      return null;
    }

    this.log('info', 'Cache hit', { url, age: `${Math.round(age / 1000)}s`, jobsCount: entry.jobs.length });
    return entry.jobs;
  }

  /**
   * Stores jobs in cache
   */
  private setCachedJobs(url: string, jobs: EnhancedJob[], options?: ScrapeOptions): void {
    if (!this.options.enableCache) return;

    const cacheKey = this.getCacheKey(url, options);
    this.cache.set(cacheKey, {
      jobs,
      timestamp: Date.now(),
    });
    this.log('info', 'Cache stored', { url, jobsCount: jobs.length });
  }

  /**
   * Extracts company ID from URL (e.g., https://jobs.lever.co/klarna -> klarna)
   */
  private extractCompanyId(url: string): string | undefined {
    const match = url.match(/jobs\.lever\.co\/([^\/]+)/i);
    return match ? match[1] : undefined;
  }

  /**
   * Scrapes jobs from a URL with retry logic
   */
  private async scrapeJobsWithRetry(
    url: string,
    options?: ScrapeOptions,
    attempt: number = 1,
    companyId?: string
  ): Promise<EnhancedJob[]> {
    try {
      this.log('info', 'Scraping jobs', { url, attempt, companyId });
      const jobs = await this.scraper.scrapeJobs(url, options);
      const extractedCompanyId = companyId || this.extractCompanyId(url);
      const enhancedJobs = jobs.map(job => this.enhanceJob(job, extractedCompanyId));
      
      this.log('info', 'Scraping successful', { 
        url, 
        jobsCount: enhancedJobs.length,
        aiJobsCount: enhancedJobs.filter(j => j.isAIRelated).length
      });
      
      return enhancedJobs;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log('error', 'Scraping failed', { url, attempt, error: errorMessage });

      if (attempt < this.options.maxRetries) {
        const delay = attempt * 1000; // Exponential backoff
        this.log('info', 'Retrying scrape', { url, attempt: attempt + 1, delay: `${delay}ms` });
        await this.delay(delay);
        return this.scrapeJobsWithRetry(url, options, attempt + 1, companyId);
      }

      throw new Error(`Failed to scrape jobs from ${url} after ${this.options.maxRetries} attempts: ${errorMessage}`);
    }
  }

  /**
   * Scrapes jobs from a URL and enhances them with metadata
   * 
   * @param url - The URL to scrape jobs from
   * @param options - Scraping options (filterAI, maxResults)
   * @param companyId - Optional company ID for company-specific keyword matching
   * @returns Array of enhanced jobs with metadata
   */
  async scrapeJobs(
    url: string,
    options?: ScrapeOptions,
    companyId?: string
  ): Promise<EnhancedJob[]> {
    // Check cache first
    const cached = this.getCachedJobs(url, options);
    if (cached) {
      return cached;
    }

    // Scrape with retry logic
    const jobs = await this.scrapeJobsWithRetry(url, options, 1, companyId);

    // Store in cache
    this.setCachedJobs(url, jobs, options);

    return jobs;
  }

  /**
   * Scrapes jobs from multiple URLs in parallel with rate limiting
   * 
   * @param urls - Array of URLs to scrape
   * @param options - Scraping options
   * @param companyIds - Optional array of company IDs matching the URLs array
   * @returns Array of results with success/failure status
   */
  async scrapeJobsBatch(
    urls: string[],
    options?: ScrapeOptions,
    companyIds?: string[]
  ): Promise<Array<{ url: string; jobs: EnhancedJob[]; success: boolean; error?: string }>> {
    this.log('info', 'Starting batch scraping', { urlsCount: urls.length });

    const results = await Promise.allSettled(
      urls.map(async (url, index) => {
        // Rate limiting: add delay between requests
        if (index > 0) {
          await this.delay(this.options.rateLimitDelay);
        }

        try {
          const companyId = companyIds?.[index];
          const jobs = await this.scrapeJobs(url, options, companyId);
          return { url, jobs, success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.log('error', 'Batch scraping failed for URL', { url, error: errorMessage });
          return { url, jobs: [], success: false, error: errorMessage };
        }
      })
    );

    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          url: urls[index],
          jobs: [],
          success: false,
          error: result.reason?.message || 'Unknown error',
        };
      }
    });

    const successful = processedResults.filter(r => r.success).length;
    const totalJobs = processedResults.reduce((sum, r) => sum + r.jobs.length, 0);

    this.log('info', 'Batch scraping completed', {
      total: urls.length,
      successful,
      failed: urls.length - successful,
      totalJobs,
    });

    return processedResults;
  }

  /**
   * Clears the cache
   */
  clearCache(): void {
    this.cache.clear();
    this.log('info', 'Cache cleared');
  }

  /**
   * Gets cache statistics
   */
  getCacheStats(): { size: number; entries: Array<{ url: string; age: number; jobsCount: number }> } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => {
      const [url] = key.split('::');
      return {
        url,
        age: now - entry.timestamp,
        jobsCount: entry.jobs.length,
      };
    });

    return {
      size: this.cache.size,
      entries,
    };
  }

  /**
   * Adds a delay between requests to handle rate limiting
   */
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

