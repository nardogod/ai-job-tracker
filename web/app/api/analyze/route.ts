/**
 * /api/analyze - API Route
 * GREEN Phase - TDD Implementation
 *
 * Analyzes job-profile match using Claude AI
 */

import { NextRequest, NextResponse } from "next/server";
import { ClaudeService } from "@/lib/services/claude";
import { StorageService } from "@/lib/services/storage";
import { createJob } from "@/lib/types/job";
import { z } from "zod";

// Job schema for validation
const JobSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  remote_type: z.enum(["office", "hybrid", "remote"]),
  description: z.string(),
  requirements: z.array(z.string()),
  nice_to_have: z.array(z.string()).optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  salary_currency: z.string().optional(),
  url: z.string().url(),
  source: z.string().optional(),
  posted_date: z.string().optional(),
  status: z
    .enum(["saved", "applied", "interviewing", "offer", "rejected"])
    .optional(),
});

// Request body schema - supports both single job and multiple jobs
const AnalyzeRequestSchema = z.object({
  job: JobSchema.optional(),
  jobs: z.array(JobSchema).optional(),
  profileId: z.string().optional(),
  save: z.boolean().optional(),
}).refine(
  (data) => data.job !== undefined || (data.jobs !== undefined && data.jobs.length > 0),
  {
    message: "Either 'job' or 'jobs' array must be provided",
  }
);

