/**
 * /api/scrape API Route Tests
 * RED Phase - TDD
 * 
 * @jest-environment node
 */

import { POST } from '@/app/api/scrape/route';
import { JobScraper } from '@/lib/utils/scraper';

// Mock JobScraper
jest.mock('@/lib/utils/scraper');

describe('/api/scrape', () => {
  let mockScraper: jest.Mocked<JobScraper>;

  beforeEach(() => {
    mockScraper = new JobScraper() as jest.Mocked<JobScraper>;
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should return 400 if URL is missing', async () => {
      const request = new Request('http://localhost:3000/api/scrape', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error || data.details).toMatch(/URL|Invalid/i);
    });

    it('should return 400 if URL is invalid', async () => {
      const request = new Request('http://localhost:3000/api/scrape', {
        method: 'POST',
        body: JSON.stringify({ url: 'invalid-url' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return scraped jobs on success', async () => {
      const mockJobs = [
        {
          title: 'AI Engineer',
          company: 'Spotify',
          location: 'Stockholm',
          url: 'https://jobs.lever.co/spotify/ai-engineer',
        },
        {
          title: 'ML Engineer',
          company: 'Spotify',
          location: 'Stockholm',
          url: 'https://jobs.lever.co/spotify/ml-engineer',
        },
      ];

      (JobScraper.prototype.scrapeJobs as jest.Mock).mockResolvedValueOnce(mockJobs);
      (JobScraper.prototype.extractCompanyName as jest.Mock).mockReturnValueOnce('Spotify');

      const request = new Request('http://localhost:3000/api/scrape', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://jobs.lever.co/spotify' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jobs).toEqual(mockJobs);
      expect(data.company).toBe('Spotify');
      expect(data.jobs).toHaveLength(2);
    });

    it('should apply AI filter when filterAI is true', async () => {
      const mockJobs = [
        {
          title: 'AI Engineer',
          company: 'Spotify',
          location: 'Stockholm',
          url: 'https://jobs.lever.co/spotify/ai',
        },
      ];

      (JobScraper.prototype.scrapeJobs as jest.Mock).mockResolvedValueOnce(mockJobs);
      (JobScraper.prototype.extractCompanyName as jest.Mock).mockReturnValueOnce('Spotify');

      const request = new Request('http://localhost:3000/api/scrape', {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://jobs.lever.co/spotify',
          filterAI: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jobs).toHaveLength(1);
      expect(JobScraper.prototype.scrapeJobs).toHaveBeenCalledWith(
        'https://jobs.lever.co/spotify',
        { filterAI: true }
      );
    });

    it('should handle scraper errors gracefully', async () => {
      (JobScraper.prototype.scrapeJobs as jest.Mock).mockRejectedValueOnce(
        new Error('Scraping failed')
      );

      const request = new Request('http://localhost:3000/api/scrape', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://jobs.lever.co/spotify' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return empty jobs array if no jobs found', async () => {
      (JobScraper.prototype.scrapeJobs as jest.Mock).mockResolvedValueOnce([]);
      (JobScraper.prototype.extractCompanyName as jest.Mock).mockReturnValueOnce('Spotify');

      const request = new Request('http://localhost:3000/api/scrape', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://jobs.lever.co/spotify' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jobs).toEqual([]);
      expect(data.company).toBe('Spotify');
    });
  });
});

