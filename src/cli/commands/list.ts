/**
 * ListCommand - CLI command for listing saved jobs
 * UX IMPROVEMENTS - Enhanced output with colors, tables, and formatting
 * 
 * Lists saved jobs with optional filters and displays match scores
 */

import chalk from 'chalk';
import Table from 'cli-table3';
import { StorageService, type JobFilters } from '../../services/storage';
import type { Job } from '../../types/job';
import type { MatchScore } from '../../types/match-score';
import type { JobStatus } from '../../types/job';

/**
 * Options for execute method
 */
export interface ListOptions {
  /** Filter by status */
  status?: JobStatus;
  /** Filter by company name */
  company?: string;
  /** Filter by location */
  location?: string;
  /** Minimum match score (0-100) */
  minScore?: number;
  /** Sort by: 'score' or 'date' (default: 'date') */
  sortBy?: 'score' | 'date';
  /** Limit number of results */
  limit?: number;
}

/**
 * Job with optional match score
 */
export interface JobWithMatchScore {
  job: Job;
  matchScore: MatchScore | null;
}

/**
 * CLI command for listing saved jobs
 * 
 * @example
 * ```ts
 * const command = new ListCommand();
 * await command.execute({ status: 'saved', minScore: 70 });
 * ```
 */
export class ListCommand {
  private storageService: StorageService;

  /**
   * Creates a new ListCommand instance
   * 
   * @param storageService - StorageService instance (optional, creates default if not provided)
   */
  constructor(storageService?: StorageService) {
    this.storageService = storageService || new StorageService();
  }

  /**
   * Executes the list command
   * 
   * @param options - Command options
   */
  async execute(options: ListOptions = {}): Promise<void> {
    const {
      status,
      company,
      location,
      minScore,
      sortBy = 'date',
      limit,
    } = options;

    // Build filters
    const filters: JobFilters = {};
    if (status) filters.status = status;
    if (company) filters.company = company;
    if (location) filters.location = location;
    if (minScore !== undefined) filters.minMatch = minScore;

    // Get jobs from database
    let jobs = this.storageService.getJobs(filters);

    // Get match scores for each job
    const jobsWithScores: JobWithMatchScore[] = jobs.map((job) => ({
      job,
      matchScore: this.storageService.getMatchScore(job.id),
    }));

    // Sort by score or date
    if (sortBy === 'score') {
      jobsWithScores.sort((a, b) => {
        const scoreA = a.matchScore?.overall_score ?? 0;
        const scoreB = b.matchScore?.overall_score ?? 0;
        return scoreB - scoreA; // Descending order
      });
    } else {
      // Sort by date (already sorted by created_at DESC from getJobs)
      // But we can also sort by posted_date if needed
      jobsWithScores.sort((a, b) => {
        return b.job.posted_date.getTime() - a.job.posted_date.getTime();
      });
    }

    // Apply limit
    const limitedJobs = limit ? jobsWithScores.slice(0, limit) : jobsWithScores;

    // Display results
    this.formatOutput(limitedJobs);
  }

  /**
   * Formats and displays output with colors and tables
   * 
   * @param jobsWithScores - Array of jobs with their match scores
   */
  formatOutput(jobsWithScores: JobWithMatchScore[]): void {
    console.log('\n' + chalk.bold.cyan('═'.repeat(70)));
    console.log(chalk.bold.white('📋 SAVED JOBS'));
    console.log(chalk.bold.cyan('═'.repeat(70)) + '\n');

    if (jobsWithScores.length === 0) {
      console.log(chalk.yellow('No jobs found matching the specified filters.'));
      console.log('');
      return;
    }

    // Create table with headers
    const table = new Table({
      head: [
        chalk.bold('Title'),
        chalk.bold('Company'),
        chalk.bold('Location'),
        chalk.bold('Status'),
        chalk.bold('Score'),
        chalk.bold('Recommendation'),
      ],
      style: { head: [], border: [] },
      colWidths: [25, 20, 20, 12, 8, 20],
    });

    // Add rows
    jobsWithScores.forEach(({ job, matchScore }) => {
      const score = matchScore?.overall_score ?? null;
      const recommendation = matchScore?.recommendation ?? null;
      
      const scoreText = score !== null 
        ? this.formatScore(score)
        : chalk.gray('N/A');
      
      const recommendationText = recommendation
        ? this.formatRecommendation(recommendation)
        : chalk.gray('N/A');

      const statusText = this.formatStatus(job.status);

      table.push([
        job.title,
        chalk.cyan(job.company),
        job.location,
        statusText,
        scoreText,
        recommendationText,
      ]);
    });

    console.log(table.toString());
    console.log(chalk.gray(`\nTotal: ${jobsWithScores.length} job(s)\n`));
    const separator = '═'.repeat(70);
    console.log(chalk.bold.cyan(separator) + '\n');
  }

  /**
   * Gets color for score based on value
   * @private
   */
  private getScoreColor(score: number): (text: string) => string {
    if (score >= 80) return chalk.green.bold;
    if (score >= 60) return chalk.yellow.bold;
    if (score >= 40) return chalk.blue.bold;
    return chalk.red.bold;
  }

  /**
   * Formats score with color
   * @private
   */
  private formatScore(score: number): string {
    const color = this.getScoreColor(score);
    return color(`${score}%`);
  }

  /**
   * Formats recommendation with color and emoji
   * @private
   */
  private formatRecommendation(recommendation: string): string {
    switch (recommendation) {
      case 'strong_apply':
        return chalk.green('🎯 Strong Apply');
      case 'apply':
        return chalk.yellow('✅ Apply');
      case 'maybe':
        return chalk.blue('🤔 Maybe');
      case 'skip':
        return chalk.red('⏭️  Skip');
      default:
        return recommendation;
    }
  }

  /**
   * Formats status with color and emoji
   * @private
   */
  private formatStatus(status: JobStatus): string {
    switch (status) {
      case 'saved':
        return chalk.blue('💾 Saved');
      case 'applied':
        return chalk.yellow('📝 Applied');
      case 'interviewing':
        return chalk.cyan('💼 Interviewing');
      case 'offer':
        return chalk.green('🎉 Offer');
      case 'rejected':
        return chalk.red('❌ Rejected');
      default:
        return status;
    }
  }
}