/**
 * POST /api/analyze
 *
 * Analyzes match between a job and user profile using AI
 *
 * @example
 * POST /api/analyze
 * Body: {
 *   "job": {
 *     "title": "AI Engineer",
 *     "company": "Spotify",
 *     "location": "Stockholm",
 *     "remote_type": "hybrid",
 *     "description": "Build AI systems",
 *     "requirements": ["Python", "LLMs"],
 *     "url": "https://jobs.lever.co/spotify/ai"
 *   },
 *   "save": true
 * }
 *
 * Response: {
 *   "matchScore": {
 *     "overall_score": 85,
 *     "skills_match": 90,
 *     ...
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  let storage: StorageService | null = null;

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          details: "Request body must be valid JSON",
        },
        { status: 400 }
      );
    }

    // Validate request
    const validation = AnalyzeRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details:
            validation.error?.issues
              ?.map((e) => `${e.path.join(".")}: ${e.message}`)
              .join(", ") || "Invalid request",
        },
        { status: 400 }
      );
    }

    const { job: jobData, jobs: jobsData, profileId, save } = validation.data;

    // Initialize services
    const dbPath = process.env.DATABASE_PATH || "./data/jobs.db";
    storage = new StorageService(dbPath);

    // Get profile
    let profile;
    try {
      if (profileId) {
        profile = storage.getProfile(profileId);
        if (!profile) {
          return NextResponse.json(
            { error: `Profile not found with ID: ${profileId}` },
            { status: 400 }
          );
        }
      } else {
        const profiles = storage.getAllProfiles();
        if (profiles.length === 0) {
          return NextResponse.json(
            {
              error: "No profile found. Please create a profile first.",
            },
            { status: 400 }
          );
        }
        profile = profiles[0];
      }
    } catch (error) {
      return NextResponse.json(
        {
          error: "No profile found. Please create a profile first.",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 }
      );
    }

    // Handle empty jobs array
    const jobsToAnalyze = jobsData || (jobData ? [jobData] : []);
    
    if (jobsToAnalyze.length === 0) {
      return NextResponse.json({
        success: true,
        matches: [],
        profile: {
          id: profile.id,
          name: profile.name,
        },
      });
    }

    // Initialize Claude service
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    // 🔍 DEBUG: Log para verificar se a API key está sendo carregada
    console.log('[DEBUG] Analyze API - Environment check:');
    console.log('[DEBUG] 1. NODE_ENV:', process.env.NODE_ENV);
    console.log('[DEBUG] 2. API Key exists?', !!apiKey);
    console.log('[DEBUG] 3. API Key length?', apiKey?.length || 0);
    console.log('[DEBUG] 4. API Key first 20 chars:', apiKey?.substring(0, 20) || 'N/A');
    console.log('[DEBUG] 5. All env vars with ANTHROPIC:', Object.keys(process.env).filter(k => k.includes('ANTHROPIC')));
    
    // 🔥 MOCK MODE: Ative para testar sem API key (desative depois)
    const USE_MOCK = !apiKey || process.env.USE_MOCK_ANALYSIS === 'true';
    
    if (USE_MOCK) {
      console.log('[DEBUG] 6. Using MOCK mode (no API key or USE_MOCK_ANALYSIS=true)');
    } else {
      console.log('[DEBUG] 6. Using REAL Claude API');
    }

    if (!apiKey && !USE_MOCK) {
      console.error('[DEBUG] 7. ERROR: API KEY IS MISSING!');
      return NextResponse.json(
        { error: "AI service not configured. Please contact administrator." },
        { status: 500 }
      );
    }

    let claude: ClaudeService | null = null;
    if (!USE_MOCK) {
      claude = new ClaudeService(apiKey, {
        enableLogging: process.env.NODE_ENV === "development",
      });
    }

    // Analyze each job
    const matches = [];
    const errors = [];

    for (const jobDataItem of jobsToAnalyze) {
      try {
        // Create job object with validation
        const { id, ...jobDataWithoutId } = jobDataItem;
        const job = createJob({
          ...jobDataWithoutId,
          posted_date: jobDataItem.posted_date
            ? new Date(jobDataItem.posted_date)
            : new Date(),
          source: jobDataItem.source || "web",
          status: jobDataItem.status || "saved",
          nice_to_have: jobDataItem.nice_to_have || [],
        });

        // Analyze match
        let matchScore;
        
        if (USE_MOCK && !claude) {
          // 🔥 MOCK ANALYSIS - Remove quando API key funcionar
          console.log(`[MOCK] Analyzing job: ${job.title} at ${job.company}`);
          
          const randomScore = Math.floor(Math.random() * 40) + 60; // 60-100
          const matchingSkills = profile.skills.filter(skill => 
            job.requirements.some(req => req.toLowerCase().includes(skill.toLowerCase())) ||
            job.description?.toLowerCase().includes(skill.toLowerCase())
          ).slice(0, 5);
          
          matchScore = {
            job_id: job.id || `job-${Date.now()}`,
            profile_id: profile.id,
            overall_score: randomScore,
            skills_match: Math.min(100, randomScore + Math.floor(Math.random() * 10) - 5),
            experience_match: Math.min(100, randomScore + Math.floor(Math.random() * 10) - 5),
            location_match: job.location?.toLowerCase().includes('stockholm') || job.location?.toLowerCase().includes('sweden') ? 100 : 70,
            company_match: randomScore + Math.floor(Math.random() * 10) - 5,
            requirements_match: Math.min(100, randomScore + Math.floor(Math.random() * 10) - 5),
            matching_skills: matchingSkills.length > 0 ? matchingSkills : profile.skills.slice(0, 3),
            missing_skills: ['Kubernetes', 'Docker'].slice(0, Math.floor(Math.random() * 3)),
            recommendation: randomScore >= 80 ? 'strong_apply' : randomScore >= 70 ? 'apply' : 'maybe',
            details: `Mock analysis for ${job.title} at ${job.company}. Your skills in ${matchingSkills.join(', ') || profile.skills.slice(0, 3).join(', ')} align well with this role. Overall match score: ${randomScore}%.`,
            created_at: new Date(),
          };
          
          console.log(`[MOCK] Match score: ${matchScore.overall_score}% for ${job.title}`);
        } else {
          // Real API call
          if (!claude) {
            throw new Error('Claude service not initialized');
          }
          matchScore = await claude.analyzeMatch(profile, job);
        }

        // Save if requested
        if (save) {
          try {
            // Check if job already exists by URL
            const existingJob = storage.getJobByUrl(job.url);

            if (!existingJob) {
              storage.saveJob(job);
            }

            // Always save/update match score
            storage.saveMatchScore(matchScore);
          } catch (error) {
            console.error("Error saving to database:", error);
            // Don't fail the request if save fails, just log it
          }
        }

        matches.push(matchScore);
      } catch (error) {
        console.error(`Failed to analyze job ${jobDataItem.id || jobDataItem.title}:`, error);
        errors.push({
          jobId: jobDataItem.id,
          jobTitle: jobDataItem.title,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Return results
    return NextResponse.json(
      {
        success: true,
        profile: {
          id: profile.id,
          name: profile.name,
        },
        totalJobs: jobsToAnalyze.length,
        matchesAnalyzed: matches.length,
        matches,
        errors: errors.length > 0 ? errors : undefined,
        usingMock: USE_MOCK, // 🔍 DEBUG: Indica se está usando mock
        // API Usage (zero for mock, real values for API calls)
        apiUsage: USE_MOCK ? {
          input_tokens: 0,
          output_tokens: 0,
          total_tokens: 0,
          cost_usd: 0,
        } : undefined, // Real API calls should include this from ClaudeService
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/analyze:", error);

    // Handle specific errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: "AI service configuration error" },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Failed to analyze job match",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    // Close database connection
    if (storage) {
      try {
        storage.close();
      } catch (error) {
        console.error("Error closing storage:", error);
      }
    }
  }
}

/**
 * GET /api/analyze
 *
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json(
    {
      endpoint: "/api/analyze",
      method: "POST",
      description: "Analyzes job-profile match using AI (Claude)",
      parameters: {
        job: {
          type: "object",
          required: true,
          description: "Job details to analyze",
          fields: {
            title: "string (required)",
            company: "string (required)",
            location: "string (required)",
            remote_type: "office | hybrid | remote (required)",
            description: "string (required)",
            requirements: "string[] (required)",
            url: "string (required, URL format)",
            nice_to_have: "string[] (optional)",
            salary_min: "number (optional)",
            salary_max: "number (optional)",
          },
        },
        profileId: {
          type: "string",
          required: false,
          description:
            "Specific profile ID (uses current profile if not provided)",
        },
        save: {
          type: "boolean",
          required: false,
          description: "Save job and match score to database",
          default: false,
        },
      },
      response: {
        matchScore: {
          overall_score: "number (0-100)",
          skills_match: "number (0-100)",
          experience_match: "number (0-100)",
          location_match: "number (0-100)",
          company_match: "number (0-100)",
          requirements_match: "number (0-100)",
          matching_skills: "string[]",
          missing_skills: "string[]",
          recommendation: "strong_apply | apply | maybe | skip",
          details: "string (AI analysis)",
        },
      },
      example: {
        request: {
          job: {
            title: "AI Engineer",
            company: "Spotify",
            location: "Stockholm, Sweden",
            remote_type: "hybrid",
            description: "Build AI-powered music recommendations",
            requirements: ["Python", "LLMs", "Machine Learning"],
            url: "https://jobs.lever.co/spotify/ai-engineer",
          },
          save: true,
        },
      },
    },
    { status: 200 }
  );
}
