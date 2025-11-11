/**
 * MatchScore Type Definition
 * 
 * Defines the schema and type for match scores between Profile and Job using Zod
 * for runtime validation and type inference. This module provides type-safe match
 * score creation and validation for the AI Job Tracker application.
 * 
 * Match scores are calculated by comparing a candidate's profile with job requirements
 * across multiple dimensions (skills, experience, location, company, requirements).
 * The overall score and recommendation help candidates prioritize which jobs to apply for.
 */

import { z } from 'zod';

/**
 * Recommendation options
 * 
 * Represents the recommendation level for a job application based on match score.
 * These recommendations help candidates prioritize their job applications:
 * 
 * - **strong_apply**: Strong match (overall_score >= 80) - highly recommended to apply
 *   - Use when: Excellent alignment across all dimensions, high probability of success
 *   - Action: Prioritize this application, tailor resume and cover letter
 * 
 * - **apply**: Good match (overall_score 60-79) - recommended to apply
 *   - Use when: Good alignment, candidate meets most requirements
 *   - Action: Apply with standard materials, good chance of consideration
 * 
 * - **maybe**: Moderate match (overall_score 40-59) - consider applying
 *   - Use when: Some alignment, candidate may need to learn some skills
 *   - Action: Apply if interested, but don't prioritize over better matches
 * 
 * - **skip**: Weak match (overall_score < 40) - not recommended
 *   - Use when: Poor alignment, candidate lacks many required skills
 *   - Action: Skip unless very interested in the company/role
 * 
 * @example
 * ```ts
 * const recommendation = calculateRecommendation(85); // Returns 'strong_apply'
 * const text = getRecommendationText('strong_apply'); // Returns "🎯 Strong Apply - Excellent match!"
 * ```
 */
export const RECOMMENDATIONS = ['strong_apply', 'apply', 'maybe', 'skip'] as const;

/**
 * Recommendation schema
 */
const RecommendationSchema = z.enum(RECOMMENDATIONS);

/**
 * Score validation schema (0-100)
 * 
 * All match scores must be between 0 and 100, representing percentages.
 * Scores are validated to ensure they fall within this range because:
 * - 0 represents no match (0% compatibility)
 * - 100 represents perfect match (100% compatibility)
 * - Values outside this range are mathematically invalid for percentage calculations
 */
const ScoreSchema = z.number()
  .min(0, 'Score must be >= 0 (0% = no match)')
  .max(100, 'Score must be <= 100 (100% = perfect match)');

/**
 * MatchScore Schema using Zod
 * 
 * Validates match score data at runtime and provides type inference.
 * This schema ensures all match score data meets the required format and constraints.
 * 
 * The schema includes cross-field validations to ensure data consistency:
 * - Skills cannot appear in both missing_skills and matching_skills
 * - Recommendation must match overall_score thresholds
 * 
 * @example
 * ```ts
 * // Validate a complete match score object
 * const result = MatchScoreSchema.safeParse({
 *   job_id: '123e4567-e89b-12d3-a456-426614174000',
 *   overall_score: 85,
 *   skills_match: 90,
 *   experience_match: 80,
 *   location_match: 100,
 *   company_match: 75,
 *   requirements_match: 85,
 *   missing_skills: ['Docker'],
 *   matching_skills: ['TypeScript', 'Node.js', 'Machine Learning'],
 *   recommendation: 'strong_apply',
 *   details: 'Excellent match with strong technical skills alignment',
 *   created_at: new Date(),
 * });
 * 
 * if (result.success) {
 *   console.log('Valid match score:', result.data);
 * } else {
 *   console.error('Validation errors:', result.error.issues);
 * }
 * ```
 */
