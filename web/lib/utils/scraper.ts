/**
 * Job Scraper - GREEN Phase (TDD)
 *
 * Scrapes job postings from company career pages
 * Supports: Lever, Greenhouse, Workable, and custom career pages
 */

import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  url: string;
  description?: string;
  posted_date?: Date;
}

export interface ScrapeOptions {
  filterAI?: boolean;
  maxResults?: number;
}

type JobBoard = "lever" | "greenhouse" | "workable" | "ashby" | "custom";

/**
 * JobScraper class for extracting job postings from career pages
 */
export class JobScraper {
  private readonly AI_KEYWORDS = [
    "ai",
    "ml",
    "machine learning",
    "llm",
    "artificial intelligence",
    "data scientist",
    "deep learning",
    "neural network",
    "nlp",
    "computer vision",
    "generative ai",
    "prompt engineer",
  ];

  /**
   * Detects which job board platform is being used
   */
  detectJobBoard(url: string): JobBoard {
    const urlLower = url.toLowerCase();

    if (urlLower.includes("jobs.lever.co") || urlLower.includes("lever.co")) {
      return "lever";
    }
    if (
      urlLower.includes("greenhouse.io") ||
      urlLower.includes("boards.greenhouse")
    ) {
      return "greenhouse";
    }
    if (
      urlLower.includes("workable.com") ||
      urlLower.includes("apply.workable")
    ) {
      return "workable";
    }
    if (urlLower.includes("ashbyhq.com") || urlLower.includes("jobs.ashby")) {
      return "ashby";
    }

    return "custom";
  }

