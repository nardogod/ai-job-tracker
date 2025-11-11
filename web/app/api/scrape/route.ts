/**
 * /api/scrape - API Route
 * GREEN Phase - TDD Implementation
 *
 * Scrapes jobs from company career pages
 */

import { NextRequest, NextResponse } from "next/server";
import { JobScraper } from "@/lib/utils/scraper";
import { z } from "zod";

// Request body schema
const ScrapeRequestSchema = z.object({
  url: z.string().url("Invalid URL format"),
  filterAI: z.boolean().optional(),
  maxResults: z.number().optional(),
});

/**
 * POST /api/scrape
 *
 * Scrapes job postings from a given career page URL
 *
 * @example
 * POST /api/scrape
 * Body: { "url": "https://jobs.lever.co/spotify", "filterAI": true }
 *
 * Response: {
 *   "jobs": [...],
 *   "company": "Spotify",
 *   "count": 5
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          details: "Request body must be valid JSON",
        },
        { status: 400 }
      );
    }

    // Validate request
    const validation = ScrapeRequestSchema.safeParse(body);

    if (!validation.success) {
      const errorMessages =
        validation.error?.issues?.map((e) => e.message).join(", ") ||
        "Invalid request";
      return NextResponse.json(
        {
          error: "Invalid request",
          details: errorMessages,
        },
        { status: 400 }
      );
    }

    const { url, filterAI, maxResults } = validation.data;

    // Create scraper instance
    const scraper = new JobScraper();

    // Extract company name
    const company = scraper.extractCompanyName(url);

    // Scrape jobs
    const jobs = await scraper.scrapeJobs(url, {
      filterAI,
      maxResults,
    });

    // Return results
    return NextResponse.json(
      {
        jobs,
        company,
        count: jobs.length,
        url,
        filterAI: filterAI || false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/scrape:", error);

    // Handle specific errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Failed to scrape jobs",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scrape
 *
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json(
    {
      endpoint: "/api/scrape",
      method: "POST",
      description: "Scrapes job postings from company career pages",
      parameters: {
        url: {
          type: "string",
          required: true,
          description: "Career page URL to scrape",
          example: "https://jobs.lever.co/spotify",
        },
        filterAI: {
          type: "boolean",
          required: false,
          description: "Filter only AI/ML related jobs",
          default: false,
        },
        maxResults: {
          type: "number",
          required: false,
          description: "Maximum number of jobs to return",
          default: "unlimited",
        },
      },
      supportedPlatforms: [
        "Lever (jobs.lever.co)",
        "Greenhouse (boards.greenhouse.io)",
        "Workable (apply.workable.com)",
        "Custom career pages",
      ],
      example: {
        request: {
          url: "https://jobs.lever.co/spotify",
          filterAI: true,
          maxResults: 10,
        },
        response: {
          jobs: [
            {
              title: "AI Engineer",
              company: "Spotify",
              location: "Stockholm, Sweden",
              url: "https://jobs.lever.co/spotify/ai-engineer",
            },
          ],
          company: "Spotify",
          count: 1,
        },
      },
    },
    { status: 200 }
  );
}
