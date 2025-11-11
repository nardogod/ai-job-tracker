/**
 * JobSearchForm Component
 * GREEN Phase - TDD Implementation
 *
 * Form for searching jobs from company career pages
 */

"use client";

import { useState } from "react";

interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  url: string;
  description?: string;
  posted_date?: Date;
}

interface JobSearchFormProps {
  onJobsFound?: (
    jobs: ScrapedJob[],
    company: string,
    filterSweden?: boolean,
    error?: string
  ) => void;
  onMultipleJobsFound?: (
    allJobs: ScrapedJob[],
    companies: string[],
    filterSweden?: boolean,
    errors?: string[]
  ) => void;
}

export function JobSearchForm({
  onJobsFound,
  onMultipleJobsFound,
}: JobSearchFormProps) {
  const [urls, setUrls] = useState("");
  const [filterAI, setFilterAI] = useState(false);
  const [filterSweden, setFilterSweden] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString.trim());
      return true;
    } catch {
      return false;
    }
  };

  const parseUrls = (urlString: string): string[] => {
    // Split by newlines or commas
    return urlString
      .split(/[\n,;]/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parse multiple URLs
    const urlList = parseUrls(urls);

    // Validate URLs
    const invalidUrls = urlList.filter((url) => !isValidUrl(url));
    if (invalidUrls.length > 0) {
      setError(`Invalid URLs: ${invalidUrls.join(", ")}`);
      return;
    }

    if (urlList.length === 0) {
      setError("Please enter at least one URL");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: urlList.length });

    try {
      // If single URL, use old callback for backward compatibility
      if (urlList.length === 1 && onJobsFound) {
        const response = await fetch("/api/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: urlList[0],
            filterAI,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error || "Failed to scrape jobs";
          setError(errorMsg);
          if (onJobsFound) {
            onJobsFound([], "", filterSweden, errorMsg);
          }
          return;
        }

        if (onJobsFound) {
          onJobsFound(data.jobs, data.company, filterSweden);
        }
      } else {
        // Multiple URLs - scrape all in parallel
        const allJobs: ScrapedJob[] = [];
        const companies = new Set<string>();
        const errors: string[] = [];

        const scrapePromises = urlList.map(async (url, index) => {
          try {
            setProgress({ current: index + 1, total: urlList.length });

            const response = await fetch("/api/scrape", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                url,
                filterAI,
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              const errorMsg = `Failed to scrape ${new URL(url).hostname}: ${
                data.error || "Unknown error"
              }`;
              console.error(errorMsg);
              errors.push(errorMsg);
              if (onJobsFound) {
                onJobsFound([], "", filterSweden, errorMsg);
              }
              return { jobs: [], company: null };
            }

            companies.add(data.company);
            return { jobs: data.jobs, company: data.company };
          } catch (err) {
            const errorMsg = `Failed to scrape ${new URL(url).hostname}: ${
              err instanceof Error ? err.message : "Unknown error"
            }`;
            console.error(errorMsg);
            errors.push(errorMsg);
            if (onJobsFound) {
              onJobsFound([], "", filterSweden, errorMsg);
            }
            return { jobs: [], company: null };
          }
        });

        const results = await Promise.all(scrapePromises);

        // Combine all jobs
        results.forEach((result) => {
          if (result.jobs && result.jobs.length > 0) {
            allJobs.push(...result.jobs);
          }
        });

        // Set error if there were any errors
        if (errors.length > 0) {
          setError(errors.join("; "));
        }

        if (onMultipleJobsFound) {
          onMultipleJobsFound(
            allJobs,
            Array.from(companies),
            filterSweden,
            errors
          );
        } else if (onJobsFound && allJobs.length > 0) {
          // Fallback to single callback
          onJobsFound(allJobs, Array.from(companies).join(", "), filterSweden);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scrape");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="urls"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Career Page URLs (one per line or comma-separated)
        </label>
        <textarea
          id="urls"
          rows={4}
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="Enter one or more career page URLs:&#10;https://jobs.lever.co/spotify&#10;https://boards.greenhouse.io/klarna&#10;https://careers.king.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500">
          You can enter multiple URLs, one per line or separated by commas
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center">
          <input
            id="filterAI"
            type="checkbox"
            checked={filterAI}
            onChange={(e) => setFilterAI(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label
            htmlFor="filterAI"
            className="ml-2 block text-sm text-gray-700"
          >
            AI/ML Jobs Only
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="filterSweden"
            type="checkbox"
            checked={filterSweden}
            onChange={(e) => setFilterSweden(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label
            htmlFor="filterSweden"
            className="ml-2 block text-sm text-gray-700"
          >
            🇸🇪 Sweden Only
          </label>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {progress && (
        <div className="text-sm text-gray-600">
          <p>
            Scraping {progress.current} of {progress.total} companies...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full px-4 py-2 rounded-md font-medium text-white transition-colors ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading
          ? progress
            ? `Searching ${progress.current}/${progress.total}...`
            : "Searching..."
          : "Search Jobs"}
      </button>
    </form>
  );
}
