/**
 * ClaudeService Unit Tests
 * FASE RED - TDD (Test-Driven Development)
 *
 * Testes escritos ANTES da implementação
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { createProfile } from "../../../src/types/profile";
import { createJob } from "../../../src/types/job";
import type { Profile } from "../../../src/types/profile";
import type { Job } from "../../../src/types/job";

// Mock Anthropic SDK
const mockMessagesCreate = jest.fn() as jest.MockedFunction<any>;

jest.mock("@anthropic-ai/sdk", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: mockMessagesCreate,
      },
    })),
  };
});

import { ClaudeService } from "../../../src/services/claude";

describe("ClaudeService", () => {
  let service: ClaudeService;
  let mockProfile: Profile;
  let mockJob: Job;

  beforeEach(() => {
    // Reset mock before each test
    mockMessagesCreate.mockReset();

    // Default mock response for successful API calls
    mockMessagesCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            overall_score: 85,
            skills_match: 90,
            experience_match: 80,
            location_match: 90,
            company_match: 75,
            requirements_match: 85,
            matching_skills: [
              "Python",
              "TypeScript",
              "Machine Learning",
              "LLMs",
            ],
            missing_skills: ["Swedish"],
            recommendation: "strong_apply",
            details:
              "This is an excellent match. The candidate has strong skills in Python, TypeScript, Machine Learning, and LLMs which align perfectly with the job requirements. The location preference matches the job location, and the experience level is appropriate for the role.",
          }),
        },
      ],
    });

    // Mock profile
    mockProfile = createProfile({
      name: "John Doe",
      email: "john@example.com",
      experience_years: 5,
      skills: ["Python", "TypeScript", "Machine Learning", "LLMs", "AWS"],
      location_preference: "Stockholm, Sweden",
      visa_status: "needs_sponsorship",
      languages: {
        English: "fluent",
        Swedish: "intermediate",
      },
      company_size_preference: "scaleup",
      remote_preference: "hybrid",
      min_salary: 60000,
    });

    // Mock job
    mockJob = createJob({
      title: "AI Engineer",
      company: "TechCorp AB",
      location: "Stockholm, Sweden",
      remote_type: "hybrid",
      description:
        "We are looking for an AI Engineer to work with LLMs and ML.",
      requirements: [
        "Python programming",
        "Experience with LLMs",
        "Machine Learning knowledge",
        "TypeScript experience",
      ],
      nice_to_have: ["AWS experience", "Swedish language"],
      salary_min: 55000,
      salary_max: 75000,
      salary_currency: "SEK",
      url: "https://example.com/jobs/ai-engineer",
      source: "manual",
      posted_date: new Date(),
    });
  });

  describe("Constructor and Setup", () => {
    it("should create instance with valid API key", () => {
      const apiKey = "sk-ant-test-key";
      service = new ClaudeService(apiKey);
      expect(service).toBeInstanceOf(ClaudeService);
    });

    it("should throw error when API key is missing", () => {
      expect(() => new ClaudeService("")).toThrow("API key is required");
    });

    it("should throw error when API key is undefined", () => {
      expect(() => new ClaudeService(undefined as any)).toThrow(
        "API key is required"
      );
    });

    it("should use environment variable if no API key provided", () => {
      process.env.ANTHROPIC_API_KEY = "sk-ant-env-key";
      service = new ClaudeService();
      expect(service).toBeInstanceOf(ClaudeService);
      delete process.env.ANTHROPIC_API_KEY;
    });

    it("should throw error if no API key in constructor or env", () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(() => new ClaudeService()).toThrow("API key is required");
    });
  });

  describe("analyzeMatch", () => {
    beforeEach(() => {
      service = new ClaudeService("sk-ant-test-key");
    });

    it("should return a valid MatchScore object", async () => {
      const result = await service.analyzeMatch(mockProfile, mockJob);

      expect(result).toBeDefined();
      expect(result.job_id).toBe(mockJob.id);
      expect(result.overall_score).toBeGreaterThanOrEqual(0);
      expect(result.overall_score).toBeLessThanOrEqual(100);
      expect(result.created_at).toBeInstanceOf(Date);
    });

    it("should return all required score fields", async () => {
      const result = await service.analyzeMatch(mockProfile, mockJob);

      expect(result.skills_match).toBeGreaterThanOrEqual(0);
      expect(result.skills_match).toBeLessThanOrEqual(100);
      expect(result.experience_match).toBeGreaterThanOrEqual(0);
      expect(result.experience_match).toBeLessThanOrEqual(100);
      expect(result.location_match).toBeGreaterThanOrEqual(0);
      expect(result.location_match).toBeLessThanOrEqual(100);
      expect(result.company_match).toBeGreaterThanOrEqual(0);
      expect(result.company_match).toBeLessThanOrEqual(100);
      expect(result.requirements_match).toBeGreaterThanOrEqual(0);
      expect(result.requirements_match).toBeLessThanOrEqual(100);
    });

    it("should identify matching skills correctly", async () => {
      const result = await service.analyzeMatch(mockProfile, mockJob);

      expect(result.matching_skills).toBeInstanceOf(Array);
      expect(result.matching_skills.length).toBeGreaterThan(0);
      // Should match: Python, TypeScript, Machine Learning, LLMs
      expect(result.matching_skills).toContain("Python");
    });

    it("should identify missing skills correctly", async () => {
      const result = await service.analyzeMatch(mockProfile, mockJob);

      expect(result.missing_skills).toBeInstanceOf(Array);
      // No overlap between matching and missing
      const overlap = result.matching_skills.filter((s: string) =>
        result.missing_skills.includes(s)
      );
      expect(overlap).toHaveLength(0);
    });

    it("should generate appropriate recommendation for high score", async () => {
      const result = await service.analyzeMatch(mockProfile, mockJob);

      if (result.overall_score >= 80) {
        expect(result.recommendation).toBe("strong_apply");
      } else if (result.overall_score >= 60) {
        expect(result.recommendation).toBe("apply");
      } else if (result.overall_score >= 40) {
        expect(result.recommendation).toBe("maybe");
      } else {
        expect(result.recommendation).toBe("skip");
      }
    });

    it("should include detailed analysis text", async () => {
      const result = await service.analyzeMatch(mockProfile, mockJob);

      expect(result.details).toBeDefined();
      expect(typeof result.details).toBe("string");
      expect(result.details!.length).toBeGreaterThan(50);
    });

    it("should handle profile with minimal skills", async () => {
      // Mock response for minimal profile
      mockMessagesCreate.mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              overall_score: 45,
              skills_match: 30,
              experience_match: 40,
              location_match: 50,
              company_match: 50,
              requirements_match: 35,
              matching_skills: ["JavaScript"],
              missing_skills: ["Python", "Machine Learning", "LLMs"],
              recommendation: "maybe",
              details:
                "The candidate has minimal skills compared to the job requirements. Missing key skills like Python, Machine Learning, and LLMs.",
            }),
          },
        ],
      });

      const minimalProfile = createProfile({
        name: "Jane Doe",
        email: "jane@example.com",
        experience_years: 1,
        skills: ["JavaScript"],
        location_preference: "Remote",
        visa_status: "eu_citizen",
        languages: { English: "native" },
      });

      const result = await service.analyzeMatch(minimalProfile, mockJob);

      expect(result).toBeDefined();
      expect(result.overall_score).toBeLessThan(60);
      expect(result.missing_skills.length).toBeGreaterThan(0);
    });

    it("should handle job with no requirements", async () => {
      // Mock response for simple job
      mockMessagesCreate.mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              overall_score: 75,
              skills_match: 80,
              experience_match: 70,
              location_match: 80,
              company_match: 70,
              requirements_match: 75,
              matching_skills: ["Python", "TypeScript"],
              missing_skills: [],
              recommendation: "apply",
              details:
                "The candidate has strong skills that exceed the basic requirements for this entry-level position.",
            }),
          },
        ],
      });

      const simpleJob = createJob({
        title: "Junior Developer",
        company: "StartupCo",
        location: "Remote",
        remote_type: "remote",
        description: "Entry level position",
        requirements: ["Basic programming"],
        url: "https://example.com/jobs/junior",
        source: "manual",
        posted_date: new Date(),
      });

      const result = await service.analyzeMatch(mockProfile, simpleJob);

      expect(result).toBeDefined();
      expect(result.requirements_match).toBeGreaterThan(50);
    });

    it("should consider location match in scoring", async () => {
      const remoteJob = {
        ...mockJob,
        location: "Remote",
        remote_type: "remote" as const,
      };
      const result = await service.analyzeMatch(mockProfile, remoteJob);

      expect(result.location_match).toBeDefined();
    });

    it("should consider experience level in scoring", async () => {
      const seniorProfile = createProfile({
        ...mockProfile,
        experience_years: 10,
      });

      const result = await service.analyzeMatch(seniorProfile, mockJob);
      expect(result.experience_match).toBeGreaterThan(50);
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      service = new ClaudeService("sk-ant-test-key");
      // Reset mock to default success response
      mockMessagesCreate.mockReset();
      mockMessagesCreate.mockResolvedValue({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              overall_score: 85,
              skills_match: 90,
              experience_match: 80,
              location_match: 90,
              company_match: 75,
              requirements_match: 85,
              matching_skills: [
                "Python",
                "TypeScript",
                "Machine Learning",
                "LLMs",
              ],
              missing_skills: ["Swedish"],
              recommendation: "strong_apply",
              details:
                "This is an excellent match. The candidate has strong skills in Python, TypeScript, Machine Learning, and LLMs which align perfectly with the job requirements. The location preference matches the job location, and the experience level is appropriate for the role.",
            }),
          },
        ],
      });
    });

    it("should throw error for invalid profile", async () => {
      const invalidProfile = { name: "Test" } as any;

      await expect(
        service.analyzeMatch(invalidProfile, mockJob)
      ).rejects.toThrow();
    });

    it("should throw error for invalid job", async () => {
      const invalidJob = { title: "Test" } as any;

      await expect(
        service.analyzeMatch(mockProfile, invalidJob)
      ).rejects.toThrow();
    });

    it("should handle API errors gracefully", async () => {
      // Mock API error - override default mock
      mockMessagesCreate.mockReset();
      mockMessagesCreate.mockRejectedValue(
        new Error(
          '401 {"type":"error","error":{"type":"authentication_error","message":"invalid x-api-key"}}'
        )
      );

      const badService = new ClaudeService("sk-ant-invalid-key");

      await expect(
        badService.analyzeMatch(mockProfile, mockJob)
      ).rejects.toThrow();
    });

    it("should handle network timeouts", async () => {
      // Mock network timeout scenario - override default mock
      mockMessagesCreate.mockReset();
      mockMessagesCreate.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Request timeout")), 10);
        });
      });

      const slowService = new ClaudeService("sk-ant-test-key", { timeout: 1 });

      await expect(
        slowService.analyzeMatch(mockProfile, mockJob)
      ).rejects.toThrow();
    }, 15000);
  });

  describe("calculateScoreBreakdown", () => {
    beforeEach(() => {
      service = new ClaudeService("sk-ant-test-key");
    });

    it("should return structured score breakdown", async () => {
      const breakdown = await service.calculateScoreBreakdown(
        mockProfile,
        mockJob
      );

      expect(breakdown).toHaveProperty("skills_match");
      expect(breakdown).toHaveProperty("experience_match");
      expect(breakdown).toHaveProperty("location_match");
      expect(breakdown).toHaveProperty("company_match");
      expect(breakdown).toHaveProperty("requirements_match");
    });

    it("should have all scores between 0-100", async () => {
      const breakdown = await service.calculateScoreBreakdown(
        mockProfile,
        mockJob
      );

      Object.values(breakdown).forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("generateDetailedAnalysis", () => {
    beforeEach(() => {
      service = new ClaudeService("sk-ant-test-key");
    });

    it("should generate non-empty analysis text", async () => {
      const analysis = await service.generateDetailedAnalysis(
        mockProfile,
        mockJob
      );

      expect(analysis).toBeDefined();
      expect(typeof analysis).toBe("string");
      expect(analysis.length).toBeGreaterThan(100);
    });

    it("should include key information in analysis", async () => {
      const analysis = await service.generateDetailedAnalysis(
        mockProfile,
        mockJob
      );

      // Should mention skills or requirements
      const hasRelevantContent =
        analysis.toLowerCase().includes("skill") ||
        analysis.toLowerCase().includes("experience") ||
        analysis.toLowerCase().includes("match");

      expect(hasRelevantContent).toBe(true);
    });
  });
});
