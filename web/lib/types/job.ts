/**
 * Job Type Definition
 * 
 * Defines the schema and type for job postings using Zod for runtime validation
 * and type inference. This module provides type-safe job creation and validation
 * for the AI Job Tracker application.
 */

import { z } from 'zod';
import { randomUUID } from 'crypto';

/**
 * Remote work types
 * 
 * Represents the type of remote work arrangement for a job posting:
 * 
 * - **office**: On-site only - requires physical presence at the office
 * - **hybrid**: Mix of remote and office - flexible combination of remote and on-site work
 * - **remote**: Fully remote - work can be done entirely from home or any location
 * 
 * @example
 * ```ts
 * const job = createJob({
 *   // ... other fields
 *   remote_type: 'hybrid', // Uses REMOTE_TYPES constant
 * });
 * ```
 */
export const REMOTE_TYPES = ['office', 'hybrid', 'remote'] as const;

/**
 * Job status options
 * 
 * Represents the current status of a job application in the tracking system:
 * 
 * - **saved**: Job saved but not yet applied - initial state when job is added to tracker
 * - **applied**: Application submitted - candidate has sent their application
 * - **interviewing**: In interview process - candidate is in active interview stages
 * - **offer**: Received job offer - candidate has been offered the position
 * - **rejected**: Application rejected - candidate was not selected for the position
 * 
 * Use these statuses to track the progress of your job applications throughout
 * the hiring process.
 * 
 * @example
 * ```ts
 * const job = createJob({
 *   // ... other fields
 *   status: 'applied', // Uses JOB_STATUS constant
 * });
 * ```
 */
export const JOB_STATUS = ['saved', 'applied', 'interviewing', 'offer', 'rejected'] as const;

/**
 * Remote type schema
 */
const RemoteTypeSchema = z.enum(REMOTE_TYPES);

/**
 * Job status schema
 */
const JobStatusSchema = z.enum(JOB_STATUS);

/**
 * Job Schema using Zod
 * 
 * Validates job data at runtime and provides type inference.
 * This schema ensures all job data meets the required format and constraints.
 * 
 * The schema validates:
 * - Required fields (title, company, location, etc.)
 * - Optional fields with defaults (status, nice_to_have)
 * - Cross-field validation (salary_max >= salary_min)
 * - Data types and formats (UUID, URL, dates)
 * 
 * @example
 * ```ts
 * // Validate a complete job object
 * const result = JobSchema.safeParse({
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   title: 'Senior AI Engineer',
 *   company: 'Tech Corp',
 *   location: 'Stockholm, Sweden',
 *   remote_type: 'hybrid',
 *   description: 'We are looking for an experienced AI Engineer...',
 *   requirements: ['5+ years experience', 'TypeScript', 'Machine Learning'],
 *   nice_to_have: ['PhD', 'Published papers'],
 *   salary_min: 80000,
 *   salary_max: 120000,
 *   salary_currency: 'SEK',
 *   url: 'https://example.com/jobs/123',
 *   source: 'arbetsformedlingen',
 *   posted_date: new Date('2024-01-15'),
 *   status: 'saved',
 *   notes: 'Interesting opportunity',
 *   created_at: new Date(),
 *   updated_at: new Date(),
 * });
 * 
 * if (result.success) {
 *   console.log('Valid job:', result.data);
 * } else {
 *   console.error('Validation errors:', result.error.issues);
 * }
 * ```
 */