  /**
   * Scrapes jobs from a given URL
   */
  async scrapeJobs(
    url: string,
    options?: ScrapeOptions
  ): Promise<ScrapedJob[]> {
    try {
      // Validate URL
      new URL(url);

      const board = this.detectJobBoard(url);
      const company = this.extractCompanyName(url);

      // Fetch HTML
      const response = await axios.get(url, {
        timeout: 30000, // 30 segundos para sites lentos
        maxRedirects: 5,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Log for debugging (can be removed in production)
      if (process.env.NODE_ENV === "development") {
        console.log(
          `Scraping ${url} - Found ${$("body").length} body elements`
        );
      }

      let jobs: ScrapedJob[] = [];

      // Parse based on job board type
      switch (board) {
        case "lever":
          jobs = this.scrapeLeverJobs($, company, url);
          break;
        case "greenhouse":
          jobs = this.scrapeGreenhouseJobs($, company, url);
          break;
        case "workable":
          jobs = this.scrapeWorkableJobs($, company, url);
          break;
        case "ashby":
          jobs = this.scrapeAshbyJobs($, company, url);
          break;
        case "custom":
          // Try specific site handlers first
          if (url.includes("careers.king.com")) {
            jobs = this.scrapeKingJobs($, company, url);
          } else {
            jobs = this.scrapeCustomJobs($, company, url);
          }
          break;
      }

      // Filter AI/ML jobs if requested
      if (options?.filterAI) {
        jobs = jobs.filter((job) => this.isAIJob(job.title));
      }

      // Limit results if specified
      if (options?.maxResults) {
        jobs = jobs.slice(0, options.maxResults);
      }

      return jobs;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      return [];
    }
  }

  /**
   * Parses a job listing HTML element
   */
  parseJobListing(html: string, baseUrl: string): ScrapedJob | null {
    try {
      const $ = cheerio.load(html);

      // Try to extract job information
      const title = $('h3, h2, .job-title, [class*="title"]')
        .first()
        .text()
        .trim();
      const location = $('[class*="location"], .location, span')
        .first()
        .text()
        .trim();
      const link = $("a").first().attr("href");

      if (!title || !link) {
        return null;
      }

      const company = this.extractCompanyName(baseUrl);
      const fullUrl = link.startsWith("http")
        ? link
        : new URL(link, baseUrl).toString();

      return {
        title,
        company,
        location: location || "Not specified",
        url: fullUrl,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Extracts company name from URL
   */
  extractCompanyName(url: string): string {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;

      // Handle Lever: jobs.lever.co/company
      if (hostname.includes("lever.co")) {
        const parts = parsedUrl.pathname.split("/").filter(Boolean);
        if (parts.length > 0) {
          return this.capitalize(parts[0]);
        }
      }

      // Handle Greenhouse: boards.greenhouse.io/company
      if (hostname.includes("greenhouse.io")) {
        const parts = parsedUrl.pathname.split("/").filter(Boolean);
        if (parts.length > 0) {
          return this.capitalize(parts[0]);
        }
      }

      // Handle Workable: apply.workable.com/company
      if (hostname.includes("workable.com")) {
        const parts = parsedUrl.pathname.split("/").filter(Boolean);
        if (parts.length > 0) {
          return this.capitalize(parts[0]);
        }
      }

      // Handle Ashby: jobs.ashbyhq.com/company
      if (hostname.includes("ashbyhq.com")) {
        const parts = parsedUrl.pathname.split("/").filter(Boolean);
        if (parts.length > 0) {
          return this.capitalize(parts[0]);
        }
      }

      // Handle custom career pages: careers.company.com or company.com/careers
      const parts = hostname.split(".");
      if (parts.length >= 2) {
        // Get main domain (e.g., 'spotify' from 'careers.spotify.com' or 'king' from 'careers.king.com')
        const mainDomain = parts[parts.length - 2];
        // Special case for careers.king.com -> King
        if (
          mainDomain === "king" ||
          mainDomain === "spotify" ||
          mainDomain === "klarna"
        ) {
          return this.capitalize(mainDomain);
        }
        return this.capitalize(mainDomain);
      }

      return "Unknown Company";
    } catch (error) {
      return "Unknown Company";
    }
  }

  /**
   * Scrape jobs from Lever
   */
  private scrapeLeverJobs(
    $: ReturnType<typeof cheerio.load>,
    company: string,
    baseUrl: string
  ): ScrapedJob[] {
    const jobs: ScrapedJob[] = [];

    $('.posting, [class*="posting"]').each((_, element) => {
      const $el = $(element);

      // Get title - try multiple selectors
      let title = $el.find("h5").first().text().trim();
      if (!title) {
        title = $el.find("h4").first().text().trim();
      }
      if (!title) {
        title = $el.find('[class*="posting-name"]').first().text().trim();
      }

      // Clean title - remove duplicate text and extra whitespace
      title = this.cleanTitle(title);

      // Get location
      const location = $el.find('[class*="location"]').first().text().trim();

      // Get link
      const link = $el.find("a").first().attr("href");

      if (title && link && title.length > 3 && title.length < 200) {
        jobs.push({
          title,
          company,
          location: location || "Remote",
          url: link.startsWith("http")
            ? link
            : new URL(link, baseUrl).toString(),
        });
      }
    });

    // Remove duplicates by URL
    const uniqueJobs = Array.from(
      new Map(jobs.map((job) => [job.url, job])).values()
    );

    return uniqueJobs;
  }

  /**
   * Scrape jobs from Greenhouse
   */
  private scrapeGreenhouseJobs(
    $: ReturnType<typeof cheerio.load>,
    company: string,
    baseUrl: string
  ): ScrapedJob[] {
    const jobs: ScrapedJob[] = [];

    // Greenhouse usa diferentes estruturas
    const selectors = [
      ".opening",
      '[data-mapped="true"]',
      ".job",
      'div[class*="opening"]',
      'section[class*="job"]',
    ];

    for (const selector of selectors) {
      $(selector).each((_, element) => {
        const $el = $(element);

        // Título - tentar múltiplas estratégias
        let title = $el.find('a[data-mapped="true"]').first().text().trim();
        if (!title) title = $el.find("a").first().text().trim();
        if (!title) title = $el.find("h3, h4, h5").first().text().trim();

        // Limpar título
        title = this.cleanTitle(title);

        // Localização
        let location = $el.find('[class*="location"]').first().text().trim();
        if (!location) location = $el.find("span").first().text().trim();

        // Link
        let link = $el.find("a").first().attr("href");

        if (title && link && title.length > 3) {
          // Construir URL completa
          const fullUrl = link.startsWith("http")
            ? link
            : new URL(link, baseUrl).toString();

          // Evitar duplicatas
          if (!jobs.some((j) => j.url === fullUrl || j.title === title)) {
            jobs.push({
              title,
              company,
              location: location || "Remote",
              url: fullUrl,
            });
          }
        }
      });

      // Se encontrou jobs, para de tentar outros seletores
      if (jobs.length > 0) break;
    }

    // Remover duplicatas
    return Array.from(new Map(jobs.map((job) => [job.url, job])).values());
  }

  /**
   * Scrape jobs from Workable
   */
  private scrapeWorkableJobs(
    $: ReturnType<typeof cheerio.load>,
    company: string,
    baseUrl: string
  ): ScrapedJob[] {
    const jobs: ScrapedJob[] = [];

    $('li[class*="job"], .job-item').each((_, element) => {
      const $el = $(element);
      const title = $el.find("a, h3").text().trim();
      const location = $el.find('[class*="location"]').text().trim();
      const link = $el.find("a").attr("href");

      if (title && link) {
        jobs.push({
          title,
          company,
          location: location || "Not specified",
          url: link.startsWith("http")
            ? link
            : new URL(link, baseUrl).toString(),
        });
      }
    });

    return jobs;
  }

  /**
   * Scrape jobs from King.com career pages
   */
  private scrapeKingJobs(
    $: ReturnType<typeof cheerio.load>,
    company: string,
    baseUrl: string
  ): ScrapedJob[] {
    const jobs: ScrapedJob[] = [];

    // King.com uses specific selectors - try multiple approaches
    const selectors = [
      'a[href*="/job/"]',
      'a[href*="/jobs/"]',
      "[data-job-id]",
      "[data-job-title]",
      ".job-card",
      ".job-item",
      'li[class*="job"]',
      'div[class*="job-card"]',
      'article[class*="job"]',
    ];

    for (const selector of selectors) {
      $(selector).each((_, element) => {
        const $el = $(element);

        // Try to find title
        let title = $el
          .find('h3, h2, h4, [class*="title"]')
          .first()
          .text()
          .trim();
        if (!title) {
          title = $el.text().trim().split("\n")[0].trim();
        }
        if (!title && $el.is("a")) {
          title = $el.text().trim();
        }

        // Clean title
        title = this.cleanTitle(title);

        // Try to find link
        let link = $el.attr("href") || $el.find("a").first().attr("href") || "";
        if (!link && $el.is("a")) {
          link = $el.attr("href") || "";
        }

        // Try to find location
        let location = $el
          .find('[class*="location"], [class*="city"]')
          .first()
          .text()
          .trim();
        if (!location) {
          const text = $el.text();
          const locationMatch = text.match(
            /(Stockholm|Gothenburg|Malmö|Sweden|London|New York|San Francisco|Remote|Hybrid)/i
          );
          if (locationMatch) {
            location = locationMatch[0];
          }
        }

        if (title && link && title.length > 3 && title.length < 200) {
          // Build full URL
          let fullUrl = link;
          if (!link.startsWith("http")) {
            try {
              fullUrl = new URL(link, baseUrl).toString();
            } catch {
              fullUrl = baseUrl;
            }
          }

          // Avoid duplicates
          if (!jobs.some((j) => j.url === fullUrl || j.title === title)) {
            jobs.push({
              title,
              company,
              location: location || "Not specified",
              url: fullUrl,
            });
          }
        }
      });

      if (jobs.length > 0) break;
    }

    // Remove duplicates by URL
    const uniqueJobs = Array.from(
      new Map(jobs.map((job) => [job.url, job])).values()
    );

    return uniqueJobs;
  }

  /**
   * Scrape jobs from Ashby (usado por King)
   */
  private scrapeAshbyJobs(
    $: ReturnType<typeof cheerio.load>,
    company: string,
    baseUrl: string
  ): ScrapedJob[] {
    const jobs: ScrapedJob[] = [];

    // Ashby usa estrutura específica
    $('a[href*="/jobs/"]').each((_, element) => {
      const $el = $(element);
      const $parent = $el.closest("div");

      // Título geralmente está no link
      let title = $el.text().trim();
      if (!title) title = $el.find("h3, h2").text().trim();

      // Limpar título
      title = this.cleanTitle(title);

      // Localização geralmente está próxima
      const location = $parent
        .find("span, div")
        .filter((_, el) => {
          const text = $(el).text().toLowerCase();
          return (
            text.includes("stockholm") ||
            text.includes("sweden") ||
            text.includes("remote") ||
            text.includes("hybrid")
          );
        })
        .first()
        .text()
        .trim();

      const link = $el.attr("href");

      if (title && link && title.length > 5) {
        // Construir URL completa
        const fullUrl = link.startsWith("http")
          ? link
          : new URL(link, baseUrl).toString();

        // Evitar duplicatas
        if (!jobs.some((j) => j.url === fullUrl || j.title === title)) {
          jobs.push({
            title,
            company,
            location: location || "Not specified",
            url: fullUrl,
          });
        }
      }
    });

    // Remover duplicatas
    return Array.from(new Map(jobs.map((job) => [job.url, job])).values());
  }

  /**
   * Scrape jobs from custom career pages
   */
  private scrapeCustomJobs(
    $: ReturnType<typeof cheerio.load>,
    company: string,
    baseUrl: string
  ): ScrapedJob[] {
    const jobs: ScrapedJob[] = [];

    // Seletores mais agressivos para custom sites
    const selectors = [
      'a[href*="/job"]',
      'a[href*="/jobs/"]',
      'a[href*="/position"]',
      'a[href*="/career"]',
      'div[class*="job"] a',
      'div[class*="position"] a',
      'li[class*="job"] a',
      ".job-listing a",
      "[data-job-id]",
      "article a",
    ];

    const foundJobs = new Set<string>(); // Evitar duplicatas

    selectors.forEach((selector) => {
      $(selector).each((_, element) => {
        const $el = $(element);

        // Título - tentar pegar do link ou elemento pai
        let title = $el.text().trim();
        if (!title) title = $el.find("h2, h3, h4").first().text().trim();
        if (!title)
          title = $el.parent().find("h2, h3, h4").first().text().trim();

        // Limpar título
        title = this.cleanTitle(title);

        // Link
        let link = $el.attr("href");
        if (!link) link = $el.find("a").first().attr("href");

        if (title && link && title.length > 5 && title.length < 150) {
          // Construir URL
          const fullUrl = link.startsWith("http")
            ? link
            : new URL(link, baseUrl).toString();

          // Evitar duplicatas
          if (!foundJobs.has(fullUrl)) {
            foundJobs.add(fullUrl);

            // Tentar extrair localização do contexto
            const $parent = $el.parent();
            let location = $parent
              .find('[class*="location"]')
              .first()
              .text()
              .trim();
            if (!location)
              location = $parent
                .find("span")
                .filter((_, el) => {
                  const text = $(el).text().toLowerCase();
                  return (
                    text.includes("stockholm") ||
                    text.includes("sweden") ||
                    text.includes("remote") ||
                    text.includes("hybrid")
                  );
                })
                .first()
                .text()
                .trim();

            jobs.push({
              title,
              company,
              location: location || "Remote",
              url: fullUrl,
            });
          }
        }
      });
    });

    return jobs.slice(0, 50); // Limitar para evitar muito lixo
  }

  /**
   * Check if job title is AI/ML related
   */
  private isAIJob(title: string): boolean {
    const titleLower = title.toLowerCase();
    return this.AI_KEYWORDS.some((keyword) => titleLower.includes(keyword));
  }

  /**
   * Clean title - remove duplicate text and extra whitespace
   */
  private cleanTitle(title: string): string {
    // Remove extra whitespace
    let cleaned = title.replace(/\s+/g, " ").trim();

    // Remove common duplicate patterns
    // Pattern: "TitleTitle" -> "Title"
    let words = cleaned.split(" ");
    if (words.length > 0) {
      const firstHalf = words.slice(0, Math.floor(words.length / 2)).join(" ");
      const secondHalf = words.slice(Math.floor(words.length / 2)).join(" ");

      // If first half and second half are similar, keep only first half
      if (
        firstHalf.toLowerCase() === secondHalf.toLowerCase() &&
        firstHalf.length > 5
      ) {
        cleaned = firstHalf;
        words = cleaned.split(" ");
      }
    }

    // Remove duplicate consecutive words
    const uniqueWords: string[] = [];
    words.forEach((word, index) => {
      const lower = word.toLowerCase();
      // Only add if it's not a duplicate of the previous word
      if (
        index === 0 ||
        uniqueWords[uniqueWords.length - 1].toLowerCase() !== lower
      ) {
        uniqueWords.push(word);
      }
    });

    cleaned = uniqueWords.join(" ").trim();

    // Remove common suffixes that might be duplicated
    cleaned = cleaned
      .replace(/\s*(Hybrid|Remote|Permanent|Full-time|Part-time)\s*/gi, " ")
      .trim();
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    return cleaned;
  }

  /**
   * Capitalize first letter of string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
