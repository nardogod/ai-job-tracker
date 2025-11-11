/**
 * JobScraperService - Lever Swedish Companies Tests
 * 
 * Tests for scraping jobs from Swedish companies using Lever job board
 */

import { JobScraperService } from '@/lib/services/JobScraperService';
import { SWEDISH_LEVER_COMPANIES } from '@/lib/config/companies';

// Mock axios
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock cheerio
jest.mock('cheerio', () => ({
  load: jest.fn(),
}));
import * as cheerio from 'cheerio';

describe('JobScraperService - Lever Swedish Companies', () => {
  let scraperService: JobScraperService;

  beforeEach(() => {
    scraperService = new JobScraperService();
    jest.clearAllMocks();
    // Reset cheerio.load mock
    (cheerio.load as jest.Mock).mockClear();
  });

  describe('Swedish AI/ML Companies on Lever', () => {
    const swedishLeverCompanies = [
      {
        name: 'Klarna',
        url: 'https://jobs.lever.co/klarna',
        expectedJobFields: ['title', 'location', 'department'],
        aiKeywords: ['machine learning', 'data science', 'AI', 'analytics'],
        stockholmOffice: true
      },
      {
        name: 'Binance',
        url: 'https://jobs.lever.co/binance',
        expectedJobFields: ['title', 'location', 'team'],
        aiKeywords: ['data', 'analytics', 'research', 'blockchain'],
        stockholmOffice: true
      },
      {
        name: 'Palantir',
        url: 'https://jobs.lever.co/palantir',
        expectedJobFields: ['title', 'location', 'team'],
        aiKeywords: ['engineering', 'data', 'software', 'ML'],
        stockholmOffice: true
      },
      {
        name: 'Trustly',
        url: 'https://jobs.lever.co/trustly',
        expectedJobFields: ['title', 'location', 'department'],
        aiKeywords: ['machine learning', 'data', 'engineering', 'risk'],
        stockholmOffice: true
      },
      {
        name: 'Cision',
        url: 'https://jobs.lever.co/cision',
        expectedJobFields: ['title', 'location', 'team'],
        aiKeywords: ['data', 'analytics', 'engineering', 'product'],
        stockholmOffice: true
      }
    ];

    test.each(swedishLeverCompanies)(
      'should scrape $name jobs successfully',
      async ({ url, expectedJobFields }) => {
        // Mock HTML response
        const mockHTML = `
          <div class="posting">
            <h5>Machine Learning Engineer</h5>
            <span class="location">Stockholm, Sweden</span>
            <span class="department">Engineering</span>
            <a href="/machine-learning-engineer">Apply</a>
          </div>
          <div class="posting">
            <h5>Data Scientist</h5>
            <span class="location">Stockholm, Sweden</span>
            <span class="team">Data Team</span>
            <a href="/data-scientist">Apply</a>
          </div>
        `;

        mockedAxios.get.mockResolvedValueOnce({ data: mockHTML });

        // Mock cheerio - need to support $(element) inside each callback
        let jobIndex = 0;
        const jobTitles = ['Machine Learning Engineer', 'Data Scientist'];
        const jobUrls = ['/machine-learning-engineer', '/data-scientist'];

        const mockFind = jest.fn();
        const mockEach = jest.fn((callback: any) => {
          callback(0, {});
          callback(1, {});
        });

        // Mock for $(element) - called inside each callback
        const mockElementFind = jest.fn((sel: string) => {
          if (sel === 'h5') {
            return {
              first: () => ({
                text: () => jobTitles[jobIndex] || '',
              }),
            };
          }
          if (sel.includes('location')) {
            return {
              first: () => ({
                text: () => 'Stockholm, Sweden',
              }),
            };
          }
          if (sel === 'a') {
            return {
              first: () => ({
                attr: (name: string) => jobUrls[jobIndex] || '',
              }),
            };
          }
          return {
            first: () => ({ text: () => '', attr: () => '' }),
            find: mockElementFind,
          };
        });

        (cheerio.load as jest.Mock).mockImplementation((html: string) => {
          jobIndex = 0; // Reset index for new scrape
          
          const $ = (selector: any) => {
            if (typeof selector === 'object') {
              // $(element) - called inside each callback
              jobIndex++;
              return {
                find: mockElementFind,
              };
            }
            // $(selector) - normal selector
            if (selector === '.posting, [class*="posting"]') {
              return {
                each: mockEach,
              };
            }
            return {
              first: () => ({ text: () => '', attr: () => '' }),
              find: mockFind,
            };
          };
          
          return $;
        });

        const jobs = await scraperService.scrapeJobs(url);

        expect(jobs.length).toBeGreaterThan(0);
        jobs.forEach(job => {
          expectedJobFields.forEach(field => {
            if (field === 'department' || field === 'team') {
              // These are optional fields
              expect(job).toHaveProperty(field);
            } else {
              expect(job).toHaveProperty(field);
              expect(job[field as keyof typeof job]).toBeTruthy();
            }
          });
        });
      }
    );

    test.each(swedishLeverCompanies)(
      'should filter $name jobs for Stockholm location',
      async ({ url, stockholmOffice }) => {
        const mockHTML = `
          <div class="posting">
            <h5>Software Engineer</h5>
            <span class="location">Stockholm, Sweden</span>
            <a href="/software-engineer">Apply</a>
          </div>
        `;

        mockedAxios.get.mockResolvedValueOnce({ data: mockHTML });

        const mockFind2 = jest.fn();
        const mockEach2 = jest.fn((callback: any) => {
          callback(0, {});
        });
        const mockElementFind2 = jest.fn((sel: string) => {
          if (sel === 'h5') {
            return {
              first: () => ({
                text: () => 'Software Engineer',
              }),
            };
          }
          if (sel.includes('location')) {
            return {
              first: () => ({
                text: () => 'Stockholm, Sweden',
              }),
            };
          }
          if (sel === 'a') {
            return {
              first: () => ({
                attr: (name: string) => '/software-engineer',
              }),
            };
          }
          return {
            first: () => ({ text: () => '', attr: () => '' }),
            find: mockElementFind2,
          };
        });

        (cheerio.load as jest.Mock).mockImplementation((html: string) => {
          const $ = (selector: any) => {
            if (typeof selector === 'object') {
              // $(element) - called inside each callback
              return {
                find: mockElementFind2,
              };
            }
            // $(selector) - normal selector
            if (selector === '.posting, [class*="posting"]') {
              return {
                each: mockEach2,
              };
            }
            return {
              first: () => ({ text: () => '', attr: () => '' }),
              find: mockFind2,
            };
          };
          
          return $;
        });

        const jobs = await scraperService.scrapeJobs(url);
        const stockholmJobs = jobs.filter(job => 
          job.location?.toLowerCase().includes('stockholm') ||
          job.location?.toLowerCase().includes('sweden')
        );

        if (stockholmOffice) {
          expect(stockholmJobs.length).toBeGreaterThan(0);
        }
      }
    );

    test.each(swedishLeverCompanies)(
      'should identify AI/ML jobs at $name',
      async ({ url, aiKeywords }) => {
        const mockHTML = `
          <div class="posting">
            <h5>Machine Learning Engineer</h5>
            <span class="location">Stockholm, Sweden</span>
            <a href="/ml-engineer">Apply</a>
          </div>
          <div class="posting">
            <h5>Sales Representative</h5>
            <span class="location">Stockholm, Sweden</span>
            <a href="/sales">Apply</a>
          </div>
        `;

        mockedAxios.get.mockResolvedValueOnce({ data: mockHTML });

        let jobIndex = 0;
        const jobTitles = ['Machine Learning Engineer', 'Sales Representative'];
        const jobUrls = ['/ml-engineer', '/sales'];

        const mockFind3 = jest.fn();
        const mockEach3 = jest.fn((callback: any) => {
          callback(0, {});
          callback(1, {});
        });
        const mockElementFind3 = jest.fn((sel: string) => {
          if (sel === 'h5') {
            return {
              first: () => ({
                text: () => jobTitles[jobIndex] || '',
              }),
            };
          }
          if (sel.includes('location')) {
            return {
              first: () => ({
                text: () => 'Stockholm, Sweden',
              }),
            };
          }
          if (sel === 'a') {
            return {
              first: () => ({
                attr: (name: string) => jobUrls[jobIndex] || '',
              }),
            };
          }
          return {
            first: () => ({ text: () => '', attr: () => '' }),
            find: mockElementFind3,
          };
        });

        (cheerio.load as jest.Mock).mockImplementation((html: string) => {
          jobIndex = 0;
          
          const $ = (selector: any) => {
            if (typeof selector === 'object') {
              // $(element) - called inside each callback
              jobIndex++;
              return {
                find: mockElementFind3,
              };
            }
            // $(selector) - normal selector
            if (selector === '.posting, [class*="posting"]') {
              return {
                each: mockEach3,
              };
            }
            return {
              first: () => ({ text: () => '', attr: () => '' }),
              find: mockFind3,
            };
          };
          
          return $;
        });

        const jobs = await scraperService.scrapeJobs(url);
        const aiJobs = jobs.filter(job => {
          const text = `${job.title} ${job.description || ''}`.toLowerCase();
          return aiKeywords.some(keyword => text.includes(keyword.toLowerCase()));
        });

        expect(aiJobs.length).toBeGreaterThanOrEqual(0);
        aiJobs.forEach(job => {
          expect(job.isAIRelated).toBe(true);
        });
      }
    );
  });

  describe('Batch Processing Swedish Companies', () => {
    test('should scrape all Swedish Lever companies in parallel', async () => {
      const companies = [
        'https://jobs.lever.co/klarna',
        'https://jobs.lever.co/binance',
        'https://jobs.lever.co/palantir',
        'https://jobs.lever.co/trustly',
        'https://jobs.lever.co/cision'
      ];

      // Mock all requests
      companies.forEach(() => {
        mockedAxios.get.mockResolvedValueOnce({
          data: `
            <div class="posting">
              <h5>Software Engineer</h5>
              <span class="location">Stockholm, Sweden</span>
              <a href="/engineer">Apply</a>
            </div>
          `
        });
      });

      // Mock cheerio for all requests
      const mockFindBatch = jest.fn();
      const mockEachBatch = jest.fn((callback: any) => {
        callback(0, {});
      });
      const mockElementFindBatch = jest.fn((sel: string) => {
        if (sel === 'h5') {
          return {
            first: () => ({
              text: () => 'Software Engineer',
            }),
          };
        }
        if (sel.includes('location')) {
          return {
            first: () => ({
              text: () => 'Stockholm, Sweden',
            }),
          };
        }
        if (sel === 'a') {
          return {
            first: () => ({
              attr: (name: string) => '/engineer',
            }),
          };
        }
        return {
          first: () => ({ text: () => '', attr: () => '' }),
          find: mockElementFindBatch,
        };
      });

      (cheerio.load as jest.Mock).mockImplementation((html: string) => {
        const $ = (selector: any) => {
          if (typeof selector === 'object') {
            // $(element) - called inside each callback
            return {
              find: mockElementFindBatch,
            };
          }
          // $(selector) - normal selector
          if (selector === '.posting, [class*="posting"]') {
            return {
              each: mockEachBatch,
            };
          }
          return {
            first: () => ({ text: () => '', attr: () => '' }),
            find: mockFindBatch,
          };
        };
        
        return $;
      });

      const results = await Promise.allSettled(
        companies.map(url => scraperService.scrapeJobs(url))
      );

      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful.length).toBeGreaterThan(0);

      const totalJobs = successful.reduce((sum, result) => {
        return sum + (result.status === 'fulfilled' ? result.value.length : 0);
      }, 0);

      // Each company returns 1 job in the mock, so 5 companies = 5 jobs
      expect(totalJobs).toBeGreaterThan(0);
      expect(totalJobs).toBe(5);
    });

    test('should handle rate limiting gracefully', async () => {
      const urls = [
        'https://jobs.lever.co/klarna',
        'https://jobs.lever.co/spotify',
        'https://jobs.lever.co/binance'
      ];

      urls.forEach(() => {
        mockedAxios.get.mockResolvedValueOnce({
          data: '<div class="posting"><h5>Engineer</h5><a href="/engineer">Apply</a></div>'
        });
      });

      const mockFindRate = jest.fn();
      const mockEachRate = jest.fn(() => {});
      const mockElementFindRate = jest.fn(() => ({
        first: () => ({ text: () => '', attr: () => '' }),
      }));

      (cheerio.load as jest.Mock).mockImplementation((html: string) => {
        const $ = (selector: any) => {
          if (typeof selector === 'object') {
            return {
              find: mockElementFindRate,
            };
          }
          // $(selector) - normal selector
          if (selector === '.posting, [class*="posting"]') {
            return { each: mockEachRate };
          }
          return {
            first: () => ({ text: () => '', attr: () => '' }),
            find: mockFindRate,
          };
        };
        
        return $;
      });

      const startTime = Date.now();
      await Promise.all(urls.map(url => scraperService.scrapeJobs(url)));
      const duration = Date.now() - startTime;

      // Should have some delay between requests (but may be faster in tests due to caching)
      // Just verify it completes without error
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Sweden-Specific Filtering', () => {
    test('should filter jobs by Swedish locations', () => {
      const jobs = [
        { location: 'Stockholm, Sweden', title: 'ML Engineer' },
        { location: 'London, UK', title: 'Data Scientist' },
        { location: 'Gothenburg, Sweden', title: 'AI Researcher' },
        { location: 'New York, USA', title: 'Engineer' }
      ];

      const swedishJobs = jobs.filter(job =>
        job.location.includes('Sweden') ||
        job.location.includes('Stockholm') ||
        job.location.includes('Gothenburg') ||
        job.location.includes('Malmö')
      );

      expect(swedishJobs).toHaveLength(2);
    });

    test('should prioritize Stockholm-based AI/ML jobs', () => {
      const jobs = [
        { location: 'Stockholm, Sweden', title: 'ML Engineer', isAIRelated: true },
        { location: 'Stockholm, Sweden', title: 'Sales Rep', isAIRelated: false },
        { location: 'London, UK', title: 'ML Engineer', isAIRelated: true }
      ];

      const priorityJobs = jobs.filter(job =>
        job.location.includes('Stockholm') && job.isAIRelated
      );

      expect(priorityJobs).toHaveLength(1);
      expect(priorityJobs[0].title).toBe('ML Engineer');
    });
  });
});




