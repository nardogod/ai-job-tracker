/**
 * Analyze Command Unit Tests
 * FASE RED - TDD (Test-Driven Development)
 * 
 * Tests for the CLI analyze command
 */

// Mock UX libraries BEFORE imports
jest.mock('chalk', () => {
  const identity = (text: string | number) => String(text);
  
  // Create a function that can be called and also has properties
  const createChalkColor = () => {
    const fn = identity as any;
    fn.bold = identity;
    return fn;
  };
  
  // Create bold object with nested colors (chalk.bold.cyan, chalk.bold.white, etc.)
  const boldWithColors: any = identity;
  boldWithColors.cyan = identity;
  boldWithColors.white = identity;
  boldWithColors.green = identity;
  boldWithColors.red = identity;
  boldWithColors.yellow = identity;
  boldWithColors.blue = identity;
  
  // Also support chalk.bold as a function
  const boldFn: any = identity;
  boldFn.cyan = identity;
  boldFn.white = identity;
  boldFn.green = identity;
  boldFn.red = identity;
  boldFn.yellow = identity;
  boldFn.blue = identity;
  
  const chalkDefault: any = {
    bold: boldFn,
    green: createChalkColor(),
    yellow: createChalkColor(),
    red: createChalkColor(),
    blue: createChalkColor(),
    cyan: createChalkColor(),
    white: createChalkColor(),
    gray: identity,
  };
  
  return {
    default: chalkDefault,
  };
});

jest.mock('cli-table3', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      push: jest.fn(),
      toString: jest.fn(() => 'Mocked Table'),
    })),
  };
});

jest.mock('ora', () => {
  const mockInstance = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
  };
  
  // Create a function that returns the mock instance
  const mockOra = jest.fn((_text?: string) => mockInstance);
  
  return { default: mockOra };
}, { virtual: true });

import { ClaudeService } from '../../../../src/services/claude';
import { StorageService } from '../../../../src/services/storage';
import { createProfile } from '../../../../src/types/profile';
import { createJob } from '../../../../src/types/job';
import { createMatchScore } from '../../../../src/types/match-score';

import { AnalyzeCommand } from '../../../../src/cli/commands/analyze';

// Mock services
jest.mock('../../../../src/services/claude');
jest.mock('../../../../src/services/storage');

