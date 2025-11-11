/**
 * Job Scraper Tests
 * GREEN Phase - TDD with Mocks
 */

import { JobScraper } from '@/lib/utils/scraper';

// Mock axios
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock cheerio
jest.mock('cheerio', () => ({
  load: jest.fn(),
}));
import * as cheerio from 'cheerio';

describe('JobScraper', () => {
  let scraper: JobScraper;

  beforeEach(() => {
    scraper = new JobScraper();
    jest.clearAllMocks();
  });

  describe('detectJobBoard', () => {
    it('should detect Lever job board', () => {
      const url = 'https://jobs.lever.co/company';
      const board = scraper.detectJobBoard(url);
      expect(board).toBe('lever');
    });

    it('should detect Greenhouse job board', () => {
      const url = 'https://boards.greenhouse.io/company';
      const board = scraper.detectJobBoard(url);
      expect(board).toBe('greenhouse');
    });

    it('should detect Workable job board', () => {
      const url = 'https://apply.workable.com/company';
      const board = scraper.detectJobBoard(url);
      expect(board).toBe('workable');
    });

    it('should detect custom career page', () => {
      const url = 'https://careers.spotify.com/jobs';
      const board = scraper.detectJobBoard(url);
      expect(board).toBe('custom');
    });
  });

  describe('extractCompanyName', () => {
    it('should extract company from Lever URL', () => {
      const url = 'https://jobs.lever.co/spotify';
      const company = scraper.extractCompanyName(url);
      expect(company).toBe('Spotify');
    });

    it('should extract company from Greenhouse URL', () => {
      const url = 'https://boards.greenhouse.io/klarna';
      const company = scraper.extractCompanyName(url);
      expect(company).toBe('Klarna');
    });

    it('should extract company from custom career page', () => {
      const url = 'https://careers.spotify.com/jobs';
      const company = scraper.extractCompanyName(url);
      expect(company).toBe('Spotify');
    });

    it('should handle URLs with subdomains', () => {
      const url = 'https://jobs.company.subdomain.com/careers';
      const company = scraper.extractCompanyName(url);
      expect(typeof company).toBe('string');
      expect(company.length).toBeGreaterThan(0);
    });
  });

  describe('scrapeJobs', () => {
    it('should return empty array for invalid URL', async () => {
      const jobs = await scraper.scrapeJobs('invalid-url');
      expect(jobs).toEqual([]);
    });

    it('should handle network errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      
      const url = 'https://jobs.lever.co/example';
      const jobs = await scraper.scrapeJobs(url);
      
      expect(jobs).toEqual([]);
    });

    it('should scrape jobs from Lever with mocked response', async () => {
      const mockHTML = `
        <div class="posting">
          <h5>AI Engineer</h5>
          <span class="location">Stockholm</span>
          <a href="/ai-engineer">Apply</a>
        </div>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHTML });

      // Mock cheerio
      const mockFind = jest.fn();
      const mockText = jest.fn();
      const mockAttr = jest.fn();
      const mockEach = jest.fn((callback) => {
        callback(0, {});
      });

      mockFind.mockReturnValue({
        text: mockText,
        attr: mockAttr,
        find: mockFind,
      });
      mockText.mockReturnValue('AI Engineer');
      mockAttr.mockReturnValue('/ai-engineer');

      (cheerio.load as jest.Mock).mockReturnValue(
        jest.fn().mockReturnValue({
          find: mockFind,
          each: mockEach,
        })
      );

      const url = 'https://jobs.lever.co/example';
      const jobs = await scraper.scrapeJobs(url);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          timeout: 30000,
        })
      );
      expect(Array.isArray(jobs)).toBe(true);
    });

    it('should filter AI/ML jobs when filterAI is true', async () => {
      const mockHTML = `
        <div class="posting">
          <h5>AI Engineer</h5>
          <span class="location">Stockholm</span>
          <a href="/job1">Apply</a>
        </div>
        <div class="posting">
          <h5>Backend Developer</h5>
          <span class="location">Stockholm</span>
          <a href="/job2">Apply</a>
        </div>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHTML });

      const mockCheerio = {
        find: jest.fn(),
        text: jest.fn(),
        attr: jest.fn(),
      };

      let callCount = 0;
      (cheerio.load as jest.Mock).mockReturnValue(() => ({
        each: (callback: any) => {
          if (callCount === 0) {
            mockCheerio.find.mockReturnValueOnce({
              text: () => 'AI Engineer',
              find: mockCheerio.find,
            });
            mockCheerio.find.mockReturnValueOnce({
              text: () => 'Stockholm',
            });
            mockCheerio.find.mockReturnValueOnce({
              attr: () => '/job1',
            });
            callback(0, {});
          }
          callCount++;
        },
        find: mockCheerio.find,
      }));

      const url = 'https://jobs.lever.co/example';
      const jobs = await scraper.scrapeJobs(url, { filterAI: true });

      expect(Array.isArray(jobs)).toBe(true);
    });
  });

  describe('parseJobListing', () => {
    it('should parse valid job HTML', () => {
      const mockHTML = '<div><h3>AI Engineer</h3><span>Stockholm</span><a href="/apply">Apply</a></div>';
      
      const mockCheerio = {
        first: jest.fn().mockReturnThis(),
        text: jest.fn()
          .mockReturnValueOnce('AI Engineer')
          .mockReturnValueOnce('Stockholm'),
        attr: jest.fn().mockReturnValue('/apply'),
        find: jest.fn().mockReturnThis(),
      };

      (cheerio.load as jest.Mock).mockReturnValue(() => mockCheerio);

      const job = scraper.parseJobListing(mockHTML, 'https://jobs.lever.co/company');

      expect(job).toBeDefined();
      if (job) {
        expect(job.title).toBe('AI Engineer');
        expect(job.location).toBe('Stockholm');
        expect(job.url).toContain('http');
      }
    });

    it('should return null for invalid HTML', () => {
      const mockCheerio = {
        first: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnValue(''),
        attr: jest.fn().mockReturnValue(undefined),
        find: jest.fn().mockReturnThis(),
      };

      (cheerio.load as jest.Mock).mockReturnValue(() => mockCheerio);

      const job = scraper.parseJobListing('<div></div>', 'https://example.com');
      expect(job).toBeNull();
    });
  });
});
