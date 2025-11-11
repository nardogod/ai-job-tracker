/**
 * Match Analysis API Route Tests
 *
 * FASE 1: RED - Tests written before implementation
 * These tests are expected to FAIL until Analyze API is implemented
 */

import { describe, test, expect, beforeEach } from "@jest/globals";

// Mock Next.js server components
jest.mock("next/server", () => ({
  NextRequest: class NextRequest {
    url: string;
    constructor(url: string) {
      this.url = url;
    }
    async json() {
      return {};
    }
  },
  NextResponse: {
    json: jest.fn((data: any, init?: any) => {
      const status = init?.status || 200;
      const ok = status >= 200 && status < 300;
      const response = {
        json: async () => data,
        status,
        ok,
      };
      return response;
    }),
  },
}));

// Create a shared mock instance
const createMockStorage = () => ({
  getCurrentProfile: jest.fn(),
  getAllProfiles: jest.fn(() => []),
  listProfiles: jest.fn(() => []),
  getProfile: jest.fn(),
  saveMatchScore: jest.fn(),
  saveJob: jest.fn(),
  getJobByUrl: jest.fn(() => null),
  close: jest.fn(),
});

// Mock StorageService
jest.mock("@/lib/services/storage", () => ({
  StorageService: jest.fn().mockImplementation(() => createMockStorage()),
}));

// Mock ClaudeService
jest.mock("@/lib/services/claude", () => ({
  ClaudeService: jest.fn().mockImplementation(() => ({
    analyzeMatch: jest.fn(),
  })),
}));

// Mock createJob
jest.mock("@/lib/types/job", () => ({
  createJob: jest.fn((data: any) => ({
    id: data.id || "generated-id",
    ...data,
    posted_date: data.posted_date ? new Date(data.posted_date) : new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  })),
}));

