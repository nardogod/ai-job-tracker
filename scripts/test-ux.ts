#!/usr/bin/env ts-node

/**
 * Quick UX Test Script
 * Tests the CLI UX improvements without calling real Claude API
 *
 * Run: npx ts-node scripts/test-ux.ts
 */

import { AnalyzeCommand } from "../src/cli/commands/analyze";
import { StorageService } from "../src/services/storage";
import { ClaudeService } from "../src/services/claude";
import { createProfile } from "../src/types/profile";
import { createJob } from "../src/types/job";
import { createMatchScore } from "../src/types/match-score";

console.log("🧪 Testing CLI UX Improvements\n");

// Set NODE_ENV to disable spinners in tests
process.env.NODE_ENV = "test";

// Create temporary in-memory storage
const storage = new StorageService(":memory:");

// Create a test profile (using the example from create-profile.ts)
const testProfile = createProfile({
  name: "Test User",
  email: "test@example.com",
  experience_years: 5,
  skills: [
    "Python",
    "TypeScript",
    "Machine Learning",
    "LLMs",
    "NLP",
    "TensorFlow",
    "PyTorch",
    "AWS",
    "Docker",
    "Git",
    "TDD",
    "REST APIs",
  ],
  location_preference: "Stockholm, Sweden",
  visa_status: "needs_sponsorship",
  languages: {
    English: "fluent",
    Swedish: "intermediate",
    Portuguese: "native",
  },
  company_size_preference: "scaleup",
  remote_preference: "hybrid",
  min_salary: 60000,
});

console.log("✅ Created test profile:", testProfile.name);

// Save profile to storage
storage.saveProfile(testProfile);

// Create test jobs with different match scores
const job1 = createJob({
  title: "Senior AI/ML Engineer",
  company: "Spotify",
  location: "Stockholm, Sweden",
  remote_type: "hybrid" as const,
  description:
    "Build cutting-edge ML systems for music recommendations using LLMs",
  requirements: [
    "Python",
    "Machine Learning",
    "LLMs",
    "Production ML",
    "TypeScript",
  ],
  nice_to_have: ["AWS", "Docker", "TDD"],
  salary_min: 65000,
  salary_max: 85000,
  salary_currency: "SEK",
  url: "https://careers.spotify.com/ai-ml-1",
  source: "manual",
  posted_date: new Date(),
});

const job2 = createJob({
  title: "Machine Learning Engineer",
  company: "Klarna",
  location: "Stockholm, Sweden",
  remote_type: "hybrid" as const,
  description: "Build ML models for financial services and fraud detection",
  requirements: ["Python", "Machine Learning", "NLP", "SQL", "REST APIs"],
  nice_to_have: ["LLMs", "AWS"],
  salary_min: 60000,
  salary_max: 75000,
  salary_currency: "SEK",
  url: "https://careers.klarna.com/ml-1",
  source: "manual",
  posted_date: new Date(),
});

const job3 = createJob({
  title: "AI Research Engineer",
  company: "H&M Group",
  location: "Stockholm, Sweden",
  remote_type: "office" as const,
  description: "Research and develop AI solutions for fashion recommendations",
  requirements: [
    "Python",
    "Machine Learning",
    "Computer Vision",
    "Research Experience",
  ],
  nice_to_have: ["Fashion Industry Knowledge", "Retail Analytics"],
  salary_min: 55000,
  salary_max: 70000,
  salary_currency: "SEK",
  url: "https://careers.hm.com/ai-research-1",
  source: "manual",
  posted_date: new Date(),
});

const job4 = createJob({
  title: "Senior Java Backend Engineer",
  company: "TradCorp",
  location: "Stockholm, Sweden",
  remote_type: "office" as const,
  description: "Build enterprise backend systems using Java and Spring",
  requirements: ["Java", "Spring Boot", "Microservices", "Kubernetes", "SQL"],
  nice_to_have: ["Cloud", "DevOps"],
  salary_min: 58000,
  salary_max: 72000,
  salary_currency: "SEK",
  url: "https://careers.tradcorp.se/backend-1",
  source: "manual",
  posted_date: new Date(),
});

