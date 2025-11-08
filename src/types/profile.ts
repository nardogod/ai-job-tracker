/**
 * Profile Type Definition
 * 
 * Defines the schema and type for user profile using Zod for runtime validation
 * and type inference. This module provides type-safe profile creation and validation
 * for the AI Job Tracker application.
 */

import { z } from 'zod';
import { randomUUID } from 'crypto';

/**
 * Language proficiency levels
 * 
 * Represents the proficiency level of a language:
 * - native: Native speaker
 * - fluent: Fluent speaker
 * - intermediate: Intermediate level
 * - basic: Basic level
 */
export const LANGUAGE_PROFICIENCY = ['native', 'fluent', 'intermediate', 'basic'] as const;

/**
 * Visa status options
 * 
 * Represents the work authorization status:
 * - has_permit: Already has work permit
 * - needs_sponsorship: Requires visa sponsorship
 * - eu_citizen: EU citizen (no visa needed)
 */
export const VISA_STATUS = ['has_permit', 'needs_sponsorship', 'eu_citizen'] as const;

/**
 * Company size preferences
 * 
 * Represents preferred company size:
 * - startup: Early-stage startup
 * - scaleup: Growing company
 * - corporate: Large corporation
 * - any: No preference
 */
export const COMPANY_SIZE_PREFERENCE = ['startup', 'scaleup', 'corporate', 'any'] as const;

/**
 * Remote work preferences
 * 
 * Represents preferred work arrangement:
 * - office: On-site only
 * - hybrid: Mix of remote and office
 * - remote: Fully remote
 * - flexible: Flexible arrangement
 */
export const REMOTE_PREFERENCE = ['office', 'hybrid', 'remote', 'flexible'] as const;

/**
 * Language proficiency schema
 */
const LanguageProficiencySchema = z.enum(LANGUAGE_PROFICIENCY);

/**
 * Visa status schema
 */
const VisaStatusSchema = z.enum(VISA_STATUS);

/**
 * Company size preference schema
 */
const CompanySizePreferenceSchema = z.enum(COMPANY_SIZE_PREFERENCE);

/**
 * Remote work preference schema
 */
const RemotePreferenceSchema = z.enum(REMOTE_PREFERENCE);

/**
 * Profile Schema using Zod
 * 
 * Validates profile data at runtime and provides type inference.
 * This schema ensures all profile data meets the required format and constraints.
 * 
 * @example
 * ```ts
 * const result = ProfileSchema.safeParse({
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   experience_years: 5,
 *   skills: ['TypeScript', 'Node.js'],
 *   location_preference: 'Stockholm, Sweden',
 *   visa_status: 'has_permit',
 *   languages: { 'English': 'native' },
 *   company_size_preference: 'any',
 *   remote_preference: 'flexible',
 *   created_at: new Date(),
 *   updated_at: new Date(),
 * });
 * ```
 */
export const ProfileSchema = z.object({
  /**
   * Unique identifier for the profile (UUID v4)
   */
  id: z.string().uuid('ID must be a valid UUID'),

  /**
   * Full name of the candidate
   */
  name: z.string().min(1, 'Name is required and cannot be empty'),

  /**
   * Email address of the candidate (must be valid email format)
   */
  email: z.string().email('Invalid email address format'),

  /**
   * Years of professional experience (must be >= 0)
   */
  experience_years: z.number().int('Experience years must be an integer').min(0, 'Experience years must be >= 0'),

  /**
   * Array of technical skills (must have at least one skill)
   */
  skills: z.array(z.string().min(1, 'Each skill must be a non-empty string')).min(1, 'At least one skill is required'),

  /**
   * Preferred job location
   */
  location_preference: z.string().min(1, 'Location preference is required and cannot be empty'),

  /**
   * Work authorization status
   */
  visa_status: VisaStatusSchema,

  /**
   * Language proficiencies as a record of language name -> proficiency level
   * Example: { 'English': 'native', 'Swedish': 'fluent' }
   */
  languages: z.record(z.string().min(1, 'Language name cannot be empty'), LanguageProficiencySchema),

  /**
   * Preferred company size
   */
  company_size_preference: CompanySizePreferenceSchema,

  /**
   * Preferred work arrangement (remote/office/hybrid)
   */
  remote_preference: RemotePreferenceSchema,

  /**
   * Minimum acceptable salary (optional, must be >= 0 if provided)
   */
  min_salary: z.number().min(0, 'Minimum salary must be >= 0').optional(),

  /**
   * Profile creation timestamp
   */
  created_at: z.date(),

  /**
   * Profile last update timestamp
   */
  updated_at: z.date(),
});

/**
 * Profile type inferred from Zod schema
 * 
 * This type is automatically inferred from ProfileSchema, ensuring type safety
 * and keeping the schema as the single source of truth.
 */
export type Profile = z.infer<typeof ProfileSchema>;

/**
 * Type helpers for Profile fields
 */

/**
 * Visa status type
 */
export type VisaStatus = Profile['visa_status'];

/**
 * Remote preference type
 */
export type RemotePreference = Profile['remote_preference'];

/**
 * Company size preference type
 */
export type CompanySizePreference = Profile['company_size_preference'];

/**
 * Language proficiency type
 */
export type LanguageProficiency = Profile['languages'][string];

/**
 * Default values for Profile creation
 * 
 * These defaults are applied when creating a new profile if not explicitly provided.
 */
const DEFAULT_PROFILE_VALUES: Partial<Profile> = {
  company_size_preference: 'any',
  remote_preference: 'flexible',
  languages: {},
  created_at: new Date(),
  updated_at: new Date(),
};

/**
 * Creates a new Profile with validation
 * 
 * This function creates a validated Profile instance with automatic UUID generation
 * and timestamp management. All required fields must be provided, and optional
 * fields will use sensible defaults.
 * 
 * @param data - Partial profile data (will be merged with defaults)
 * @returns Validated Profile with generated UUID and timestamps
 * @throws {z.ZodError} If validation fails, a ZodError is thrown with detailed error messages
 * 
 * @example
 * ```ts
 * // Create a profile with required fields only
 * const profile = createProfile({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   experience_years: 5,
 *   skills: ['TypeScript', 'Node.js'],
 *   location_preference: 'Stockholm, Sweden',
 *   visa_status: 'has_permit',
 * });
 * 
 * // Create a profile with all fields
 * const fullProfile = createProfile({
 *   name: 'Jane Smith',
 *   email: 'jane@example.com',
 *   experience_years: 8,
 *   skills: ['Python', 'Machine Learning'],
 *   location_preference: 'Gothenburg, Sweden',
 *   visa_status: 'eu_citizen',
 *   languages: { 'English': 'native', 'Swedish': 'fluent' },
 *   company_size_preference: 'scaleup',
 *   remote_preference: 'hybrid',
 *   min_salary: 90000,
 * });
 * ```
 */
export function createProfile(data: Partial<Profile>): Profile {
  const now = new Date();
  
  const profileData: Partial<Profile> = {
    ...DEFAULT_PROFILE_VALUES,
    ...data,
    id: data.id ?? randomUUID(),
    created_at: data.created_at ?? now,
    updated_at: now,
  };

  return ProfileSchema.parse(profileData);
}
