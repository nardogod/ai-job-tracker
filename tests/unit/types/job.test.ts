/**
 * Job Type Tests
 * 
 * TDD RED Phase - Tests written before implementation
 * These tests are expected to FAIL until Job is implemented
 */

import { describe, it, expect } from '@jest/globals';

import { JobSchema, type Job, createJob } from '../../../src/types/job';

describe('Job Type', () => {
  describe('JobSchema validation', () => {
    it('should accept a valid job', () => {
      const validJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience', 'TypeScript', 'Machine Learning'],
        nice_to_have: ['PhD', 'Published papers'],
        salary_min: 80000,
        salary_max: 120000,
        salary_currency: 'SEK',
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date('2024-01-15'),
        status: 'saved' as const,
        notes: 'Interesting opportunity',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = JobSchema.safeParse(validJob);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Senior AI Engineer');
        expect(result.data.company).toBe('Tech Corp');
        expect(result.data.requirements).toHaveLength(3);
        expect(result.data.status).toBe('saved');
      }
    });

    it('should reject job with invalid URL', () => {
      const invalidJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience'],
        nice_to_have: [],
        url: 'not-a-valid-url',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'saved' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = JobSchema.safeParse(invalidJob);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('url');
        expect(result.error.issues[0]?.code).toBe('invalid_format');
      }
    });

    it('should reject job with empty title', () => {
      const invalidJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: '',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience'],
        nice_to_have: [],
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'saved' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = JobSchema.safeParse(invalidJob);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('title');
      }
    });

    it('should reject job with empty company', () => {
      const invalidJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior AI Engineer',
        company: '',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience'],
        nice_to_have: [],
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'saved' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = JobSchema.safeParse(invalidJob);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('company');
      }
    });

    it('should reject job with empty requirements array', () => {
      const invalidJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: [],
        nice_to_have: [],
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'saved' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = JobSchema.safeParse(invalidJob);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('requirements');
      }
    });

    it('should reject job with salary_max less than salary_min', () => {
      const invalidJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience'],
        nice_to_have: [],
        salary_min: 120000,
        salary_max: 80000, // Invalid: max < min
        salary_currency: 'SEK',
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'saved' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = JobSchema.safeParse(invalidJob);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have error related to salary_max or salary_min
        const errorPaths = result.error.issues.map((issue) => String(issue.path[0]));
        expect(errorPaths.some((path: string) => path === 'salary_max' || path === 'salary_min')).toBe(true);
      }
    });

    it('should reject job with negative salary_min', () => {
      const invalidJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience'],
        nice_to_have: [],
        salary_min: -1000,
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'saved' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = JobSchema.safeParse(invalidJob);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('salary_min');
      }
    });

    it('should reject job with invalid status', () => {
      const invalidJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience'],
        nice_to_have: [],
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'invalid_status' as any, // Invalid status
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = JobSchema.safeParse(invalidJob);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('status');
      }
    });

    it('should reject job with invalid remote_type', () => {
      const invalidJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'invalid_type' as any, // Invalid remote_type
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience'],
        nice_to_have: [],
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'saved' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = JobSchema.safeParse(invalidJob);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('remote_type');
      }
    });

    it('should reject job with missing required fields', () => {
      const invalidJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior AI Engineer',
        // Missing: company, location, remote_type, description, requirements, url, source, posted_date, status
      };

      const result = JobSchema.safeParse(invalidJob);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        const missingFields = result.error.issues.map((issue) => String(issue.path[0]));
        expect(missingFields).toContain('company');
        expect(missingFields).toContain('location');
        expect(missingFields).toContain('remote_type');
        expect(missingFields).toContain('description');
        expect(missingFields).toContain('requirements');
        expect(missingFields).toContain('url');
        expect(missingFields).toContain('source');
        expect(missingFields).toContain('posted_date');
        // status has default, so it's not required
      }
    });

    it('should accept job with optional fields', () => {
      const validJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience'],
        nice_to_have: ['PhD'],
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'saved' as const,
        created_at: new Date(),
        updated_at: new Date(),
        // Optional fields: salary_min, salary_max, salary_currency, notes
      };

      const result = JobSchema.safeParse(validJob);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.salary_min).toBeUndefined();
        expect(result.data.salary_max).toBeUndefined();
        expect(result.data.salary_currency).toBeUndefined();
        expect(result.data.notes).toBeUndefined();
        expect(result.data.nice_to_have).toEqual(['PhD']);
      }
    });

    it('should accept job with all optional fields provided', () => {
      const validJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'remote' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience', 'TypeScript'],
        nice_to_have: ['PhD', 'Published papers'],
        salary_min: 80000,
        salary_max: 120000,
        salary_currency: 'SEK',
        url: 'https://example.com/jobs/123',
        source: 'manual',
        posted_date: new Date('2024-01-15'),
        status: 'applied' as const,
        notes: 'Applied on 2024-01-20',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = JobSchema.safeParse(validJob);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.salary_min).toBe(80000);
        expect(result.data.salary_max).toBe(120000);
        expect(result.data.salary_currency).toBe('SEK');
        expect(result.data.notes).toBe('Applied on 2024-01-20');
        expect(result.data.status).toBe('applied');
      }
    });
  });

  describe('createJob function', () => {
    it('should create job with provided values', () => {
      const jobData = {
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience', 'TypeScript'],
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date('2024-01-15'),
      };

      const job = createJob(jobData);

      expect(job.title).toBe('Senior AI Engineer');
      expect(job.company).toBe('Tech Corp');
      expect(job.requirements).toEqual(['5+ years experience', 'TypeScript']);
      expect(job.id).toBeDefined();
      expect(job.created_at).toBeInstanceOf(Date);
      expect(job.updated_at).toBeInstanceOf(Date);
    });

    it('should create job with default values for optional fields', () => {
      const jobData = {
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience'],
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      };

      const job = createJob(jobData);

      expect(job.status).toBe('saved');
      expect(job.nice_to_have).toEqual([]);
      expect(job.salary_min).toBeUndefined();
      expect(job.salary_max).toBeUndefined();
      expect(job.salary_currency).toBeUndefined();
      expect(job.notes).toBeUndefined();
    });

    it('should validate job data when creating', () => {
      const invalidJobData = {
        title: '',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience'],
        url: 'not-a-valid-url',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      };

      expect(() => createJob(invalidJobData)).toThrow();
    });

    it('should validate salary_max >= salary_min when creating', () => {
      const invalidJobData = {
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience'],
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        salary_min: 120000,
        salary_max: 80000, // Invalid: max < min
      };

      expect(() => createJob(invalidJobData)).toThrow();
    });
  });

  describe('Zod parse functionality', () => {
    it('should parse valid job using parse()', () => {
      const validJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience', 'TypeScript'],
        nice_to_have: [],
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'saved' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const parsed = JobSchema.parse(validJob);

      expect(parsed).toBeDefined();
      expect(parsed.title).toBe('Senior AI Engineer');
    });

    it('should throw error on invalid job using parse()', () => {
      const invalidJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: '',
        company: '',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: '',
        requirements: [],
        nice_to_have: [],
        url: 'invalid-url',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'invalid_status' as any,
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(() => JobSchema.parse(invalidJob)).toThrow();
    });

    it('should return success result using safeParse()', () => {
      const validJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid' as const,
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience'],
        nice_to_have: [],
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'saved' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = JobSchema.safeParse(validJob);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data.title).toBe('Senior AI Engineer');
      }
    });

    it('should return error result using safeParse() for invalid data', () => {
      const invalidJob = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: '',
        company: '',
        location: '',
        remote_type: 'invalid_type' as any,
        description: '',
        requirements: [],
        nice_to_have: [],
        url: 'invalid-url',
        source: '',
        posted_date: new Date(),
        status: 'invalid_status' as any,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = JobSchema.safeParse(invalidJob);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Type inference from schema', () => {
    it('should infer correct TypeScript type from JobSchema', () => {
      // This test validates that the type is correctly inferred
      // TypeScript compiler will catch type errors at compile time
      const validJob: Job = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'We are looking for an experienced AI Engineer...',
        requirements: ['5+ years experience'],
        nice_to_have: [],
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'saved',
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Type should match schema
      const parsed = JobSchema.parse(validJob);
      
      // If types don't match, TypeScript will error at compile time
      expect(parsed).toEqual(validJob);
    });
  });
});