export const JobSchema = z.object({
  /**
   * Unique identifier for the job (UUID v4)
   * 
   * Automatically generated when creating a new job if not provided.
   * Used to uniquely identify jobs in the database.
   */
  id: z.string().uuid('ID must be a valid UUID format'),

  /**
   * Job title or position name
   * 
   * The official title of the position as advertised by the company.
   * Examples: "Senior AI Engineer", "Machine Learning Engineer", "Data Scientist"
   */
  title: z.string().min(1, 'Job title is required and cannot be empty'),

  /**
   * Company name
   * 
   * The name of the company offering the position.
   * Examples: "Tech Corp", "Google", "Spotify"
   */
  company: z.string().min(1, 'Company name is required and cannot be empty'),

  /**
   * Job location
   * 
   * The physical location where the job is based or where the company is located.
   * Can include city, country, or full address.
   * Examples: "Stockholm, Sweden", "Remote - Europe", "Gothenburg, Sweden"
   */
  location: z.string(),

  /**
   * Remote work type
   * 
   * Indicates the type of remote work arrangement for this position.
   * Must be one of: 'office', 'hybrid', or 'remote'
   */
  remote_type: RemoteTypeSchema,

  /**
   * Job description
   * 
   * Full description of the job position, responsibilities, and what the company
   * is looking for. This is typically the main body of the job posting.
   */
  description: z.string(),

  /**
   * Required skills and qualifications
   * 
   * Array of required skills, qualifications, or experience needed for the position.
   * Must contain at least one requirement.
   * Examples: ["5+ years experience", "TypeScript", "Machine Learning", "PhD in Computer Science"]
   */
  requirements: z.array(z.string().min(1, 'Each requirement must be a non-empty string')).min(1, 'At least one requirement is required'),

  /**
   * Nice-to-have skills (optional)
   * 
   * Array of preferred but not required skills or qualifications.
   * Defaults to an empty array if not provided.
   * Examples: ["PhD", "Published papers", "Open source contributions"]
   */
  nice_to_have: z.array(z.string()).default([]),

  /**
   * Minimum salary (optional)
   * 
   * The minimum salary offered for this position.
   * Must be >= 0 if provided. Typically used with salary_max to indicate a salary range.
   * Example: 80000 (for 80,000 SEK)
   */
  salary_min: z.number().min(0, 'Minimum salary must be >= 0').optional(),

  /**
   * Maximum salary (optional)
   * 
   * The maximum salary offered for this position.
   * Must be >= 0 if provided. Must be >= salary_min if both are provided.
   * Example: 120000 (for 120,000 SEK)
   */
  salary_max: z.number().min(0, 'Maximum salary must be >= 0').optional(),

  /**
   * Salary currency (optional)
   * 
   * The currency code for the salary values.
   * Examples: "SEK" (Swedish Krona), "USD" (US Dollar), "EUR" (Euro)
   */
  salary_currency: z.string().optional(),

  /**
   * Job posting URL
   * 
   * The URL where the job posting can be found online.
   * Must be a valid URL format. Used to reference the original job posting.
   * Example: "https://example.com/jobs/123" or "https://arbetsformedlingen.se/job/456"
   */
  url: z.string().url('URL must be a valid URL format (e.g., https://example.com/jobs/123)'),

  /**
   * Source of the job posting
   * 
   * Indicates where this job posting was found or how it was added.
   * Examples: "manual" (manually added), "arbetsformedlingen" (Swedish job board),
   * "linkedin", "company_website"
   */
  source: z.string(),

  /**
   * Date when job was posted
   * 
   * The date when the job posting was published or first appeared online.
   * Used to track how recent the posting is.
   */
  posted_date: z.date(),

  /**
   * Current application status
   * 
   * The current status of your application for this job.
   * Defaults to 'saved' if not provided.
   * See JOB_STATUS constant for all available statuses.
   */
  status: JobStatusSchema.default('saved'),

  /**
   * Additional notes about the job
   * 
   * Optional notes, comments, or observations about the job posting.
   * Useful for personal reminders, interview notes, or other relevant information.
   * Example: "Applied on 2024-01-20", "Great company culture", "Interview scheduled for next week"
   */
  notes: z.string().optional(),

  /**
   * Job creation timestamp
   * 
   * Automatically set when the job is first created in the system.
   * Used to track when the job was added to the tracker.
   */
  created_at: z.date(),

  /**
   * Job last update timestamp
   * 
   * Automatically updated whenever the job data is modified.
   * Used to track when the job information was last changed.
   */
  updated_at: z.date(),
}).refine(
  (data) => {
    // Cross-field validation: salary_max must be >= salary_min
    // We use !== undefined check instead of truthy check to handle salary_min = 0 correctly
    // (0 is falsy in JavaScript, so we need explicit undefined check)
    if (data.salary_min !== undefined && data.salary_max !== undefined) {
      return data.salary_max >= data.salary_min;
    }
    return true;
  },
  {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['salary_max'],
  }
);

