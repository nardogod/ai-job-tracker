/**
 * Profile Type Tests
 * 
 * TDD GREEN Phase - Tests updated to match Profile implementation
 */

import { describe, it, expect } from '@jest/globals';
import { ProfileSchema, type Profile, createProfile } from '../../../src/types/profile';

describe('Profile Type', () => {
  describe('ProfileSchema validation', () => {
    it('should accept a valid profile', () => {
      const validProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'candidate@example.com',
        experience_years: 5,
        skills: ['TypeScript', 'Node.js', 'Machine Learning'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit' as const,
        languages: {
          'English': 'native' as const,
          'Swedish': 'fluent' as const,
        },
        company_size_preference: 'any' as const,
        remote_preference: 'flexible' as const,
        min_salary: 80000,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProfileSchema.safeParse(validProfile);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('candidate@example.com');
        expect(result.data.skills).toHaveLength(3);
        expect(result.data.remote_preference).toBe('flexible');
      }
    });

    it('should reject profile with invalid email', () => {
      const invalidProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'invalid-email',
        experience_years: 5,
        skills: ['TypeScript'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit' as const,
        languages: {},
        company_size_preference: 'any' as const,
        remote_preference: 'flexible' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProfileSchema.safeParse(invalidProfile);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('email');
        expect(result.error.issues[0]?.code).toBe('invalid_format');
      }
    });

    it('should reject profile with empty skills array', () => {
      const invalidProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'candidate@example.com',
        experience_years: 5,
        skills: [],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit' as const,
        languages: {},
        company_size_preference: 'any' as const,
        remote_preference: 'flexible' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProfileSchema.safeParse(invalidProfile);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('skills');
      }
    });

    it('should reject profile with negative experience', () => {
      const invalidProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'candidate@example.com',
        experience_years: -1,
        skills: ['TypeScript'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit' as const,
        languages: {},
        company_size_preference: 'any' as const,
        remote_preference: 'flexible' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProfileSchema.safeParse(invalidProfile);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('experience_years');
      }
    });

    it('should reject profile with negative minSalary', () => {
      const invalidProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'candidate@example.com',
        experience_years: 5,
        skills: ['TypeScript'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit' as const,
        languages: {},
        company_size_preference: 'any' as const,
        remote_preference: 'flexible' as const,
        min_salary: -1000,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProfileSchema.safeParse(invalidProfile);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('min_salary');
      }
    });

    it('should reject profile with missing required fields', () => {
      const invalidProfile = {
        email: 'candidate@example.com',
        // Missing name, skills, experience_years, location_preference, visa_status, etc.
      };

      const result = ProfileSchema.safeParse(invalidProfile);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        const missingFields = result.error.issues.map((issue) => String(issue.path[0]));
        expect(missingFields).toContain('name');
        expect(missingFields).toContain('skills');
        expect(missingFields).toContain('experience_years');
        expect(missingFields).toContain('location_preference');
        expect(missingFields).toContain('visa_status');
      }
    });

    it('should accept profile with optional min_salary', () => {
      const validProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'candidate@example.com',
        experience_years: 5,
        skills: ['TypeScript'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit' as const,
        languages: {},
        company_size_preference: 'any' as const,
        remote_preference: 'flexible' as const,
        created_at: new Date(),
        updated_at: new Date(),
        // min_salary is optional
      };

      const result = ProfileSchema.safeParse(validProfile);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.min_salary).toBeUndefined();
      }
    });
  });

  describe('createProfile function', () => {
    it('should create profile with provided values', () => {
      const profileData = {
        name: 'John Doe',
        email: 'candidate@example.com',
        experience_years: 5,
        skills: ['TypeScript', 'Node.js'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit' as const,
        languages: {
          'English': 'native' as const,
        },
      };

      const profile = createProfile(profileData);

      expect(profile.email).toBe('candidate@example.com');
      expect(profile.name).toBe('John Doe');
      expect(profile.skills).toEqual(['TypeScript', 'Node.js']);
      expect(profile.experience_years).toBe(5);
      expect(profile.id).toBeDefined();
      expect(profile.created_at).toBeInstanceOf(Date);
      expect(profile.updated_at).toBeInstanceOf(Date);
    });

    it('should create profile with default values for optional fields', () => {
      const profileData = {
        name: 'John Doe',
        email: 'candidate@example.com',
        experience_years: 3,
        skills: ['TypeScript'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit' as const,
        languages: {},
      };

      const profile = createProfile(profileData);

      expect(profile.company_size_preference).toBe('any');
      expect(profile.remote_preference).toBe('flexible');
      expect(profile.languages).toEqual({});
      expect(profile.min_salary).toBeUndefined();
    });

    it('should validate profile data when creating', () => {
      const invalidProfileData = {
        name: 'John Doe',
        email: 'invalid-email',
        experience_years: 5,
        skills: ['TypeScript'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit' as const,
        languages: {},
      };

      expect(() => createProfile(invalidProfileData)).toThrow();
    });
  });

  describe('Zod parse functionality', () => {
    it('should parse valid profile using parse()', () => {
      const validProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'candidate@example.com',
        experience_years: 5,
        skills: ['TypeScript', 'Node.js'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit' as const,
        languages: {},
        company_size_preference: 'any' as const,
        remote_preference: 'flexible' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const parsed = ProfileSchema.parse(validProfile);

      expect(parsed).toBeDefined();
      expect(parsed.email).toBe('candidate@example.com');
    });

    it('should throw error on invalid profile using parse()', () => {
      const invalidProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'invalid-email',
        experience_years: -1,
        skills: [],
        location_preference: '',
        visa_status: 'has_permit' as const,
        languages: {},
        company_size_preference: 'any' as const,
        remote_preference: 'flexible' as const,
        min_salary: -1000,
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(() => ProfileSchema.parse(invalidProfile)).toThrow();
    });

    it('should return success result using safeParse()', () => {
      const validProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'candidate@example.com',
        experience_years: 5,
        skills: ['TypeScript'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit' as const,
        languages: {},
        company_size_preference: 'any' as const,
        remote_preference: 'flexible' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProfileSchema.safeParse(validProfile);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data.email).toBe('candidate@example.com');
      }
    });

    it('should return error result using safeParse() for invalid data', () => {
      const invalidProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '',
        email: 'invalid-email',
        experience_years: -5,
        skills: [],
        location_preference: '',
        visa_status: 'has_permit' as const,
        languages: {},
        company_size_preference: 'any' as const,
        remote_preference: 'flexible' as const,
        min_salary: -1000,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProfileSchema.safeParse(invalidProfile);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Type inference from schema', () => {
    it('should infer correct TypeScript type from ProfileSchema', () => {
      // This test validates that the type is correctly inferred
      // TypeScript compiler will catch type errors at compile time
      const validProfile: Profile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'candidate@example.com',
        experience_years: 5,
        skills: ['TypeScript'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'has_permit',
        languages: {
          'English': 'native',
        },
        company_size_preference: 'any',
        remote_preference: 'flexible',
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Type should match schema
      const parsed = ProfileSchema.parse(validProfile);
      
      // If types don't match, TypeScript will error at compile time
      expect(parsed).toEqual(validProfile);
    });
  });
});
