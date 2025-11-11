/**
 * /api/scrape/swedish-companies - API Route
 * 
 * Scrapes jobs from Swedish companies using Lever job board
 * 
 * Query Parameters:
 * - company: Filter by company ID (optional)
 * - aiOnly: Filter AI/ML jobs only (default: false)
 * - stockholmOnly: Filter Stockholm/Sweden locations only (default: false)
 * - includeRemote: Include remote jobs (default: false)
 * 
 * @example
 * GET /api/scrape/swedish-companies?aiOnly=true&stockholmOnly=true
 * GET /api/scrape/swedish-companies?company=klarna
 * GET /api/scrape/swedish-companies?aiOnly=true&includeRemote=true
 */

import { NextRequest, NextResponse } from 'next/server';
import { JobScraperService } from '@/lib/services/JobScraperService';
import { SWEDISH_LEVER_COMPANIES } from '@/lib/config/companies';

// Initialize service with caching and logging enabled
const scraperService = new JobScraperService({
  enableCache: true,
  enableLogging: process.env.NODE_ENV === 'development',
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  rateLimitDelay: 500, // 500ms between requests
  maxRetries: 3,
});

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('company');
    const aiOnly = searchParams.get('aiOnly') === 'true';
    const stockholmOnly = searchParams.get('stockholmOnly') === 'true';
    const includeRemote = searchParams.get('includeRemote') === 'true';

    let companies: typeof SWEDISH_LEVER_COMPANIES[number][] = [...SWEDISH_LEVER_COMPANIES];
    
    if (companyId) {
      companies = companies.filter(c => c.id === companyId);
      if (companies.length === 0) {
        return NextResponse.json(
          { 
            success: false,
            error: `Company with ID '${companyId}' not found`,
            availableCompanies: SWEDISH_LEVER_COMPANIES.map(c => ({ id: c.id, name: c.name }))
          },
          { status: 404 }
        );
      }
    }

    // Use batch scraping for better performance and rate limiting
    const urls = companies.map(c => c.url);
    const companyIds = companies.map(c => c.id);
    const batchResults = await scraperService.scrapeJobsBatch(urls, undefined, companyIds);

    // Process results with filters
    const processedResults = batchResults.map((batchResult, index) => {
      const company = companies[index];
      
      if (!batchResult.success) {
        return {
          company: company.name,
          companyId: company.id,
          jobCount: 0,
          jobs: [],
          error: batchResult.error,
        };
      }

      let jobs = batchResult.jobs;
      
      // Apply location filters
      if (stockholmOnly) {
        jobs = jobs.filter(job => {
          const location = job.location?.toLowerCase() || '';
          return (
            location.includes('stockholm') ||
            location.includes('sweden') ||
            (includeRemote && (location.includes('remote') || location.includes('hybrid')))
          );
        });
      } else if (includeRemote) {
        // If not filtering by Stockholm, but including remote
        jobs = jobs.filter(job => {
          const location = job.location?.toLowerCase() || '';
          return (
            location.includes('stockholm') ||
            location.includes('sweden') ||
            location.includes('remote') ||
            location.includes('hybrid')
          );
        });
      }
      
      // Apply AI filter
      if (aiOnly) {
        jobs = jobs.filter(job => job.isAIRelated);
      }

      return {
        company: company.name,
        companyId: company.id,
        jobCount: jobs.length,
        jobs,
      };
    });

    const successful = processedResults.filter(r => !r.error);
    const failed = processedResults.filter(r => r.error);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      totalCompanies: companies.length,
      successfulScrapes: successful.length,
      failedScrapes: failed.length,
      totalJobs: successful.reduce((sum, r) => sum + r.jobCount, 0),
      duration: `${duration}ms`,
      filters: {
        aiOnly,
        stockholmOnly,
        includeRemote,
      },
      results: successful,
      errors: failed.map(f => ({
        company: f.company,
        companyId: f.companyId,
        error: f.error,
      })),
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('[Swedish Companies API] Error:', errorMessage);

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to scrape Swedish companies',
        details: errorMessage,
        duration: `${duration}ms`,
      },
      { status: 500 }
    );
  }
}

