#!/usr/bin/env node
/**
 * AI Job Tracker CLI
 * Main entry point for the command-line interface
 */

import { Command } from 'commander';
import dotenv from 'dotenv';
import { AnalyzeCommand } from './commands/analyze';
import { ClaudeService } from '../services/claude';
import { StorageService } from '../services/storage';
import { createJob } from '../types/job';

// Load environment variables
dotenv.config();

const program = new Command();

// CLI metadata
program
  .name('ai-job-tracker')
  .description('AI-powered job search and matching for AI Engineers in Sweden')
  .version('1.0.0');

// Shared services (singleton pattern)
const claudeService = new ClaudeService();
const storageService = new StorageService();

/**
 * ANALYZE COMMAND
 * Analyzes match between your profile and a job posting
 */
program
  .command('analyze')
  .description('Analyze match between your profile and a job')
  .option('-u, --url <url>', 'Job posting URL')
  .option('-j, --job-id <id>', 'Existing job ID from database')
  .option('--no-save', 'Do not save results to database')
  .option('-v, --verbose', 'Show detailed analysis')
  .option('-t, --title <title>', 'Job title (required with --url)')
  .option('-c, --company <company>', 'Company name (required with --url)')
  .option('-l, --location <location>', 'Job location (default: "Sweden")')
  .option('-r, --remote <type>', 'Remote type: office, hybrid, remote (default: "hybrid")')
  .option('-d, --description <desc>', 'Job description')
  .option('--requirements <reqs>', 'Comma-separated requirements')
  .option('--source <source>', 'Job source (default: "manual")')
  .action(async (options) => {
    try {
      const analyzeCmd = new AnalyzeCommand(claudeService, storageService);

      // Scenario 1: Analyze existing job by ID
      if (options.jobId) {
        console.log(`\n🔍 Analyzing job: ${options.jobId}\n`);
        
        await analyzeCmd.execute({
          jobId: options.jobId,
          save: options.save,
          verbose: options.verbose,
        });
        return;
      }

      // Scenario 2: Analyze new job from URL
      if (options.url) {
        // Validate required fields for new job
        if (!options.title || !options.company) {
          console.error('❌ Error: --title and --company are required when using --url');
          process.exit(1);
        }

        console.log(`\n🔍 Analyzing new job from URL: ${options.url}\n`);

        // Create job object
        const job = createJob({
          title: options.title,
          company: options.company,
          location: options.location || 'Sweden',
          remote_type: (options.remote as 'office' | 'hybrid' | 'remote') || 'hybrid',
          description: options.description || `${options.title} at ${options.company}`,
          requirements: options.requirements 
            ? options.requirements.split(',').map((r: string) => r.trim())
            : ['Experience in relevant field'],
          url: options.url,
          source: options.source || 'manual',
          posted_date: new Date(),
        });

        await analyzeCmd.execute({
          url: options.url,
          job,
          save: options.save,
          verbose: options.verbose,
        });
        return;
      }

      // Error: Neither URL nor job-id provided
      console.error('❌ Error: Either --url or --job-id must be provided');
      console.log('\nExamples:');
      console.log('  npm run cli analyze --url https://example.com/job --title "AI Engineer" --company "TechCorp"');
      console.log('  npm run cli analyze --job-id abc-123 --verbose');
      process.exit(1);
    } catch (error) {
      console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * LIST COMMAND (placeholder for future implementation)
 */
program
  .command('list')
  .description('List saved jobs')
  .option('-s, --status <status>', 'Filter by status: saved, applied, interviewing, offer, rejected')
  .option('-m, --min-score <score>', 'Minimum match score (0-100)')
  .option('-c, --company <company>', 'Filter by company name')
  .action(() => {
    console.log('📋 List command - Coming soon!');
    console.log('This will show your saved jobs with match scores.');
  });

/**
 * RECOMMENDATIONS COMMAND (placeholder)
 */
program
  .command('recommendations')
  .description('Show top job recommendations')
  .option('-n, --limit <number>', 'Number of recommendations (default: 10)')
  .action(() => {
    console.log('⭐ Recommendations command - Coming soon!');
    console.log('This will show your best job matches.');
  });

/**
 * PROFILE COMMAND (placeholder)
 */
program
  .command('profile')
  .description('Manage your profile')
  .option('--show', 'Show current profile')
  .option('--create', 'Create new profile')
  .option('--update', 'Update existing profile')
  .action(() => {
    console.log('👤 Profile command - Coming soon!');
    console.log('This will help you manage your candidate profile.');
  });

// Parse CLI arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
