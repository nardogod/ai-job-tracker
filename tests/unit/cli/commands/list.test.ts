/**
 * List Command Unit Tests
 * FASE RED - TDD (Test-Driven Development)
 * 
 * Tests for the CLI list command
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
  
  // Create bold object with nested colors
  const boldWithColors = identity as any;
  boldWithColors.cyan = identity;
  boldWithColors.white = identity;
  boldWithColors.green = identity;
  boldWithColors.red = identity;
  boldWithColors.yellow = identity;
  boldWithColors.blue = identity;
  
  const chalkDefault: any = {
    bold: boldWithColors,
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

import { StorageService } from '../../../../src/services/storage';
import { createJob } from '../../../../src/types/job';
import { createMatchScore } from '../../../../src/types/match-score';

import { ListCommand } from '../../../../src/cli/commands/list';

// Mock services
jest.mock('../../../../src/services/storage');

describe('ListCommand', () => {
  let command: ListCommand;
  let mockStorageService: jest.Mocked<StorageService>;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  const mockJob1 = createJob({
    title: 'AI Engineer',
    company: 'TechCorp',
    location: 'Stockholm, Sweden',
    remote_type: 'hybrid',
    description: 'AI Engineer role',
    requirements: ['Python', 'Machine Learning'],
    url: 'https://example.com/job/1',
    source: 'manual',
    posted_date: new Date('2024-01-15'),
    status: 'saved',
  });

  const mockJob2 = createJob({
    title: 'ML Engineer',
    company: 'AI Startup',
    location: 'Gothenburg, Sweden',
    remote_type: 'remote',
    description: 'ML Engineer role',
    requirements: ['Python', 'TensorFlow'],
    url: 'https://example.com/job/2',
    source: 'manual',
    posted_date: new Date('2024-01-20'),
    status: 'applied',
  });

  const mockMatchScore1 = createMatchScore({
    job_id: mockJob1.id,
    overall_score: 85,
    skills_match: 90,
    experience_match: 80,
    location_match: 95,
    company_match: 75,
    requirements_match: 88,
    matching_skills: ['Python', 'Machine Learning'],
    missing_skills: ['AWS'],
    recommendation: 'strong_apply',
  });

  const mockMatchScore2 = createMatchScore({
    job_id: mockJob2.id,
    overall_score: 70,
    skills_match: 75,
    experience_match: 65,
    location_match: 80,
    company_match: 60,
    requirements_match: 70,
    matching_skills: ['Python'],
    missing_skills: ['TensorFlow', 'AWS'],
    recommendation: 'apply',
  });

  beforeEach(() => {
    // Create mock instance
    mockStorageService = new StorageService(':memory:') as jest.Mocked<StorageService>;

    // Mock console methods
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

    // Setup default mock behaviors
    mockStorageService.getJobs.mockReturnValue([mockJob1, mockJob2]);
    mockStorageService.getMatchScore.mockImplementation((jobId: string) => {
      if (jobId === mockJob1.id) return mockMatchScore1;
      if (jobId === mockJob2.id) return mockMatchScore2;
      return null;
    });

    // Create command instance
    command = new ListCommand(mockStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('Constructor', () => {
    it('should create instance with storage service', () => {
      const cmd = new ListCommand(mockStorageService);
      expect(cmd).toBeInstanceOf(ListCommand);
    });

    it('should create instance without storage service (creates default)', () => {
      const cmd = new ListCommand();
      expect(cmd).toBeInstanceOf(ListCommand);
    });
  });

  describe('execute', () => {
    it('should list all jobs without filters', async () => {
      await command.execute({});

      expect(mockStorageService.getJobs).toHaveBeenCalledWith({});
      expect(mockStorageService.getMatchScore).toHaveBeenCalledTimes(2);
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      mockStorageService.getJobs.mockReturnValue([mockJob2]);

      await command.execute({ status: 'applied' });

      expect(mockStorageService.getJobs).toHaveBeenCalledWith({ status: 'applied' });
    });

    it('should filter by company', async () => {
      mockStorageService.getJobs.mockReturnValue([mockJob1]);

      await command.execute({ company: 'TechCorp' });

      expect(mockStorageService.getJobs).toHaveBeenCalledWith({ company: 'TechCorp' });
    });

    it('should filter by min score', async () => {
      mockStorageService.getJobs.mockReturnValue([mockJob1]);

      await command.execute({ minScore: 80 });

      expect(mockStorageService.getJobs).toHaveBeenCalledWith({ minMatch: 80 });
    });

    it('should filter by location', async () => {
      mockStorageService.getJobs.mockReturnValue([mockJob1]);

      await command.execute({ location: 'Stockholm' });

      expect(mockStorageService.getJobs).toHaveBeenCalledWith({ location: 'Stockholm' });
    });

    it('should combine multiple filters', async () => {
      mockStorageService.getJobs.mockReturnValue([mockJob1]);

      await command.execute({
        status: 'saved',
        company: 'TechCorp',
        minScore: 80,
        location: 'Stockholm',
      });

      expect(mockStorageService.getJobs).toHaveBeenCalledWith({
        status: 'saved',
        company: 'TechCorp',
        minMatch: 80,
        location: 'Stockholm',
      });
    });

    it('should handle empty job list', async () => {
      mockStorageService.getJobs.mockReturnValue([]);

      await command.execute({});

      expect(mockStorageService.getJobs).toHaveBeenCalledWith({});
      expect(mockStorageService.getMatchScore).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should handle jobs without match scores', async () => {
      mockStorageService.getMatchScore.mockReturnValue(null);

      await command.execute({});

      expect(mockStorageService.getMatchScore).toHaveBeenCalledTimes(2);
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should sort by score when sortBy is score', async () => {
      await command.execute({ sortBy: 'score' });

      expect(mockStorageService.getJobs).toHaveBeenCalledWith({});
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should sort by date when sortBy is date', async () => {
      await command.execute({ sortBy: 'date' });

      expect(mockStorageService.getJobs).toHaveBeenCalledWith({});
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should limit output when limit is provided', async () => {
      await command.execute({ limit: 1 });

      expect(mockStorageService.getJobs).toHaveBeenCalledWith({});
      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });

  describe('formatOutput', () => {
    it('should format output with jobs and match scores', () => {
      const jobsWithScores = [
        { job: mockJob1, matchScore: mockMatchScore1 },
        { job: mockJob2, matchScore: mockMatchScore2 },
      ];

      command.formatOutput(jobsWithScores);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should handle empty list', () => {
      command.formatOutput([]);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should handle jobs without match scores', () => {
      const jobsWithScores = [
        { job: mockJob1, matchScore: null },
        { job: mockJob2, matchScore: null },
      ];

      command.formatOutput(jobsWithScores);

      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });
});


