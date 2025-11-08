/**
 * MatchScore Type Tests
 * 
 * TDD RED Phase - Tests written before implementation
 * These tests are expected to FAIL until MatchScore is implemented
 */

import { describe, it, expect } from '@jest/globals';

import { MatchScoreSchema, type MatchScore, createMatchScore } from '../../../src/types/match-score';

describe('MatchScore Type', () => {
  describe('MatchScoreSchema validation', () => {
    it('should accept a valid match score', () => {
      const validMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: ['Docker', 'Kubernetes'],
        matching_skills: ['TypeScript', 'Node.js', 'Machine Learning'],
        recommendation: 'strong_apply' as const,
        details: 'Strong match with excellent skills alignment',
        created_at: new Date(),
      };

      const result = MatchScoreSchema.safeParse(validMatchScore);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.overall_score).toBe(85);
        expect(result.data.recommendation).toBe('strong_apply');
        expect(result.data.matching_skills).toHaveLength(3);
      }
    });

    it('should reject match score with overall_score > 100', () => {
      const invalidMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 150,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: [],
        matching_skills: ['TypeScript'],
        recommendation: 'strong_apply' as const,
        created_at: new Date(),
      };

      const result = MatchScoreSchema.safeParse(invalidMatchScore);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('overall_score');
      }
    });

    it('should reject match score with overall_score < 0', () => {
      const invalidMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: -10,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: [],
        matching_skills: ['TypeScript'],
        recommendation: 'strong_apply' as const,
        created_at: new Date(),
      };

      const result = MatchScoreSchema.safeParse(invalidMatchScore);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('overall_score');
      }
    });

    it('should reject match score with skills_match > 100', () => {
      const invalidMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 85,
        skills_match: 150,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: [],
        matching_skills: ['TypeScript'],
        recommendation: 'strong_apply' as const,
        created_at: new Date(),
      };

      const result = MatchScoreSchema.safeParse(invalidMatchScore);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('skills_match');
      }
    });

    it('should reject match score with invalid recommendation', () => {
      const invalidMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: [],
        matching_skills: ['TypeScript'],
        recommendation: 'invalid_recommendation' as any,
        created_at: new Date(),
      };

      const result = MatchScoreSchema.safeParse(invalidMatchScore);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('recommendation');
      }
    });

    it('should reject match score with overlapping skills', () => {
      const invalidMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: ['TypeScript', 'Docker'],
        matching_skills: ['TypeScript', 'Node.js'], // TypeScript appears in both
        recommendation: 'strong_apply' as const,
        created_at: new Date(),
      };

      const result = MatchScoreSchema.safeParse(invalidMatchScore);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have error related to overlapping skills
        const errorMessages = result.error.issues.map((issue: { message: string }) => issue.message);
        expect(errorMessages.some((msg: string) => msg.toLowerCase().includes('overlap') || msg.toLowerCase().includes('duplicate'))).toBe(true);
      }
    });

    it('should reject match score with strong_apply and overall_score < 80', () => {
      const invalidMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 75, // Invalid: < 80 for strong_apply
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: [],
        matching_skills: ['TypeScript'],
        recommendation: 'strong_apply' as const,
        created_at: new Date(),
      };

      const result = MatchScoreSchema.safeParse(invalidMatchScore);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have error related to recommendation vs overall_score inconsistency
        const errorMessages = result.error.issues.map((issue: { message: string }) => issue.message);
        expect(errorMessages.some((msg: string) => msg.toLowerCase().includes('strong_apply') || msg.toLowerCase().includes('overall_score'))).toBe(true);
      }
    });

    it('should reject match score with skip and overall_score >= 40', () => {
      const invalidMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 50, // Invalid: >= 40 for skip
        skills_match: 40,
        experience_match: 30,
        location_match: 50,
        company_match: 60,
        requirements_match: 45,
        missing_skills: ['TypeScript', 'Docker'],
        matching_skills: [],
        recommendation: 'skip' as const,
        created_at: new Date(),
      };

      const result = MatchScoreSchema.safeParse(invalidMatchScore);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have error related to recommendation vs overall_score inconsistency
        const errorMessages = result.error.issues.map((issue: { message: string }) => issue.message);
        expect(errorMessages.some((msg: string) => msg.toLowerCase().includes('skip') || msg.toLowerCase().includes('overall_score'))).toBe(true);
      }
    });

    it('should accept match score with strong_apply and overall_score >= 80', () => {
      const validMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: [],
        matching_skills: ['TypeScript', 'Node.js'],
        recommendation: 'strong_apply' as const,
        created_at: new Date(),
      };

      const result = MatchScoreSchema.safeParse(validMatchScore);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.overall_score).toBe(85);
        expect(result.data.recommendation).toBe('strong_apply');
      }
    });

    it('should accept match score with skip and overall_score < 40', () => {
      const validMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 35,
        skills_match: 30,
        experience_match: 25,
        location_match: 40,
        company_match: 30,
        requirements_match: 35,
        missing_skills: ['TypeScript', 'Docker', 'Kubernetes'],
        matching_skills: ['Python'],
        recommendation: 'skip' as const,
        created_at: new Date(),
      };

      const result = MatchScoreSchema.safeParse(validMatchScore);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.overall_score).toBe(35);
        expect(result.data.recommendation).toBe('skip');
      }
    });

    it('should reject match score with missing required fields', () => {
      const invalidMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 85,
        // Missing: skills_match, experience_match, location_match, company_match, requirements_match, recommendation, created_at
      };

      const result = MatchScoreSchema.safeParse(invalidMatchScore);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        const missingFields = result.error.issues.map((issue) => String(issue.path[0]));
        expect(missingFields).toContain('skills_match');
        expect(missingFields).toContain('experience_match');
        expect(missingFields).toContain('location_match');
        expect(missingFields).toContain('company_match');
        expect(missingFields).toContain('requirements_match');
        expect(missingFields).toContain('recommendation');
        expect(missingFields).toContain('created_at');
      }
    });

    it('should accept match score with optional fields', () => {
      const validMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 75,
        skills_match: 80,
        experience_match: 70,
        location_match: 80,
        company_match: 70,
        requirements_match: 75,
        missing_skills: [],
        matching_skills: [],
        recommendation: 'apply' as const,
        created_at: new Date(),
        // details is optional
      };

      const result = MatchScoreSchema.safeParse(validMatchScore);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.details).toBeUndefined();
        expect(result.data.missing_skills).toEqual([]);
        expect(result.data.matching_skills).toEqual([]);
      }
    });

    it('should accept match score with all fields provided', () => {
      const validMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: ['Docker'],
        matching_skills: ['TypeScript', 'Node.js', 'Machine Learning'],
        recommendation: 'strong_apply' as const,
        details: 'Excellent match with strong technical alignment',
        created_at: new Date(),
      };

      const result = MatchScoreSchema.safeParse(validMatchScore);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.details).toBe('Excellent match with strong technical alignment');
        expect(result.data.missing_skills).toEqual(['Docker']);
        expect(result.data.matching_skills).toEqual(['TypeScript', 'Node.js', 'Machine Learning']);
      }
    });
  });

  describe('createMatchScore function', () => {
    it('should create match score with provided values', () => {
      const matchScoreData = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        matching_skills: ['TypeScript', 'Node.js'],
        recommendation: 'strong_apply' as const,
      };

      const matchScore = createMatchScore(matchScoreData);

      expect(matchScore.overall_score).toBe(85);
      expect(matchScore.job_id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(matchScore.matching_skills).toEqual(['TypeScript', 'Node.js']);
      expect(matchScore.created_at).toBeInstanceOf(Date);
    });

    it('should create match score with default values for optional fields', () => {
      const matchScoreData = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 75,
        skills_match: 80,
        experience_match: 70,
        location_match: 80,
        company_match: 70,
        requirements_match: 75,
        recommendation: 'apply' as const,
      };

      const matchScore = createMatchScore(matchScoreData);

      expect(matchScore.missing_skills).toEqual([]);
      expect(matchScore.matching_skills).toEqual([]);
      expect(matchScore.details).toBeUndefined();
    });

    it('should validate match score data when creating', () => {
      const invalidMatchScoreData = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 150, // Invalid: > 100
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        recommendation: 'strong_apply' as const,
      };

      expect(() => createMatchScore(invalidMatchScoreData)).toThrow();
    });

    it('should validate overlapping skills when creating', () => {
      const invalidMatchScoreData = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: ['TypeScript'],
        matching_skills: ['TypeScript'], // Overlap
        recommendation: 'strong_apply' as const,
      };

      expect(() => createMatchScore(invalidMatchScoreData)).toThrow();
    });

    it('should validate recommendation vs overall_score when creating', () => {
      const invalidMatchScoreData = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 75, // Invalid: < 80 for strong_apply
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        recommendation: 'strong_apply' as const,
      };

      expect(() => createMatchScore(invalidMatchScoreData)).toThrow();
    });
  });

  describe('Zod parse functionality', () => {
    it('should parse valid match score using parse()', () => {
      const validMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: [],
        matching_skills: ['TypeScript', 'Node.js'],
        recommendation: 'strong_apply' as const,
        created_at: new Date(),
      };

      const parsed = MatchScoreSchema.parse(validMatchScore);

      expect(parsed).toBeDefined();
      expect(parsed.overall_score).toBe(85);
    });

    it('should throw error on invalid match score using parse()', () => {
      const invalidMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 150,
        skills_match: 200,
        experience_match: -10,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: ['TypeScript'],
        matching_skills: ['TypeScript'], // Overlap
        recommendation: 'strong_apply' as const,
        created_at: new Date(),
      };

      expect(() => MatchScoreSchema.parse(invalidMatchScore)).toThrow();
    });

    it('should return success result using safeParse()', () => {
      const validMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: [],
        matching_skills: ['TypeScript'],
        recommendation: 'strong_apply' as const,
        created_at: new Date(),
      };

      const result = MatchScoreSchema.safeParse(validMatchScore);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data.overall_score).toBe(85);
      }
    });

    it('should return error result using safeParse() for invalid data', () => {
      const invalidMatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 150,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: ['TypeScript'],
        matching_skills: ['TypeScript'], // Overlap
        recommendation: 'invalid_recommendation' as any,
        created_at: new Date(),
      };

      const result = MatchScoreSchema.safeParse(invalidMatchScore);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Type inference from schema', () => {
    it('should infer correct TypeScript type from MatchScoreSchema', () => {
      // This test validates that the type is correctly inferred
      // TypeScript compiler will catch type errors at compile time
      const validMatchScore: MatchScore = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 75,
        requirements_match: 85,
        missing_skills: [],
        matching_skills: ['TypeScript'],
        recommendation: 'strong_apply',
        created_at: new Date(),
      };

      // Type should match schema
      const parsed = MatchScoreSchema.parse(validMatchScore);
      
      // If types don't match, TypeScript will error at compile time
      expect(parsed).toEqual(validMatchScore);
    });
  });
});

