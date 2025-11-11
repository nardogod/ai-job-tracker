/**
 * Profile API Route Tests
 * 
 * FASE 1: RED - Tests written before implementation
 * These tests are expected to FAIL until Profile API is implemented
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Mock Next.js server components
jest.mock('next/server', () => ({
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
    json: jest.fn((data: any, init?: any) => ({
      json: async () => data,
      status: init?.status || 200,
      ok: (init?.status || 200) < 400,
    })),
  },
}));

// Create a shared mock instance
const createMockStorage = () => ({
  saveProfile: jest.fn(),
  getProfile: jest.fn(),
  getCurrentProfile: jest.fn(),
  listProfiles: jest.fn(() => []),
  getAllProfiles: jest.fn(() => []),
  updateProfile: jest.fn(),
  deleteProfile: jest.fn(),
  close: jest.fn(),
});

// Mock StorageService
jest.mock('@/lib/services/storage', () => ({
  StorageService: jest.fn().mockImplementation(() => createMockStorage()),
}));

// Mock Profile creation
jest.mock('@/lib/types/profile', () => ({
  createProfile: jest.fn((data: any) => ({
    id: 'test-id',
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
  })),
}));

describe('Profile API Route', () => {
  let mockStorage: any;
  let mockCreateProfile: any;
  let StorageServiceMock: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    const storageModule = require('@/lib/services/storage');
    const profileModule = require('@/lib/types/profile');
    
    StorageServiceMock = storageModule.StorageService;
    // Create a fresh mock instance for each test
    const mockInstance = createMockStorage();
    StorageServiceMock.mockImplementation(() => mockInstance);
    mockStorage = mockInstance;
    mockCreateProfile = profileModule.createProfile;
  });

  describe('POST /api/profile - Create Profile', () => {
    test('should create new profile successfully', async () => {
      const profileData = {
        name: 'Nardo Silva',
        email: 'nardo@example.com',
        experience_years: 5,
        skills: ['TypeScript', 'React', 'Node.js', 'AI/ML', 'TDD'],
        location_preference: 'Stockholm, Sweden',
        visa_status: 'eu_citizen',
        languages: { 
          English: 'fluent', 
          Portuguese: 'native', 
          Swedish: 'intermediate' 
        },
        company_size_preference: 'startup',
        remote_preference: 'hybrid',
        min_salary: 60000
      };

      // Mock successful creation
      mockCreateProfile.mockReturnValueOnce({
        id: 'test-id',
        ...profileData,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Mock storage methods
      mockStorage.saveProfile = jest.fn();

      // Import and test the route handler
      const { POST } = await import('@/app/api/profile/route');
      const request = {
        json: async () => profileData,
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.profile).toHaveProperty('id');
      expect(data.profile.name).toBe('Nardo Silva');
      expect(data.profile.experience_years).toBe(5);
      expect(data.profile.skills).toContain('TypeScript');
    });

    test('should validate required fields - missing name', async () => {
      const invalidProfile = { 
        email: 'test@example.com',
        experience_years: 5,
        skills: ['TypeScript']
      };

      const { POST } = await import('@/app/api/profile/route');
      const request = {
        json: async () => invalidProfile,
      } as any;

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('name');
    });

    test('should validate required fields - missing skills', async () => {
      const invalidProfile = { 
        name: 'Test User',
        email: 'test@example.com',
        experience_years: 5
      };

      const { POST } = await import('@/app/api/profile/route');
      const request = {
        json: async () => invalidProfile,
      } as any;

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('skills');
    });

    test('should validate required fields - missing experience', async () => {
      const invalidProfile = { 
        name: 'Test User',
        email: 'test@example.com',
        skills: ['TypeScript']
      };

      const { POST } = await import('@/app/api/profile/route');
      const request = {
        json: async () => invalidProfile,
      } as any;

      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/profile - Retrieve Profile', () => {
    test('should return existing profile', async () => {
      const mockProfile = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        experience_years: 3,
        skills: ['Python', 'ML'],
        location_preference: 'Stockholm',
        visa_status: 'work_permit',
        languages: { English: 'fluent' },
        company_size_preference: 'any',
        remote_preference: 'flexible',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockStorage.getCurrentProfile = jest.fn().mockReturnValue(mockProfile);
      mockStorage.listProfiles = jest.fn().mockReturnValue([mockProfile]);
      mockStorage.getAllProfiles = jest.fn().mockReturnValue([mockProfile]);

      const { GET } = await import('@/app/api/profile/route');
      const response = await GET();
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.profile).toBeDefined();
      expect(data.profile.name).toBe('Test User');
    });

    test('should return null if no profile exists', async () => {
      mockStorage.listProfiles = jest.fn().mockReturnValue([]);
      mockStorage.getAllProfiles = jest.fn().mockReturnValue([]);

      const { GET } = await import('@/app/api/profile/route');
      const response = await GET();
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.profile).toBeNull();
    });
  });

  describe('PUT /api/profile - Update Profile', () => {
    test('should update existing profile', async () => {
      const existingProfile = {
        id: 'test-id',
        name: 'Original Name',
        email: 'original@example.com',
        experience_years: 3,
        skills: ['Python'],
        location_preference: 'Stockholm',
        visa_status: 'work_permit',
        languages: { English: 'fluent' },
        company_size_preference: 'any',
        remote_preference: 'flexible',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const updates = { 
        id: 'test-id',
        name: 'Updated Name',
        experience_years: 6 
      };

      mockStorage.getProfile = jest.fn().mockReturnValue(existingProfile);
      mockStorage.updateProfile = jest.fn().mockImplementation((id, profile) => {
        return { ...existingProfile, ...updates };
      });

      const { PUT } = await import('@/app/api/profile/route');
      const request = {
        json: async () => updates,
      } as any;

      const response = await PUT(request);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.profile.name).toBe('Updated Name');
      expect(data.profile.experience_years).toBe(6);
    });

    test('should fail without profile ID', async () => {
      const { PUT } = await import('@/app/api/profile/route');
      const request = {
        json: async () => ({ name: 'Test' }),
      } as any;

      const response = await PUT(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('ID');
    });

    test('should fail if profile not found', async () => {
      mockStorage.getProfile = jest.fn().mockReturnValue(null);

      const { PUT } = await import('@/app/api/profile/route');
      const request = {
        json: async () => ({ id: 'non-existent', name: 'Test' }),
      } as any;

      const response = await PUT(request);
      
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toContain('not found');
    });
  });

  describe('DELETE /api/profile - Delete Profile', () => {
    test('should delete profile successfully', async () => {
      mockStorage.deleteProfile = jest.fn();

      const { DELETE } = await import('@/app/api/profile/route');
      const request = {
        url: 'http://localhost:3000/api/profile?id=test-id',
      } as any;

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(mockStorage.deleteProfile).toHaveBeenCalledWith('test-id');
    });

    test('should fail without profile ID', async () => {
      const { DELETE } = await import('@/app/api/profile/route');
      const request = {
        url: 'http://localhost:3000/api/profile',
      } as any;

      const response = await DELETE(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('ID');
    });
  });
});