const jobs = [
  {
    job: job1,
    matchScore: createMatchScore({
      job_id: job1.id,
      overall_score: 92,
      skills_match: 95,
      experience_match: 88,
      location_match: 100,
      company_match: 90,
      requirements_match: 94,
      matching_skills: [
        "Python",
        "Machine Learning",
        "LLMs",
        "TypeScript",
        "AWS",
        "Docker",
        "TDD",
      ],
      missing_skills: ["Production ML"],
      recommendation: "strong_apply",
      details:
        "Excellent match! Your skills align very well with this role. Strong background in ML, LLMs, and TypeScript. The focus on production ML systems matches your experience. Spotify offers great work-life balance and competitive compensation.",
    }),
  },
  {
    job: job2,
    matchScore: createMatchScore({
      job_id: job2.id,
      overall_score: 78,
      skills_match: 85,
      experience_match: 75,
      location_match: 100,
      company_match: 70,
      requirements_match: 82,
      matching_skills: ["Python", "Machine Learning", "NLP", "REST APIs"],
      missing_skills: ["SQL", "Financial Domain Knowledge"],
      recommendation: "apply",
      details:
        "Good match overall. Strong ML and NLP skills are relevant. Missing some financial domain knowledge, but that can be learned on the job. Klarna is a well-funded fintech with good growth prospects.",
    }),
  },
  {
    job: job3,
    matchScore: createMatchScore({
      job_id: job3.id,
      overall_score: 55,
      skills_match: 60,
      experience_match: 55,
      location_match: 100,
      company_match: 40,
      requirements_match: 58,
      matching_skills: ["Python", "Machine Learning"],
      missing_skills: [
        "Computer Vision",
        "Research Experience",
        "Fashion Domain",
      ],
      recommendation: "maybe",
      details:
        "Moderate match. Your ML skills are relevant, but the role requires computer vision expertise which is not in your profile. Office-only policy may not align with your hybrid preference. Lower salary range than your minimum.",
    }),
  },
  {
    job: job4,
    matchScore: createMatchScore({
      job_id: job4.id,
      overall_score: 25,
      skills_match: 15,
      experience_match: 40,
      location_match: 100,
      company_match: 20,
      requirements_match: 10,
      matching_skills: [],
      missing_skills: [
        "Java",
        "Spring Boot",
        "Microservices",
        "Kubernetes",
        "SQL",
      ],
      recommendation: "skip",
      details:
        "Poor match. This role requires Java/Spring expertise which is not in your skill set. Your background is in Python/TypeScript and ML, which are not relevant here. Office-only policy and traditional corporate culture may not align with your preferences.",
    }),
  },
];

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📊 TESTING 4 JOBS WITH DIFFERENT MATCH SCORES");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// Mock ClaudeService to return our pre-defined scores
class MockClaudeService extends ClaudeService {
  private currentIndex = 0;

  constructor() {
    // Use a valid-looking API key format - won't be used since we override analyzeMatch
    super("sk-ant-api03-mock-key-for-testing-only-1234567890");
  }

  async analyzeMatch(_profile: any, _job: any): Promise<any> {
    const jobData = jobs[this.currentIndex];
    if (!jobData) {
      throw new Error("No more jobs to test");
    }
    const result = jobData.matchScore;
    this.currentIndex++;
    return result;
  }
}

// Test each job
async function testJobs() {
  const mockClaude = new MockClaudeService();
  const command = new AnalyzeCommand(mockClaude, storage);

  for (let i = 0; i < jobs.length; i++) {
    const jobData = jobs[i];
    if (!jobData) {
      continue;
    }
    const { job } = jobData;

    console.log(`\n${"=".repeat(60)}`);
    console.log(`TEST ${i + 1}/${jobs.length}: ${job.title} at ${job.company}`);
    console.log(`${"=".repeat(60)}\n`);

    try {
      await command.execute({
        url: job.url,
        job,
        save: false,
        verbose: true,
      });
    } catch (error) {
      console.error("❌ Error:", error);
    }

    // Add spacing between jobs
    if (i < jobs.length - 1) {
      console.log("\n" + "─".repeat(60) + "\n");
      // Small delay to see output better
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

// Run tests
testJobs()
  .then(() => {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ UX TEST COMPLETE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("You should see:");
    console.log("  🟢 Green for strong_apply (92%)");
    console.log("  🟡 Yellow for apply (78%)");
    console.log("  🔵 Blue for maybe (55%)");
    console.log("  🔴 Red for skip (25%)");
    console.log("\n  📊 Tables for job info and score breakdown");
    console.log("  ⭐ Emojis and visual separators");
    console.log("  🎨 Color-coded scores\n");
    storage.close();
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    storage.close();
    process.exit(1);
  });