describe("Match Analysis API Route", () => {
  let mockStorage: any;
  let mockClaude: any;
  let StorageServiceMock: any;
  let ClaudeServiceMock: any;

  beforeEach(() => {
    // Mock environment variable
    process.env.ANTHROPIC_API_KEY = "test-api-key";
    jest.clearAllMocks();

    // Setup mocks
    const storageModule = require("@/lib/services/storage");
    const claudeModule = require("@/lib/services/claude");

    StorageServiceMock = storageModule.StorageService;
    ClaudeServiceMock = claudeModule.ClaudeService;

    // Create a fresh mock instance for each test
    const mockStorageInstance = createMockStorage();
    StorageServiceMock.mockImplementation(() => mockStorageInstance);
    mockStorage = mockStorageInstance;

    const mockClaudeInstance = {
      analyzeMatch: jest.fn(),
    };
    ClaudeServiceMock.mockImplementation(() => mockClaudeInstance);
    mockClaude = mockClaudeInstance;
  });

  describe("POST /api/analyze - Match Analysis", () => {
    test("should analyze match successfully with valid job", async () => {
      const mockProfile = {
        id: "profile-1",
        name: "Test Engineer",
        email: "test@example.com",
        experience_years: 4,
        skills: [
          "Python",
          "Machine Learning",
          "TensorFlow",
          "PyTorch",
          "Data Science",
        ],
        location_preference: "Stockholm, Sweden",
        visa_status: "work_permit",
        languages: {
          English: "fluent",
          Swedish: "intermediate",
        },
        company_size_preference: "any",
        remote_preference: "flexible",
        min_salary: 50000,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const jobs = [
        {
          id: "job-1",
          title: "Machine Learning Engineer",
          company: "Spotify",
          location: "Stockholm, Sweden",
          remote_type: "hybrid",
          requirements: ["Python", "Machine Learning", "3+ years experience"],
          nice_to_have: ["TensorFlow", "PyTorch"],
          description: "Build ML models for music recommendation",
          url: "https://jobs.lever.co/spotify/test",
          posted_date: new Date().toISOString(),
        },
      ];

      const mockMatch = {
        job_id: "job-1",
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        location_match: 100,
        company_match: 70,
        requirements_match: 85,
        matching_skills: [
          "Python",
          "Machine Learning",
          "TensorFlow",
          "PyTorch",
        ],
        missing_skills: [],
        recommendation: "strong_apply",
        details: "Excellent match with strong skills alignment",
        created_at: new Date(),
      };

      mockStorage.listProfiles = jest.fn().mockReturnValue([mockProfile]);
      mockStorage.getAllProfiles = jest.fn().mockReturnValue([mockProfile]);
      mockClaude.analyzeMatch = jest.fn().mockResolvedValue(mockMatch);

      const { POST } = await import("@/app/api/analyze/route");
      const request = {
        json: async () => ({ jobs }),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.matches).toHaveLength(1);
      expect(data.matches[0]).toHaveProperty("overall_score");
      expect(data.matches[0].overall_score).toBeGreaterThanOrEqual(0);
      expect(data.matches[0].overall_score).toBeLessThanOrEqual(100);
      expect(data.matches[0]).toHaveProperty("recommendation");
      expect(data.matches[0]).toHaveProperty("matching_skills");
      expect(data.matches[0]).toHaveProperty("missing_skills");
    });

    test("should handle multiple jobs", async () => {
      const mockProfile = {
        id: "profile-1",
        name: "Test Engineer",
        email: "test@example.com",
        experience_years: 4,
        skills: ["Python", "ML"],
        location_preference: "Stockholm",
        visa_status: "work_permit",
        languages: { English: "fluent" },
        company_size_preference: "any",
        remote_preference: "flexible",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const jobs = [
        {
          id: "job-1",
          title: "ML Engineer",
          company: "Spotify",
          location: "Stockholm",
          remote_type: "hybrid",
          requirements: ["Python", "ML"],
          nice_to_have: [],
          description: "ML role",
          url: "https://test.com/1",
          posted_date: new Date().toISOString(),
        },
        {
          id: "job-2",
          title: "Data Scientist",
          company: "Klarna",
          location: "Stockholm",
          remote_type: "remote",
          requirements: ["Python", "Data Science"],
          nice_to_have: ["ML"],
          description: "Data role",
          url: "https://test.com/2",
          posted_date: new Date().toISOString(),
        },
      ];

      mockStorage.listProfiles = jest.fn().mockReturnValue([mockProfile]);
      mockStorage.getAllProfiles = jest.fn().mockReturnValue([mockProfile]);
      mockClaude.analyzeMatch = jest
        .fn()
        .mockResolvedValueOnce({
          job_id: "job-1",
          overall_score: 80,
          recommendation: "apply",
        })
        .mockResolvedValueOnce({
          job_id: "job-2",
          overall_score: 75,
          recommendation: "apply",
        });

      const { POST } = await import("@/app/api/analyze/route");
      const request = {
        json: async () => ({ jobs }),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.matches).toHaveLength(2);
      expect(data.totalJobs).toBe(2);
      expect(data.matchesAnalyzed).toBe(2);
    });

    test("should fail if no profile exists", async () => {
      mockStorage.listProfiles = jest.fn().mockReturnValue([]);
      mockStorage.getAllProfiles = jest.fn().mockReturnValue([]);

      const jobs = [
        {
          id: "1",
          title: "Test",
          company: "Test",
          location: "Test",
          remote_type: "office",
          requirements: [],
          nice_to_have: [],
          description: "Test",
          url: "https://test.com",
          posted_date: new Date().toISOString(),
        },
      ];

      const { POST } = await import("@/app/api/analyze/route");
      const request = {
        json: async () => ({ jobs }),
      } as any;

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("No profile found");
    });

    test("should handle empty jobs array", async () => {
      const mockProfile = {
        id: "profile-1",
        name: "Test Engineer",
        email: "test@example.com",
        experience_years: 4,
        skills: ["Python"],
        location_preference: "Stockholm",
        visa_status: "work_permit",
        languages: { English: "fluent" },
        company_size_preference: "any",
        remote_preference: "flexible",
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockStorage.listProfiles = jest.fn().mockReturnValue([mockProfile]);
      mockStorage.getAllProfiles = jest.fn().mockReturnValue([mockProfile]);

      const { POST } = await import("@/app/api/analyze/route");
      const request = {
        json: async () => ({ jobs: [] }),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.matches).toEqual([]);
    });

    test("should include profile info in response", async () => {
      const mockProfile = {
        id: "profile-1",
        name: "Test Engineer",
        email: "test@example.com",
        experience_years: 4,
        skills: ["Python"],
        location_preference: "Stockholm",
        visa_status: "work_permit",
        languages: { English: "fluent" },
        company_size_preference: "any",
        remote_preference: "flexible",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const jobs = [
        {
          id: "job-1",
          title: "Test",
          company: "Test",
          location: "Stockholm",
          remote_type: "hybrid",
          requirements: ["Python"],
          nice_to_have: [],
          description: "Test job",
          url: "https://test.com",
          posted_date: new Date().toISOString(),
        },
      ];

      mockStorage.listProfiles = jest.fn().mockReturnValue([mockProfile]);
      mockStorage.getAllProfiles = jest.fn().mockReturnValue([mockProfile]);
      mockClaude.analyzeMatch = jest.fn().mockResolvedValue({
        job_id: "job-1",
        overall_score: 80,
        recommendation: "apply",
      });

      const { POST } = await import("@/app/api/analyze/route");
      const request = {
        json: async () => ({ jobs }),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(data.profile).toBeDefined();
      expect(data.profile).toHaveProperty("id");
      expect(data.profile).toHaveProperty("name");
    });

    test("should handle errors gracefully", async () => {
      const mockProfile = {
        id: "profile-1",
        name: "Test Engineer",
        email: "test@example.com",
        experience_years: 4,
        skills: ["Python"],
        location_preference: "Stockholm",
        visa_status: "work_permit",
        languages: { English: "fluent" },
        company_size_preference: "any",
        remote_preference: "flexible",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const jobs = [
        {
          id: "job-1",
          title: "Test",
          company: "Test",
          location: "Stockholm",
          remote_type: "hybrid",
          requirements: ["Python"],
          nice_to_have: [],
          description: "Test job",
          url: "https://test.com",
          posted_date: new Date().toISOString(),
        },
      ];

      mockStorage.listProfiles = jest.fn().mockReturnValue([mockProfile]);
      mockStorage.getAllProfiles = jest.fn().mockReturnValue([mockProfile]);
      mockClaude.analyzeMatch = jest
        .fn()
        .mockRejectedValue(new Error("Claude API error"));

      const { POST } = await import("@/app/api/analyze/route");
      const request = {
        json: async () => ({ jobs }),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      // Should still return success but with errors array
      expect(data.success).toBe(true);
      expect(data.errors).toBeDefined();
      expect(data.errors.length).toBeGreaterThan(0);
    });
  });
});