/**
 * Job type inferred from Zod schema
 * 
 * This type is automatically inferred from JobSchema, ensuring type safety
 * and keeping the schema as the single source of truth.
 * 
 * Use this type when you need to reference the Job type in your code:
 * 
 * @example
 * ```ts
 * function processJob(job: Job) {
 *   console.log(job.title, job.company);
 * }
 * ```
 */
export type Job = z.infer<typeof JobSchema>;

/**
 * Type helpers for Job fields
 * 
 * These types extract specific field types from the Job type,
 * making it easier to use them in other parts of the codebase.
 */

/**
 * Remote type
 * 
 * Type representing the remote work arrangement options.
 * Values: 'office' | 'hybrid' | 'remote'
 * 
 * @example
 * ```ts
 * function isRemoteWork(type: RemoteType): boolean {
 *   return type === 'remote' || type === 'hybrid';
 * }
 * ```
 */
export type RemoteType = Job['remote_type'];

/**
 * Job status type
 * 
 * Type representing the job application status options.
 * Values: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected'
 * 
 * @example
 * ```ts
 * function isActiveStatus(status: JobStatus): boolean {
 *   return status === 'applied' || status === 'interviewing';
 * }
 * ```
 */
export type JobStatus = Job['status'];

/**
 * Default values for Job creation
 * 
 * These defaults are applied when creating a new job if not explicitly provided.
 */
const DEFAULT_JOB_VALUES: Partial<Job> = {
  status: 'saved',
  nice_to_have: [],
  created_at: new Date(),
  updated_at: new Date(),
};

/**
 * Creates a new Job with validation
 * 
 * This function creates a validated Job instance with automatic UUID generation
 * and timestamp management. All required fields must be provided, and optional
 * fields will use sensible defaults.
 * 
 * @param data - Partial job data (will be merged with defaults)
 * @returns Validated Job with generated UUID and timestamps
 * @throws {z.ZodError} If validation fails, a ZodError is thrown with detailed error messages
 * 
 * @example
 * ```ts
 * // Create a job with required fields only
 * const job = createJob({
 *   title: 'Senior AI Engineer',
 *   company: 'Tech Corp',
 *   location: 'Stockholm, Sweden',
 *   remote_type: 'hybrid',
 *   description: 'We are looking for an experienced AI Engineer...',
 *   requirements: ['5+ years experience', 'TypeScript'],
 *   url: 'https://example.com/jobs/123',
 *   source: 'arbetsformedlingen',
 *   posted_date: new Date('2024-01-15'),
 * });
 * 
 * // Create a job with all fields
 * const fullJob = createJob({
 *   title: 'Machine Learning Engineer',
 *   company: 'AI Startup',
 *   location: 'Gothenburg, Sweden',
 *   remote_type: 'remote',
 *   description: 'Join our team...',
 *   requirements: ['3+ years ML experience', 'Python', 'TensorFlow'],
 *   nice_to_have: ['PhD', 'Published papers'],
 *   salary_min: 90000,
 *   salary_max: 130000,
 *   salary_currency: 'SEK',
 *   url: 'https://aistartup.com/careers/ml-engineer',
 *   source: 'company_website',
 *   posted_date: new Date('2024-01-20'),
 *   status: 'applied',
 *   notes: 'Applied on 2024-01-22. Interview scheduled for next week.',
 * });
 * 
 * // Handle validation errors
 * try {
 *   const job = createJob({
 *     title: '', // Invalid: empty title
 *     // ... other fields
 *   });
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     console.error('Validation errors:', error.issues);
 *   }
 * }
 * ```
 */
export function createJob(data: Partial<Job>): Job {
  const now = new Date();
  
  const jobData: Partial<Job> = {
    ...DEFAULT_JOB_VALUES,
    ...data,
    id: data.id ?? randomUUID(),
    created_at: data.created_at ?? now,
    updated_at: now,
  };

  return JobSchema.parse(jobData);
}