export const MatchScoreSchema = z.object({
  /**
   * Job ID reference (UUID v4)
   * 
   * References the Job that this match score is calculated for.
   * Used to link the match score back to the original job posting.
   */
  job_id: z.string().uuid('Job ID must be a valid UUID format'),

  /**
   * Overall match score (0-100)
   * 
   * The overall match score between the profile and job, calculated as a weighted
   * average of all individual match scores (skills, experience, location, company, requirements).
   * 
   * This is the primary metric used to determine the recommendation level.
   * Higher scores indicate better alignment between candidate and job requirements.
   */
  overall_score: ScoreSchema,

  /**
   * Skills match score (0-100)
   * 
   * Percentage of matching skills between profile and job requirements.
   * Calculated as: (matching_skills.length / total_required_skills) * 100
   * 
   * Example: If job requires 10 skills and profile has 8 matching skills, score = 80
   */
  skills_match: ScoreSchema,

  /**
   * Experience match score (0-100)
   * 
   * How well the profile's experience matches the job requirements.
   * Considers years of experience, relevant work history, and domain expertise.
   * 
   * Example: Job requires 5+ years, profile has 7 years = high score
   */
  experience_match: ScoreSchema,

  /**
   * Location match score (0-100)
   * 
   * How well the profile's location preference matches the job location.
   * Considers physical location, remote work preferences, and visa status.
   * 
   * Example: Profile wants Stockholm, job is in Stockholm = 100
   */
  location_match: ScoreSchema,

  /**
   * Company match score (0-100)
   * 
   * How well the profile's company preferences match the job company.
   * Considers company size, industry, culture, and other preferences.
   * 
   * Example: Profile prefers startups, job is at a startup = high score
   */
  company_match: ScoreSchema,

  /**
   * Requirements match score (0-100)
   * 
   * Percentage of job requirements that the profile meets.
   * Includes all requirements: skills, experience, education, certifications, etc.
   * 
   * Example: Job has 20 requirements, profile meets 16 = 80
   */
  requirements_match: ScoreSchema,

  /**
   * Missing skills (default: empty array)
   * 
   * Array of skills required by the job that are missing from the profile.
   * These are skills the candidate would need to learn or acquire.
   * 
   * Important: Cannot overlap with matching_skills (same skill cannot be both missing and matching).
   * 
   * @example ['Docker', 'Kubernetes', 'AWS']
   */
  missing_skills: z.array(z.string()).default([]),

  /**
   * Matching skills (default: empty array)
   * 
   * Array of skills that match between the profile and job requirements.
   * These are skills the candidate already has.
   * 
   * Important: Cannot overlap with missing_skills (same skill cannot be both missing and matching).
   * 
   * @example ['TypeScript', 'Node.js', 'Machine Learning', 'Python']
   */
  matching_skills: z.array(z.string()).default([]),

  /**
   * Recommendation
   * 
   * AI-generated recommendation based on the overall match score.
   * Must be consistent with overall_score (see validation rules below):
   * - 'strong_apply' requires overall_score >= 80
   * - 'skip' requires overall_score < 40
   * 
   * This recommendation helps candidates prioritize which jobs to apply for.
   */
  recommendation: RecommendationSchema,

  /**
   * Details (optional)
   * 
   * AI-generated analysis or explanation of the match score.
   * Provides context and reasoning for the recommendation, including:
   * - Strengths and weaknesses of the match
   * - Specific skills or requirements that align well
   * - Areas where the candidate may need to improve
   * - Overall assessment of fit
   * 
   * @example "Excellent match with strong technical skills alignment. Candidate has 7 years of experience matching the 5+ requirement. Location preference aligns perfectly. Minor gap in containerization skills (Docker, Kubernetes) but overall strong fit."
   */
  details: z.string().optional(),

  /**
   * Creation timestamp
   * 
   * Automatically set when the match score is first created.
   * Used to track when the match analysis was performed.
   */
  created_at: z.date(),
})
  .refine(
    (data) => {
      // Cross-field validation: missing_skills and matching_skills cannot have overlap
      // This validation exists because a skill cannot be both missing and matching at the same time.
      // It ensures data consistency and prevents logical contradictions in the match analysis.
      const missingSet = new Set(data.missing_skills);
      const matchingSet = new Set(data.matching_skills);
      
      // Check for any overlap - if a skill appears in both sets, validation fails
      for (const skill of missingSet) {
        if (matchingSet.has(skill)) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'missing_skills and matching_skills cannot have overlapping skills. A skill cannot be both present and missing. Check for duplicate skills in both arrays.',
      path: ['missing_skills'],
    }
  )
  .refine(
    (data) => {
      // Cross-field validation: If recommendation is 'strong_apply', overall_score must be >= 80
      // This validation exists because 'strong_apply' is reserved for excellent matches only.
      // The threshold of 80 ensures that only top-tier matches get this recommendation,
      // maintaining the integrity of the recommendation system and helping candidates
      // prioritize truly excellent opportunities.
      if (data.recommendation === 'strong_apply') {
        return data.overall_score >= 80;
      }
      return true;
    },
    {
      message: 'strong_apply recommendation requires overall_score >= 80. For scores below 80, use "apply" (60-79), "maybe" (40-59), or "skip" (<40).',
      path: ['overall_score'],
    }
  )
  .refine(
    (data) => {
      // Cross-field validation: If recommendation is 'skip', overall_score must be < 40
      // This validation exists because 'skip' is reserved for poor matches only.
      // The threshold of 40 ensures that only weak matches get this recommendation,
      // preventing candidates from wasting time on jobs with low probability of success.
      if (data.recommendation === 'skip') {
        return data.overall_score < 40;
      }
      return true;
    },
    {
      message: 'skip recommendation requires overall_score < 40. For scores >= 40, use "maybe" (40-59), "apply" (60-79), or "strong_apply" (>=80).',
      path: ['overall_score'],
    }
  );

/**
 * MatchScore type inferred from Zod schema
 * 
 * This type is automatically inferred from MatchScoreSchema, ensuring type safety
 * and keeping the schema as the single source of truth.
 * 
 * @example
 * ```ts
 * function processMatchScore(score: MatchScore) {
 *   console.log(score.overall_score, score.recommendation);
 * }
 * ```
 */
export type MatchScore = z.infer<typeof MatchScoreSchema>;

/**
 * Type helpers for MatchScore fields
 * 
 * These types extract specific field types from the MatchScore type,
 * making it easier to use them in other parts of the codebase.
 */

/**
 * Recommendation type
 * 
 * Type representing the recommendation options.
 * Values: 'strong_apply' | 'apply' | 'maybe' | 'skip'
 * 
 * Use this type when you need to work with recommendations independently
 * of the full MatchScore object.
 * 
 * @example
 * ```ts
 * function isHighPriorityRecommendation(rec: Recommendation): boolean {
 *   return rec === 'strong_apply' || rec === 'apply';
 * }
 * ```
 */
export type Recommendation = MatchScore['recommendation'];

/**
 * Score breakdown type
 * 
 * Type representing all individual match scores (excluding overall_score).
 * Useful when you need to work with individual score dimensions separately.
 * 
 * Use this type when:
 * - Analyzing individual score components
 * - Calculating weighted averages
 * - Displaying score breakdowns in UI
 * - Comparing scores across different dimensions
 * 
 * @example
 * ```ts
 * function calculateAverageScore(breakdown: ScoreBreakdown): number {
 *   const scores = [
 *     breakdown.skills_match,
 *     breakdown.experience_match,
 *     breakdown.location_match,
 *     breakdown.company_match,
 *     breakdown.requirements_match,
 *   ];
 *   return scores.reduce((a, b) => a + b, 0) / scores.length;
 * }
 * ```
 */
export type ScoreBreakdown = Pick<
  MatchScore,
  'skills_match' | 'experience_match' | 'location_match' | 'company_match' | 'requirements_match'
>;

/**
 * Default values for MatchScore creation
 * 
 * These defaults are applied when creating a new match score if not explicitly provided.
 */
const DEFAULT_MATCH_SCORE_VALUES: Partial<MatchScore> = {
  missing_skills: [],
  matching_skills: [],
  created_at: new Date(),
};

/**
 * Creates a new MatchScore with validation
 * 
 * This function creates a validated MatchScore instance with automatic timestamp
 * management. All required fields must be provided, and optional fields will use
 * sensible defaults.
 * 
 * @param data - Partial match score data (will be merged with defaults)
 * @returns Validated MatchScore with timestamps
 * @throws {z.ZodError} If validation fails, a ZodError is thrown with detailed error messages
 * 
 * @example
 * ```ts
 * // Create a match score with required fields only
 * const matchScore = createMatchScore({
 *   job_id: '123e4567-e89b-12d3-a456-426614174000',
 *   overall_score: 85,
 *   skills_match: 90,
 *   experience_match: 80,
 *   location_match: 100,
 *   company_match: 75,
 *   requirements_match: 85,
 *   recommendation: 'strong_apply',
 * });
 * 
 * // Create a match score with all fields
 * const fullMatchScore = createMatchScore({
 *   job_id: '123e4567-e89b-12d3-a456-426614174000',
 *   overall_score: 75,
 *   skills_match: 80,
 *   experience_match: 70,
 *   location_match: 80,
 *   company_match: 70,
 *   requirements_match: 75,
 *   missing_skills: ['Docker'],
 *   matching_skills: ['TypeScript', 'Node.js'],
 *   recommendation: 'apply',
 *   details: 'Good match with strong technical skills alignment',
 * });
 * 
 * // Handle validation errors
 * try {
 *   const matchScore = createMatchScore({
 *     job_id: '123e4567-e89b-12d3-a456-426614174000',
 *     overall_score: 75, // Invalid: < 80 for strong_apply
 *     skills_match: 90,
 *     experience_match: 80,
 *     location_match: 100,
 *     company_match: 75,
 *     requirements_match: 85,
 *     recommendation: 'strong_apply',
 *   });
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     console.error('Validation errors:', error.issues);
 *   }
 * }
 * ```
 */
export function createMatchScore(data: Partial<MatchScore>): MatchScore {
  const now = new Date();
  
  const matchScoreData: Partial<MatchScore> = {
    ...DEFAULT_MATCH_SCORE_VALUES,
    ...data,
    created_at: data.created_at ?? now,
  };

  return MatchScoreSchema.parse(matchScoreData);
}

/**
 * Calculate recommendation based on overall score
 * 
 * Automatically determines the appropriate recommendation level based on the
 * overall match score using standard thresholds:
 * - >= 80: 'strong_apply' (excellent match)
 * - 60-79: 'apply' (good match)
 * - 40-59: 'maybe' (moderate match)
 * - < 40: 'skip' (weak match)
 * 
 * @param overallScore - The overall match score (0-100)
 * @returns The appropriate recommendation based on the score
 * 
 * @example
 * ```ts
 * const score = 85;
 * const recommendation = calculateRecommendation(score); // Returns 'strong_apply'
 * 
 * const matchScore = createMatchScore({
 *   job_id: '123e4567-e89b-12d3-a456-426614174000',
 *   overall_score: 75,
 *   skills_match: 80,
 *   experience_match: 70,
 *   location_match: 80,
 *   company_match: 70,
 *   requirements_match: 75,
 *   recommendation: calculateRecommendation(75), // Automatically set to 'apply'
 * });
 * ```
 */
export function calculateRecommendation(overallScore: number): Recommendation {
  if (overallScore >= 80) {
    return 'strong_apply';
  }
  if (overallScore >= 60) {
    return 'apply';
  }
  if (overallScore >= 40) {
    return 'maybe';
  }
  return 'skip';
}

/**
 * Get recommendation text based on score
 * 
 * Returns a human-readable, emoji-enhanced text representation of the recommendation.
 * Useful for displaying recommendations in UI or generating user-friendly messages.
 * 
 * @param rec - The recommendation value
 * @returns A formatted text string with emoji and description
 * 
 * @example
 * ```ts
 * const text = getRecommendationText('strong_apply');
 * // Returns: "🎯 Strong Apply - Excellent match!"
 * 
 * const text2 = getRecommendationText('skip');
 * // Returns: "⏭️ Skip - Weak match, not recommended"
 * 
 * // Use in UI
 * const matchScore = createMatchScore({
 *   job_id: '123e4567-e89b-12d3-a456-426614174000',
 *   overall_score: 85,
 *   skills_match: 90,
 *   experience_match: 80,
 *   location_match: 100,
 *   company_match: 75,
 *   requirements_match: 85,
 *   recommendation: 'strong_apply',
 * });
 * console.log(getRecommendationText(matchScore.recommendation));
 * ```
 */
export function getRecommendationText(rec: Recommendation): string {
  switch (rec) {
    case 'strong_apply':
      return '🎯 Strong Apply - Excellent match!';
    case 'apply':
      return '✅ Apply - Good match, recommended';
    case 'maybe':
      return '🤔 Maybe - Moderate match, consider applying';
    case 'skip':
      return '⏭️ Skip - Weak match, not recommended';
    default:
      return '❓ Unknown recommendation';
  }
}