describe('AnalyzeCommand', () => {
  let command: AnalyzeCommand;
  let mockClaudeService: jest.Mocked<ClaudeService>;
  let mockStorageService: jest.Mocked<StorageService>;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  const mockProfile = createProfile({
    name: 'John Doe',
    email: 'john@example.com',
    experience_years: 5,
    skills: ['Python', 'TypeScript', 'Machine Learning'],
    location_preference: 'Stockholm, Sweden',
    visa_status: 'needs_sponsorship',
    languages: { English: 'fluent', Swedish: 'intermediate' },
  });

  const mockJob = createJob({
    title: 'AI Engineer',
    company: 'TechCorp',
    location: 'Stockholm',
    remote_type: 'hybrid',
    description: 'AI Engineer role',
    requirements: ['Python', 'Machine Learning'],
    url: 'https://example.com/job/123',
    source: 'manual',
    posted_date: new Date(),
  });

  const mockMatchScore = createMatchScore({
    job_id: mockJob.id,
    overall_score: 85,
    skills_match: 90,
    experience_match: 80,
    location_match: 95,
    company_match: 75,
    requirements_match: 88,
    matching_skills: ['Python', 'Machine Learning'],
    missing_skills: ['AWS'],
    recommendation: 'strong_apply',
    details: 'Great match! Strong technical skills alignment.',
  });

  beforeEach(() => {
    // Create mock instances
    mockClaudeService = new ClaudeService('test-key') as jest.Mocked<ClaudeService>;
    mockStorageService = new StorageService(':memory:') as jest.Mocked<StorageService>;

    // Mock console methods
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

    // Setup default mock behaviors
    mockStorageService.getCurrentProfile.mockReturnValue(mockProfile);
    mockStorageService.getJobByUrl.mockReturnValue(null);
    mockStorageService.getJobById.mockReturnValue(mockJob);
    mockStorageService.saveJob.mockImplementation();
    mockStorageService.saveMatchScore.mockImplementation();
    mockClaudeService.analyzeMatch.mockResolvedValue(mockMatchScore);

    // Create command instance
    command = new AnalyzeCommand(mockClaudeService, mockStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('Constructor', () => {
    it('should create instance with services', () => {
      expect(command).toBeInstanceOf(AnalyzeCommand);
    });

    it('should accept optional services', () => {
      const cmd = new AnalyzeCommand();
      expect(cmd).toBeInstanceOf(AnalyzeCommand);
    });
  });

  describe('execute - with URL', () => {
    it('should analyze job from URL and save to database', async () => {
      const url = 'https://example.com/job/123';
      
      await command.execute({ url, job: mockJob });

      expect(mockStorageService.getCurrentProfile).toHaveBeenCalled();
      expect(mockClaudeService.analyzeMatch).toHaveBeenCalledWith(mockProfile, mockJob);
      expect(mockStorageService.saveJob).toHaveBeenCalledWith(mockJob);
      expect(mockStorageService.saveMatchScore).toHaveBeenCalledWith(mockMatchScore);
    });

    it('should display match score results', async () => {
      const url = 'https://example.com/job/123';
      
      await command.execute({ url, job: mockJob });

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('85'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('strong_apply'));
    });

    it('should not save if --no-save flag is true', async () => {
      const url = 'https://example.com/job/123';
      
      await command.execute({ url, job: mockJob, save: false });

      expect(mockStorageService.saveJob).not.toHaveBeenCalled();
      expect(mockStorageService.saveMatchScore).not.toHaveBeenCalled();
    });

    it('should skip if job already exists in database', async () => {
      const url = 'https://example.com/job/123';
      mockStorageService.getJobByUrl.mockReturnValue(mockJob);
      
      await command.execute({ url, job: mockJob });

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('already exists'));
      expect(mockStorageService.saveJob).not.toHaveBeenCalled();
    });

    it('should show detailed analysis in verbose mode', async () => {
      const url = 'https://example.com/job/123';
      
      await command.execute({ url, job: mockJob, verbose: true });

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Details:'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining(mockMatchScore.details!));
    });
  });

  describe('execute - with Job ID', () => {
    it('should analyze existing job by ID', async () => {
      const jobId = mockJob.id;
      
      await command.execute({ jobId });

      expect(mockStorageService.getJobById).toHaveBeenCalledWith(jobId);
      expect(mockClaudeService.analyzeMatch).toHaveBeenCalledWith(mockProfile, mockJob);
    });

    it('should throw error if job not found by ID', async () => {
      const jobId = 'non-existent-id';
      mockStorageService.getJobById.mockReturnValue(null);
      
      await expect(command.execute({ jobId })).rejects.toThrow('Job not found');
    });

    it('should update existing match score', async () => {
      const jobId = mockJob.id;
      
      await command.execute({ jobId });

      expect(mockStorageService.saveMatchScore).toHaveBeenCalledWith(mockMatchScore);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing profile error', async () => {
      mockStorageService.getCurrentProfile.mockImplementation(() => {
        throw new Error('No profile found');
      });

      await expect(command.execute({ url: 'test', job: mockJob })).rejects.toThrow('No profile found');
    });

    it('should handle Claude API errors', async () => {
      mockClaudeService.analyzeMatch.mockRejectedValue(new Error('API error'));

      await expect(command.execute({ url: 'test', job: mockJob })).rejects.toThrow('API error');
    });

    it('should handle database save errors', async () => {
      mockStorageService.saveJob.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(command.execute({ url: 'test', job: mockJob })).rejects.toThrow('Database error');
    });

    it('should throw error if neither URL nor jobId provided', async () => {
      await expect(command.execute({})).rejects.toThrow('Either url or jobId must be provided');
    });
  });

  describe('Output Formatting', () => {
    it('should display all score components', async () => {
      await command.execute({ url: 'test', job: mockJob });

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Skills Match'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Experience Match'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Location Match'));
    });

    it('should display matching and missing skills', async () => {
      await command.execute({ url: 'test', job: mockJob });

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Matching Skills'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Python'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Missing Skills'));
    });

    it('should use colors for recommendations', async () => {
      await command.execute({ url: 'test', job: mockJob });

      // Should output recommendation with formatting
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should format scores as percentages', async () => {
      await command.execute({ url: 'test', job: mockJob });

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('85%'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('90%'));
    });
  });

  describe('formatOutput', () => {
    it('should display formatted output with job and match info', () => {
      command.formatOutput(mockJob, mockMatchScore, false);

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining(mockJob.title));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining(mockJob.company));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('85'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('strong_apply'));
    });

    it('should include detailed analysis in verbose mode', () => {
      command.formatOutput(mockJob, mockMatchScore, true);

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Detailed Analysis'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining(mockMatchScore.details!));
    });

    it('should handle missing details gracefully', () => {
      const scoreWithoutDetails = { ...mockMatchScore, details: undefined };
      
      command.formatOutput(mockJob, scoreWithoutDetails, true);

      expect(mockConsoleLog).toHaveBeenCalled();
      // Should not throw error
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle full workflow: new job -> analyze -> save', async () => {
      const url = 'https://example.com/new-job';
      
      await command.execute({ url, job: mockJob });

      expect(mockStorageService.getCurrentProfile).toHaveBeenCalled();
      expect(mockStorageService.getJobByUrl).toHaveBeenCalledWith(url);
      expect(mockClaudeService.analyzeMatch).toHaveBeenCalled();
      expect(mockStorageService.saveJob).toHaveBeenCalled();
      expect(mockStorageService.saveMatchScore).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should handle re-analysis of existing job', async () => {
      const jobId = mockJob.id;
      
      await command.execute({ jobId });

      expect(mockStorageService.getJobById).toHaveBeenCalledWith(jobId);
      expect(mockClaudeService.analyzeMatch).toHaveBeenCalled();
      expect(mockStorageService.saveMatchScore).toHaveBeenCalled();
      expect(mockStorageService.saveJob).not.toHaveBeenCalled(); // Job already exists
    });
  });
});

