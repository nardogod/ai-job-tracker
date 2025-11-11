/**
 * ClaudeService - AI-powered job matching analysis
 * FASE REFACTOR - Improved implementation with retry, logging, and validation
 * 
 * Uses Anthropic's Claude API to analyze job-profile matches
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { Profile } from '../types/profile';
import type { Job } from '../types/job';
import { createMatchScore, type MatchScore } from '../types/match-score';

/**
 * Score breakdown for individual match components
 */
export interface ScoreBreakdown {
  skills_match: number;
  experience_match: number;
  location_match: number;
  company_match: number;
  requirements_match: number;
}

/**
 * API usage and cost information
 */
export interface ApiUsage {
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
}

/**
 * Configuration options for ClaudeService
 */
export interface ClaudeServiceOptions {
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Claude model to use (default: claude-sonnet-4-20250514) */
  model?: string;
  /** Max tokens for response (default: 2000) */
  maxTokens?: number;
  /** Enable caching of analyses (default: false) */
  enableCache?: boolean;
  /** Max retries for API calls (default: 3) */
  maxRetries?: number;
  /** Enable structured logging (default: false) */
  enableLogging?: boolean;
}

/**
 * Service for AI-powered job matching analysis using Claude API
 * 
 * @example
 * ```ts
 * const service = new ClaudeService(process.env.ANTHROPIC_API_KEY);
 * const match = await service.analyzeMatch(profile, job);
 * console.log(`Match score: ${match.overall_score}%`);
 * ```
 */
/**
 * Schema for validating Claude API response
 */
const ClaudeResponseSchema = z.object({
  overall_score: z.number().min(0).max(100),
  skills_match: z.number().min(0).max(100),
  experience_match: z.number().min(0).max(100),
  location_match: z.number().min(0).max(100),
  company_match: z.number().min(0).max(100),
  requirements_match: z.number().min(0).max(100),
  matching_skills: z.array(z.string()),
  missing_skills: z.array(z.string()),
  recommendation: z.enum(['strong_apply', 'apply', 'maybe', 'skip']),
  details: z.string().min(1),
}).refine(
  (data) => {
    // Ensure no overlap between matching and missing skills
    const overlap = data.matching_skills.filter((skill) =>
      data.missing_skills.includes(skill)
    );
    return overlap.length === 0;
  },
  {
    message: 'matching_skills and missing_skills cannot have overlapping skills',
  }
).refine(
  (data) => {
    // Validate recommendation consistency with overall_score
    if (data.recommendation === 'strong_apply' && data.overall_score < 80) {
      return false;
    }
    if (data.recommendation === 'skip' && data.overall_score >= 40) {
      return false;
    }
    return true;
  },
  {
    message: 'recommendation must be consistent with overall_score',
  }
);

type ClaudeResponse = z.infer<typeof ClaudeResponseSchema>;

export class ClaudeService {
  private client: Anthropic;
  private options: Required<Omit<ClaudeServiceOptions, 'enableCache' | 'enableLogging'>> & {
    enableCache: boolean;
    enableLogging: boolean;
  };
  private cache: Map<string, MatchScore>;

  /**
   * Creates a new ClaudeService instance
   * 
   * @param apiKey - Anthropic API key (falls back to ANTHROPIC_API_KEY env var)
   * @param options - Service configuration options
   * @throws {Error} If API key is missing or invalid
   */
  constructor(apiKey?: string, options: ClaudeServiceOptions = {}) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    
    if (!key || key.trim() === '') {
      throw new Error('API key is required');
    }

