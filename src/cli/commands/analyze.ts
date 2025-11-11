/**
 * AnalyzeCommand - CLI command for analyzing job matches
 * UX IMPROVEMENTS - Enhanced output with colors, tables, and progress indicators
 * 
 * Analyzes match between current profile and a job posting using ClaudeService
 */

import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { ClaudeService } from '../../services/claude';
import { StorageService } from '../../services/storage';
import type { Job } from '../../types/job';
import type { MatchScore } from '../../types/match-score';

/**
 * Options for execute method
 */
export interface AnalyzeOptions {
  /** Job URL (for new jobs) */
  url?: string;
  /** Job ID (for existing jobs) */
  jobId?: string;
  /** Job object (when analyzing from URL) */
  job?: Job;
  /** Whether to save to database (default: true) */
  save?: boolean;
  /** Whether to show detailed analysis (default: false) */
  verbose?: boolean;
}

/**
 * CLI command for analyzing job matches
 * 
 * @example
 * ```ts
 * const command = new AnalyzeCommand();
 * await command.execute({ url: 'https://example.com/job', job: myJob });
 * ```
 */
export class AnalyzeCommand {
  private claudeService: ClaudeService;
  private storageService: StorageService;

  /**
   * Creates a new AnalyzeCommand instance
   * 
   * @param claudeService - ClaudeService instance (optional, creates default if not provided)
   * @param storageService - StorageService instance (optional, creates default if not provided)
   */
  constructor(claudeService?: ClaudeService, storageService?: StorageService) {
    this.claudeService = claudeService || new ClaudeService();
    this.storageService = storageService || new StorageService();
  }

  /**
   * Executes the analyze command
   * 
   * @param options - Command options
   * @throws {Error} If neither url nor jobId provided, or if job/profile not found
   */
  async execute(options: AnalyzeOptions): Promise<void> {
    const { url, jobId, job, save = true, verbose = false } = options;

    // Validate inputs
    if (!url && !jobId) {
      throw new Error('Either url or jobId must be provided');
    }

    // Get current profile
    const profile = this.storageService.getCurrentProfile();

    let jobToAnalyze: Job;

    // Handle URL case
    if (url) {
      if (!job) {
        throw new Error('Job object is required when using URL');
      }

      // Check if job already exists
      const existingJob = this.storageService.getJobByUrl(url);
      if (existingJob) {
        console.log(chalk.yellow(`⚠️  Job already exists in database: ${existingJob.title} at ${existingJob.company}`));
        jobToAnalyze = existingJob;
      } else {
        jobToAnalyze = job;
      }
    } else if (jobId) {
      // Handle Job ID case
      const existingJob = this.storageService.getJobById(jobId);
      if (!existingJob) {
        throw new Error('Job not found');
      }
      jobToAnalyze = existingJob;
    } else {
      throw new Error('Either url or jobId must be provided');
    }

    // Analyze match with progress indicator
    // Note: ora spinner temporarily disabled in tests - will be re-enabled after UX validation
    const spinner = process.env.NODE_ENV === 'test' ? null : ora('🔍 Analyzing match with Claude AI...').start();
    let matchScore: MatchScore;
    try {
      matchScore = await this.claudeService.analyzeMatch(profile, jobToAnalyze);
      if (spinner) {
        spinner.succeed(chalk.green('Analysis completed!'));
      }
      
      // Display results
      this.formatOutput(jobToAnalyze, matchScore, verbose);
      
      // Display API cost if available
      const apiUsage = (matchScore as any).apiUsage;
      if (apiUsage) {
        console.log(chalk.gray('\n💰 API Cost:') + ` $${apiUsage.cost_usd.toFixed(4)} USD`);
        console.log(chalk.gray(`   Input tokens: ${apiUsage.input_tokens.toLocaleString('en-US')}`));
        console.log(chalk.gray(`   Output tokens: ${apiUsage.output_tokens.toLocaleString('en-US')}`));
      }
    } catch (error) {
      if (spinner) {
        spinner.fail(chalk.red('Analysis failed!'));
      }
      throw error;
    }

    // Save to database if requested
    if (save) {
      const saveSpinner = process.env.NODE_ENV === 'test' ? null : ora('💾 Saving to database...').start();
      try {
        // Save job if it's new (from URL)
        if (url && !this.storageService.getJobByUrl(url)) {
          this.storageService.saveJob(jobToAnalyze);
        }
        // Always save/update match score
        this.storageService.saveMatchScore(matchScore);
        if (saveSpinner) {
          saveSpinner.succeed(chalk.green('Saved to database!'));
        }
      } catch (error) {
        if (saveSpinner) {
          saveSpinner.fail(chalk.red('Failed to save!'));
        }
        throw error;
      }
    }
  }

