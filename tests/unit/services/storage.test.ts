/**
 * StorageService Tests
 * 
 * TDD RED Phase - Tests written before implementation
 * These tests are expected to FAIL until StorageService is implemented
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import type { Profile } from '../../../src/types/profile';
import type { Job } from '../../../src/types/job';
import { createProfile } from '../../../src/types/profile';
import { createJob } from '../../../src/types/job';
import { createMatchScore } from '../../../src/types/match-score';

import { StorageService } from '../../../src/services/storage';


describe('StorageService', () => {
  let storage: StorageService;

  beforeEach(() => {
    storage = new StorageService(':memory:');
  });

  afterEach(() => {
    storage.close();
  });

  describe('Database initialization', () => {
    it('should create all required tables', () => {
      const tables = storage.getTables();
      
      expect(tables).toContain('profiles');
      expect(tables).toContain('jobs');
      expect(tables).toContain('match_scores');
    });

    it('should initialize with empty tables', () => {
      const profiles = storage.listProfiles();
      const jobs = storage.getJobs();
      
      expect(profiles).toEqual([]);
      expect(jobs).toEqual([]);
    });
  });

  describe('Profile operations', () => {
    it('should save and retrieve a profile', () => {
      const profile = createProfile({
        name: 'John Doe',
        email: 'john@example.com',
        experience_years: 5,
        skills: ['TypeScript', 'Node.js'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit',
        languages: {
          'English': 'native',
          'Swedish': 'fluent',
        },
      });

      storage.saveProfile(profile);
      const retrieved = storage.getProfile(profile.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(profile.id);
      expect(retrieved?.name).toBe('John Doe');
      expect(retrieved?.email).toBe('john@example.com');
      expect(retrieved?.skills).toEqual(['TypeScript', 'Node.js']);
      expect(retrieved?.languages).toEqual({
        'English': 'native',
        'Swedish': 'fluent',
      });
    });

    it('should return null for non-existent profile', () => {
      const profile = storage.getProfile('non-existent-id');
      
      expect(profile).toBeNull();
    });

    it('should get current profile when one exists', () => {
      const profile = createProfile({
        name: 'Jane Smith',
        email: 'jane@example.com',
        experience_years: 3,
        skills: ['Python'],
        location_preference: 'Gothenburg, Sweden',
        visa_status: 'eu_citizen',
        languages: {},
      });

      storage.saveProfile(profile);
      const current = storage.getCurrentProfile();

      expect(current).not.toBeNull();
      expect(current.id).toBe(profile.id);
    });

    it('should throw error when getting current profile and none exists', () => {
      expect(() => storage.getCurrentProfile()).toThrow();
    });

    it('should list all profiles', () => {
      const profile1 = createProfile({
        name: 'John Doe',
        email: 'john@example.com',
        experience_years: 5,
        skills: ['TypeScript'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit',
        languages: {},
      });

      const profile2 = createProfile({
        name: 'Jane Smith',
        email: 'jane@example.com',
        experience_years: 3,
        skills: ['Python'],
        location_preference: 'Gothenburg, Sweden',
        visa_status: 'eu_citizen',
        languages: {},
      });

      storage.saveProfile(profile1);
      storage.saveProfile(profile2);

      const profiles = storage.listProfiles();

      expect(profiles).toHaveLength(2);
      expect(profiles.map((p: Profile) => p.id)).toContain(profile1.id);
      expect(profiles.map((p: Profile) => p.id)).toContain(profile2.id);
    });

    it('should serialize and deserialize arrays correctly', () => {
      const profile = createProfile({
        name: 'John Doe',
        email: 'john@example.com',
        experience_years: 5,
        skills: ['TypeScript', 'Node.js', 'Machine Learning'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit',
        languages: {},
      });

      storage.saveProfile(profile);
      const retrieved = storage.getProfile(profile.id);

      expect(retrieved?.skills).toEqual(['TypeScript', 'Node.js', 'Machine Learning']);
      expect(retrieved?.skills).toHaveLength(3);
    });

    it('should serialize and deserialize objects correctly', () => {
      const profile = createProfile({
        name: 'John Doe',
        email: 'john@example.com',
        experience_years: 5,
        skills: ['TypeScript'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit',
        languages: {
          'English': 'native',
          'Swedish': 'fluent',
          'Spanish': 'intermediate',
        },
      });

      storage.saveProfile(profile);
      const retrieved = storage.getProfile(profile.id);

      expect(retrieved?.languages).toEqual({
        'English': 'native',
        'Swedish': 'fluent',
        'Spanish': 'intermediate',
      });
    });

    it('should serialize and deserialize dates correctly', () => {
      const profile = createProfile({
        name: 'John Doe',
        email: 'john@example.com',
        experience_years: 5,
        skills: ['TypeScript'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit',
        languages: {},
      });

      storage.saveProfile(profile);
      const retrieved = storage.getProfile(profile.id);

      expect(retrieved?.created_at).toBeInstanceOf(Date);
      expect(retrieved?.updated_at).toBeInstanceOf(Date);
      expect(retrieved?.created_at.getTime()).toBe(profile.created_at.getTime());
    });
  });

  describe('Job operations', () => {
    it('should save and retrieve a job by ID', () => {
      const job = createJob({
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'We are looking for...',
        requirements: ['5+ years experience', 'TypeScript'],
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date('2024-01-15'),
      });

      storage.saveJob(job);
      const retrieved = storage.getJobById(job.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(job.id);
      expect(retrieved?.title).toBe('Senior AI Engineer');
      expect(retrieved?.company).toBe('Tech Corp');
      expect(retrieved?.requirements).toEqual(['5+ years experience', 'TypeScript']);
    });

    it('should return null for non-existent job', () => {
      const job = storage.getJobById('non-existent-id');
      
      expect(job).toBeNull();
    });

    it('should retrieve a job by URL', () => {
      const job = createJob({
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'We are looking for...',
        requirements: ['5+ years experience'],
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      storage.saveJob(job);
      const retrieved = storage.getJobByUrl('https://example.com/jobs/123');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(job.id);
      expect(retrieved?.url).toBe('https://example.com/jobs/123');
    });

    it('should return null for non-existent URL', () => {
      const job = storage.getJobByUrl('https://example.com/jobs/999');
      
      expect(job).toBeNull();
    });

    it('should prevent duplicate URLs (UNIQUE constraint)', () => {
      const job1 = createJob({
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'We are looking for...',
        requirements: ['5+ years experience'],
        url: 'https://example.com/jobs/123',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      const job2 = createJob({
        title: 'AI Engineer',
        company: 'Another Corp',
        location: 'Gothenburg, Sweden',
        remote_type: 'remote',
        description: 'Different description',
        requirements: ['3+ years experience'],
        url: 'https://example.com/jobs/123', // Same URL
        source: 'manual',
        posted_date: new Date(),
      });

      storage.saveJob(job1);
      
      // Should throw error or prevent duplicate
      expect(() => storage.saveJob(job2)).toThrow();
    });

    it('should list all jobs', () => {
      const job1 = createJob({
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Job 1',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      const job2 = createJob({
        title: 'AI Engineer',
        company: 'Another Corp',
        location: 'Gothenburg, Sweden',
        remote_type: 'remote',
        description: 'Job 2',
        requirements: ['3+ years'],
        url: 'https://example.com/jobs/2',
        source: 'manual',
        posted_date: new Date(),
      });

      storage.saveJob(job1);
      storage.saveJob(job2);

      const jobs = storage.getJobs();

      expect(jobs).toHaveLength(2);
      expect(jobs.map((j: Job) => j.id)).toContain(job1.id);
      expect(jobs.map((j: Job) => j.id)).toContain(job2.id);
    });

    it('should filter jobs by status', () => {
      const job1 = createJob({
        title: 'Job 1',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'saved',
      });

      const job2 = createJob({
        title: 'Job 2',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/2',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'applied',
      });

      storage.saveJob(job1);
      storage.saveJob(job2);

      const savedJobs = storage.getJobs({ status: 'saved' });
      const appliedJobs = storage.getJobs({ status: 'applied' });

      expect(savedJobs).toHaveLength(1);
      expect(savedJobs[0]?.id).toBe(job1.id);
      expect(appliedJobs).toHaveLength(1);
      expect(appliedJobs[0]?.id).toBe(job2.id);
    });

    it('should filter jobs by company', () => {
      const job1 = createJob({
        title: 'Job 1',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      const job2 = createJob({
        title: 'Job 2',
        company: 'Another Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/2',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      storage.saveJob(job1);
      storage.saveJob(job2);

      const techCorpJobs = storage.getJobs({ company: 'Tech Corp' });

      expect(techCorpJobs).toHaveLength(1);
      expect(techCorpJobs[0]?.company).toBe('Tech Corp');
    });

    it('should filter jobs by location', () => {
      const job1 = createJob({
        title: 'Job 1',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      const job2 = createJob({
        title: 'Job 2',
        company: 'Tech Corp',
        location: 'Gothenburg, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/2',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      storage.saveJob(job1);
      storage.saveJob(job2);

      const stockholmJobs = storage.getJobs({ location: 'Stockholm, Sweden' });

      expect(stockholmJobs).toHaveLength(1);
      expect(stockholmJobs[0]?.location).toBe('Stockholm, Sweden');
    });

    it('should filter jobs by minMatch (overall_score from MatchScore)', () => {
      const job1 = createJob({
        title: 'Job 1',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      const job2 = createJob({
        title: 'Job 2',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/2',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      storage.saveJob(job1);
      storage.saveJob(job2);

      const matchScore1 = createMatchScore({
        job_id: job1.id,
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        recommendation: 'strong_apply',
      });

      const matchScore2 = createMatchScore({
        job_id: job2.id,
        overall_score: 60,
        skills_match: 70,
        experience_match: 60,
        location_match: 80,
        company_match: 50,
        requirements_match: 60,
        recommendation: 'apply',
      });

      storage.saveMatchScore(matchScore1);
      storage.saveMatchScore(matchScore2);

      const highMatchJobs = storage.getJobs({ minMatch: 80 });

      expect(highMatchJobs).toHaveLength(1);
      expect(highMatchJobs[0]?.id).toBe(job1.id);
    });

    it('should combine multiple filters', () => {
      const job1 = createJob({
        title: 'Job 1',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'saved',
      });

      const job2 = createJob({
        title: 'Job 2',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/2',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'applied',
      });

      storage.saveJob(job1);
      storage.saveJob(job2);

      const filtered = storage.getJobs({
        company: 'Tech Corp',
        status: 'saved',
        location: 'Stockholm, Sweden',
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe(job1.id);
    });

    it('should update job status', () => {
      const job = createJob({
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'saved',
      });

      storage.saveJob(job);
      storage.updateJobStatus(job.id, 'applied');

      const updated = storage.getJobById(job.id);

      expect(updated?.status).toBe('applied');
    });

    it('should throw error when updating non-existent job', () => {
      expect(() => storage.updateJobStatus('non-existent-id', 'applied')).toThrow();
    });

    it('should delete a job', () => {
      const job = createJob({
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      storage.saveJob(job);
      storage.deleteJob(job.id);

      const deleted = storage.getJobById(job.id);
      expect(deleted).toBeNull();
    });

    it('should cascade delete MatchScore when Job is deleted', () => {
      const job = createJob({
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      storage.saveJob(job);

      const matchScore = createMatchScore({
        job_id: job.id,
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        recommendation: 'strong_apply',
      });

      storage.saveMatchScore(matchScore);
      storage.deleteJob(job.id);

      const deletedMatchScore = storage.getMatchScore(job.id);
      expect(deletedMatchScore).toBeNull();
    });

    it('should serialize and deserialize job arrays correctly', () => {
      const job = createJob({
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years experience', 'TypeScript', 'Node.js'],
        nice_to_have: ['PhD', 'Published papers'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      storage.saveJob(job);
      const retrieved = storage.getJobById(job.id);

      expect(retrieved?.requirements).toEqual(['5+ years experience', 'TypeScript', 'Node.js']);
      expect(retrieved?.nice_to_have).toEqual(['PhD', 'Published papers']);
    });

    it('should serialize and deserialize job dates correctly', () => {
      const postedDate = new Date('2024-01-15');
      const job = createJob({
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: postedDate,
      });

      storage.saveJob(job);
      const retrieved = storage.getJobById(job.id);

      expect(retrieved?.posted_date).toBeInstanceOf(Date);
      expect(retrieved?.posted_date.getTime()).toBe(postedDate.getTime());
      expect(retrieved?.created_at).toBeInstanceOf(Date);
      expect(retrieved?.updated_at).toBeInstanceOf(Date);
    });
  });

  describe('MatchScore operations', () => {
    it('should save and retrieve a match score', () => {
      const job = createJob({
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      storage.saveJob(job);

      const matchScore = createMatchScore({
        job_id: job.id,
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: ['Docker'],
        matching_skills: ['TypeScript', 'Node.js'],
        recommendation: 'strong_apply',
        details: 'Excellent match',
      });

      storage.saveMatchScore(matchScore);
      const retrieved = storage.getMatchScore(job.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.job_id).toBe(job.id);
      expect(retrieved?.overall_score).toBe(85);
      expect(retrieved?.recommendation).toBe('strong_apply');
      expect(retrieved?.missing_skills).toEqual(['Docker']);
      expect(retrieved?.matching_skills).toEqual(['TypeScript', 'Node.js']);
    });

    it('should return null for non-existent match score', () => {
      const matchScore = storage.getMatchScore('non-existent-job-id');
      
      expect(matchScore).toBeNull();
    });

    it('should get top matches ordered by overall_score', () => {
      const job1 = createJob({
        title: 'Job 1',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      const job2 = createJob({
        title: 'Job 2',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/2',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      const job3 = createJob({
        title: 'Job 3',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/3',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      storage.saveJob(job1);
      storage.saveJob(job2);
      storage.saveJob(job3);

      const matchScore1 = createMatchScore({
        job_id: job1.id,
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        recommendation: 'strong_apply',
      });

      const matchScore2 = createMatchScore({
        job_id: job2.id,
        overall_score: 75,
        skills_match: 80,
        experience_match: 70,
        location_match: 80,
        company_match: 70,
        requirements_match: 75,
        recommendation: 'apply',
      });

      const matchScore3 = createMatchScore({
        job_id: job3.id,
        overall_score: 90,
        skills_match: 95,
        experience_match: 85,
        location_match: 100,
        company_match: 80,
        requirements_match: 90,
        recommendation: 'strong_apply',
      });

      storage.saveMatchScore(matchScore1);
      storage.saveMatchScore(matchScore2);
      storage.saveMatchScore(matchScore3);

      const topMatches = storage.getTopMatches(2);

      expect(topMatches).toHaveLength(2);
      expect(topMatches[0]?.overall_score).toBe(90); // Highest first
      expect(topMatches[1]?.overall_score).toBe(85); // Second highest
    });

    it('should serialize and deserialize match score arrays correctly', () => {
      const job = createJob({
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      storage.saveJob(job);

      const matchScore = createMatchScore({
        job_id: job.id,
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: ['Docker', 'Kubernetes'],
        matching_skills: ['TypeScript', 'Node.js', 'Machine Learning'],
        recommendation: 'strong_apply',
      });

      storage.saveMatchScore(matchScore);
      const retrieved = storage.getMatchScore(job.id);

      expect(retrieved?.missing_skills).toEqual(['Docker', 'Kubernetes']);
      expect(retrieved?.matching_skills).toEqual(['TypeScript', 'Node.js', 'Machine Learning']);
    });

    it('should serialize and deserialize match score dates correctly', () => {
      const job = createJob({
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      storage.saveJob(job);

      const matchScore = createMatchScore({
        job_id: job.id,
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        recommendation: 'strong_apply',
      });

      storage.saveMatchScore(matchScore);
      const retrieved = storage.getMatchScore(job.id);

      expect(retrieved?.created_at).toBeInstanceOf(Date);
    });
  });

  describe('Complex queries', () => {
    it('should handle empty filters', () => {
      const job = createJob({
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
      });

      storage.saveJob(job);

      const jobs = storage.getJobs({});

      expect(jobs).toHaveLength(1);
    });

    it('should handle filters with no matches', () => {
      const job = createJob({
        title: 'Senior AI Engineer',
        company: 'Tech Corp',
        location: 'Stockholm, Sweden',
        remote_type: 'hybrid',
        description: 'Description',
        requirements: ['5+ years'],
        url: 'https://example.com/jobs/1',
        source: 'arbetsformedlingen',
        posted_date: new Date(),
        status: 'saved',
      });

      storage.saveJob(job);

      const jobs = storage.getJobs({ status: 'applied' });

      expect(jobs).toHaveLength(0);
    });

    it('should close database connection', () => {
      expect(() => storage.close()).not.toThrow();
      
      // After close, operations should fail or throw
      expect(() => storage.getJobs()).toThrow();
    });
  });
});