    this.client = new Anthropic({ apiKey: key });
    this.options = {
      timeout: options.timeout ?? 30000,
      model: options.model ?? 'claude-sonnet-4-20250514',
      maxTokens: options.maxTokens ?? 2000,
      maxRetries: options.maxRetries ?? 3,
      enableCache: options.enableCache ?? false,
      enableLogging: options.enableLogging ?? false,
    };
    this.cache = new Map();
  }

  /**
   * Analyzes match between a profile and job posting
   * 
   * @param profile - Candidate profile
   * @param job - Job posting
   * @returns Complete match analysis with scores and recommendations
   * @throws {Error} If profile or job is invalid, or API call fails
   */
  async analyzeMatch(profile: Profile, job: Job): Promise<MatchScore> {
    // Validate inputs
    if (!profile?.id || !profile?.skills || !profile?.name) {
      throw new Error('Invalid profile: missing required fields');
    }
    if (!job?.id || !job?.title || !job?.requirements) {
      throw new Error('Invalid job: missing required fields');
    }

    // Check cache if enabled
    if (this.options.enableCache) {
      const cacheKey = this.getCacheKey(profile, job);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.log('info', 'Cache hit for analysis', { profileId: profile.id, jobId: job.id });
        return cached;
      }
    }

    try {
      this.log('info', 'Starting match analysis', { profileId: profile.id, jobId: job.id });
      
      // Get structured analysis from Claude with retry logic
      const { analysis, usage } = await this.callClaudeWithRetry(profile, job);
      
      // Create MatchScore from analysis
      const matchScore = createMatchScore({
        job_id: job.id,
        overall_score: analysis.overall_score,
        skills_match: analysis.skills_match,
        experience_match: analysis.experience_match,
        location_match: analysis.location_match,
        company_match: analysis.company_match,
        requirements_match: analysis.requirements_match,
        missing_skills: analysis.missing_skills,
        matching_skills: analysis.matching_skills,
        recommendation: analysis.recommendation,
        details: analysis.details,
      });

      // Store usage info for cost tracking
      (matchScore as any).apiUsage = usage;

      // Cache result if enabled
      if (this.options.enableCache) {
        const cacheKey = this.getCacheKey(profile, job);
        this.cache.set(cacheKey, matchScore);
      }

      this.log('info', 'Match analysis completed', {
        profileId: profile.id,
        jobId: job.id,
        overallScore: matchScore.overall_score,
        recommendation: matchScore.recommendation,
        costUSD: usage.cost_usd,
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
      });

      return matchScore;
    } catch (error) {
      this.log('error', 'Match analysis failed', {
        profileId: profile.id,
        jobId: job.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      if (error instanceof Error) {
        throw new Error(`Failed to analyze match: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Calculates detailed score breakdown for a profile-job match
   * 
   * @param profile - Candidate profile
   * @param job - Job posting
   * @returns Breakdown of individual match scores
   */
  async calculateScoreBreakdown(profile: Profile, job: Job): Promise<ScoreBreakdown> {
    const match = await this.analyzeMatch(profile, job);
    
    return {
      skills_match: match.skills_match,
      experience_match: match.experience_match,
      location_match: match.location_match,
      company_match: match.company_match,
      requirements_match: match.requirements_match,
    };
  }

  /**
   * Generates detailed textual analysis of the match
   * 
   * @param profile - Candidate profile
   * @param job - Job posting
   * @returns Detailed analysis text
   */
  async generateDetailedAnalysis(profile: Profile, job: Job): Promise<string> {
    const match = await this.analyzeMatch(profile, job);
    return match.details || 'No detailed analysis available';
  }

  /**
   * Calls Claude API with retry logic and exponential backoff
   * @private
   */
  private async callClaudeWithRetry(
    profile: Profile,
    job: Job
  ): Promise<{ analysis: ClaudeResponse; usage: ApiUsage }> {
    const maxRetries = this.options.maxRetries;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await this.getStructuredAnalysis(profile, job);
        if (attempt > 0) {
          this.log('info', 'Retry succeeded', { attempt: attempt + 1, maxRetries });
        }
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on validation errors or invalid inputs
        if (error instanceof Error && (
          error.message.includes('Invalid profile') ||
          error.message.includes('Invalid job') ||
          error.message.includes('Failed to parse')
        )) {
          throw error;
        }

        // If this is the last attempt, throw the error
        if (attempt === maxRetries - 1) {
          this.log('error', 'Max retries reached', {
            maxRetries,
            error: lastError.message,
          });
          throw lastError;
        }

        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = Math.pow(2, attempt) * 1000;
        this.log('info', 'Retrying API call', {
          attempt: attempt + 1,
          maxRetries,
          delayMs: delay,
          error: lastError.message,
        });
        
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Failed to get analysis after retries');
  }

  /**
   * Sleep utility for retry delays
   * @private
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Gets structured analysis from Claude API
   * @private
   */
  private async getStructuredAnalysis(profile: Profile, job: Job): Promise<{ analysis: ClaudeResponse; usage: ApiUsage }> {
    const prompt = this.buildAnalysisPrompt(profile, job);

    const message = await this.client.messages.create(
      {
        model: this.options.model,
        max_tokens: this.options.maxTokens,
        messages: [{ role: 'user', content: prompt }],
      },
      { timeout: this.options.timeout }
    );

    const content = message.content[0];
    if (!content || content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    // Calculate cost based on tokens used
    const usage = this.calculateUsage(message.usage);

    return {
      analysis: this.parseAnalysisResponse(content.text),
      usage,
    };
  }

  /**
   * Calculates API usage and cost in USD
   * Claude Sonnet 4 pricing (as of 2025):
   * - Input: $3 per 1M tokens = $0.000003 per token
   * - Output: $15 per 1M tokens = $0.000015 per token
   * @private
   */
  private calculateUsage(usage: { input_tokens?: number; output_tokens?: number }): ApiUsage {
    const inputTokens = usage.input_tokens || 0;
    const outputTokens = usage.output_tokens || 0;
    
    // Claude Sonnet 4 pricing
    const INPUT_COST_PER_TOKEN = 3 / 1_000_000; // $3 per 1M tokens
    const OUTPUT_COST_PER_TOKEN = 15 / 1_000_000; // $15 per 1M tokens
    
    const inputCost = inputTokens * INPUT_COST_PER_TOKEN;
    const outputCost = outputTokens * OUTPUT_COST_PER_TOKEN;
    const totalCost = inputCost + outputCost;

    return {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: totalCost,
    };
  }

  /**
   * Gets cache key for profile-job pair
   * @private
   */
  private getCacheKey(profile: Profile, job: Job): string {
    return `${profile.id}-${job.id}`;
  }

  /**
   * Structured logging utility
   * @private
   */
  private log(level: 'info' | 'error', message: string, meta?: unknown): void {
    if (!this.options.enableLogging) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry: Record<string, unknown> = {
      timestamp,
      level,
      message,
      service: 'ClaudeService',
    };
    
    if (meta) {
      logEntry.meta = meta;
    }

    console.log(JSON.stringify(logEntry));
  }

  /**
   * Builds the analysis prompt for Claude with improved context
   * @private
   */
  private buildAnalysisPrompt(profile: Profile, job: Job): string {
    return `You are an expert AI recruitment analyst specializing in the Swedish tech job market. Analyze the match between this candidate profile and job posting.

CONTEXT - Swedish Tech Market:
- Swedish companies value work-life balance, flat hierarchies, and collaborative culture
- English is widely spoken in tech companies, but Swedish language skills are a plus
- Remote work is common, especially in tech (hybrid is standard)
- Salary ranges in SEK: Junior (40k-60k), Mid (60k-80k), Senior (80k-120k+)
- Visa sponsorship is available but requires strong qualifications

CANDIDATE PROFILE:
- Name: ${profile.name}
- Experience: ${profile.experience_years} years
- Skills: ${profile.skills.join(', ')}
- Location Preference: ${profile.location_preference}
- Visa Status: ${profile.visa_status}
- Languages: ${Object.entries(profile.languages).map(([lang, level]) => `${lang} (${level})`).join(', ')}
- Company Size Preference: ${profile.company_size_preference}
- Remote Preference: ${profile.remote_preference}
${profile.min_salary ? `- Minimum Salary: ${profile.min_salary} SEK` : ''}

JOB POSTING:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Remote Type: ${job.remote_type}
- Description: ${job.description}
- Requirements: ${job.requirements.join(', ')}
${job.nice_to_have.length > 0 ? `- Nice to Have: ${job.nice_to_have.join(', ')}` : ''}
${job.salary_min ? `- Salary Range: ${job.salary_min}${job.salary_max ? ` - ${job.salary_max}` : '+'} ${job.salary_currency || 'SEK'}` : ''}

SKILLS MATCHING GUIDELINES:
- Match skills by semantic similarity (e.g., "Python" matches "Python programming", "ML" matches "Machine Learning")
- Consider related technologies (e.g., "React" relates to "JavaScript", "TypeScript")
- Distinguish between required skills (requirements) and nice-to-haves
- Be specific: list exact skill names from the candidate's skills array that match job requirements
- Missing skills should be skills mentioned in job requirements but NOT in candidate's skills

Provide your analysis in this EXACT JSON format (no additional text, just valid JSON):
{
  "overall_score": <0-100>,
  "skills_match": <0-100>,
  "experience_match": <0-100>,
  "location_match": <0-100>,
  "company_match": <0-100>,
  "requirements_match": <0-100>,
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill3", "skill4"],
  "recommendation": "strong_apply|apply|maybe|skip",
  "details": "Detailed analysis text explaining the match, strengths, gaps, and recommendations."
}

SCORING GUIDELINES:
- skills_match (0-100): Percentage of job requirements covered by candidate skills
  - 90-100: All or almost all required skills match
  - 70-89: Most required skills match, some gaps
  - 50-69: Some required skills match, significant gaps
  - 0-49: Few or no required skills match
- experience_match (0-100): Years of experience vs job level expectations
  - Consider: Junior (0-2y), Mid (3-5y), Senior (6-10y), Lead (10y+)
- location_match (0-100): Location/remote preference alignment
  - 100: Perfect match (same location or remote preference matches)
  - 70-99: Good match (nearby location or compatible remote options)
  - 40-69: Moderate match (different location but remote possible)
  - 0-39: Poor match (location mismatch, no remote option)
- company_match (0-100): Company size/culture fit based on candidate preferences
- requirements_match (0-100): Overall coverage of required qualifications
- overall_score (0-100): Weighted average (skills 40%, requirements 30%, experience 15%, location 10%, company 5%)

RECOMMENDATION GUIDELINES (must match overall_score):
- "strong_apply": overall_score >= 80 (excellent match, high probability of success)
- "apply": overall_score >= 60 and < 80 (good match, worth applying)
- "maybe": overall_score >= 40 and < 60 (moderate match, consider if interested)
- "skip": overall_score < 40 (poor match, not recommended)

EXAMPLE ANALYSIS:
For a candidate with skills ["Python", "Machine Learning", "AWS"] matching a job requiring ["Python programming", "ML experience", "Cloud infrastructure"]:
- matching_skills: ["Python", "Machine Learning", "AWS"]
- missing_skills: [] (if all requirements are covered)
- skills_match: 95
- overall_score: 88
- recommendation: "strong_apply"`;
  }

  /**
   * Parses and validates Claude's response using Zod schema
   * @private
   */
  private parseAnalysisResponse(response: string): ClaudeResponse {
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonText = response.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }

      const parsed = JSON.parse(jsonText);

      // Validate and normalize using Zod schema
      const validated = ClaudeResponseSchema.parse(parsed);

      // Normalize scores to ensure they're integers in 0-100 range
      const normalizeScore = (score: number): number => {
        return Math.max(0, Math.min(100, Math.round(score)));
      };

      return {
        overall_score: normalizeScore(validated.overall_score),
        skills_match: normalizeScore(validated.skills_match),
        experience_match: normalizeScore(validated.experience_match),
        location_match: normalizeScore(validated.location_match),
        company_match: normalizeScore(validated.company_match),
        requirements_match: normalizeScore(validated.requirements_match),
        matching_skills: validated.matching_skills,
        missing_skills: validated.missing_skills,
        recommendation: validated.recommendation,
        details: validated.details,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((issue: z.ZodIssue) => 
          `${issue.path.join('.')}: ${issue.message}`
        ).join('; ');
        throw new Error(`Invalid Claude response structure: ${errorMessages}`);
      }
      throw new Error(`Failed to parse Claude response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clears the analysis cache
   * Useful for testing or when profile/job data changes
   */
  clearCache(): void {
    this.cache.clear();
    this.log('info', 'Cache cleared');
  }
}