  /**
   * Formats and displays output with colors and tables
   * 
   * @param job - Job being analyzed
   * @param matchScore - Match score result
   * @param verbose - Whether to show detailed analysis
   */
  formatOutput(job: Job, matchScore: MatchScore, verbose: boolean): void {
    console.log('\n' + chalk.bold.cyan('═'.repeat(70)));
    console.log(chalk.bold.white('📋 JOB ANALYSIS RESULTS'));
    console.log(chalk.bold.cyan('═'.repeat(70)) + '\n');

    // Job Info
    const jobTable = new Table({
      head: [chalk.bold('Field'), chalk.bold('Value')],
      style: { head: [], border: [] },
    });
    jobTable.push(
      ['Title', chalk.bold(job.title)],
      ['Company', chalk.cyan(job.company)],
      ['Location', job.location],
      ['Remote Type', this.formatRemoteType(job.remote_type)],
    );
    console.log(jobTable.toString() + '\n');

    // Overall Score with color
    const scoreColor = this.getScoreColor(matchScore.overall_score);
    const recommendationEmoji = this.getRecommendationEmoji(matchScore.recommendation);
    
    console.log(chalk.bold('Overall Match Score:') + ' ' + 
                scoreColor(`${matchScore.overall_score}%`) + ' ' + 
                recommendationEmoji);
    console.log(chalk.bold('Recommendation:') + ' ' + 
                this.formatRecommendation(matchScore.recommendation) + '\n');

    // Score Breakdown Table
    const scoreTable = new Table({
      head: [chalk.bold('Metric'), chalk.bold('Score')],
      style: { head: [], border: [] },
    });
    
    scoreTable.push(
      ['Skills Match', this.formatScore(matchScore.skills_match)],
      ['Experience Match', this.formatScore(matchScore.experience_match)],
      ['Location Match', this.formatScore(matchScore.location_match)],
      ['Company Match', this.formatScore(matchScore.company_match)],
      ['Requirements Match', this.formatScore(matchScore.requirements_match)],
    );
    console.log(chalk.bold('Score Breakdown:'));
    console.log(scoreTable.toString() + '\n');

    // Skills
    if (matchScore.matching_skills.length > 0) {
      console.log(chalk.bold.green('✅ Matching Skills:'));
      matchScore.matching_skills.forEach((skill) => {
        console.log(chalk.green(`   ✓ ${skill}`));
      });
      console.log('');
    }

    if (matchScore.missing_skills.length > 0) {
      console.log(chalk.bold.red('❌ Missing Skills:'));
      matchScore.missing_skills.forEach((skill) => {
        console.log(chalk.red(`   ✗ ${skill}`));
      });
      console.log('');
    }

    // Detailed analysis (verbose mode)
    if (verbose && matchScore.details) {
      console.log(chalk.bold('📝 Detailed Analysis:'));
      console.log(chalk.gray(matchScore.details));
      console.log('');
    }

    console.log(chalk.bold.cyan('═'.repeat(70)) + '\n');
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
        return chalk.green.bold('🎯 Strong Apply - Excellent match!');
      case 'apply':
        return chalk.yellow.bold('✅ Apply - Good match');
      case 'maybe':
        return chalk.blue.bold('🤔 Maybe - Consider if interested');
      case 'skip':
        return chalk.red.bold('⏭️  Skip - Poor match');
      default:
        return recommendation;
    }
  }

  /**
   * Gets emoji for recommendation
   * @private
   */
  private getRecommendationEmoji(recommendation: string): string {
    switch (recommendation) {
      case 'strong_apply':
        return '⭐';
      case 'apply':
        return '✅';
      case 'maybe':
        return '🤔';
      case 'skip':
        return '⏭️';
      default:
        return '';
    }
  }

  /**
   * Formats remote type with emoji
   * @private
   */
  private formatRemoteType(remoteType: string): string {
    switch (remoteType) {
      case 'remote':
        return '🏠 Remote';
      case 'hybrid':
        return '🔄 Hybrid';
      case 'office':
        return '🏢 Office';
      default:
        return remoteType;
    }
  }
}
