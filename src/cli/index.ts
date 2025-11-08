#!/usr/bin/env node

/**
 * AI Job Tracker CLI
 * Entry point for the CLI application
 */

import { Command } from 'commander';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('ai-job-tracker')
  .description('CLI tool para buscar vagas AI Engineer na Suécia')
  .version('1.0.0');

program
  .command('search')
  .description('Busca vagas de AI Engineer')
  .option('-l, --location <location>', 'Localização para busca', 'Sweden')
  .option('-k, --keywords <keywords>', 'Palavras-chave separadas por vírgula')
  .action((options) => {
    console.log('Searching for jobs...', options);
    // TODO: Implement search functionality
  });

program
  .command('list')
  .description('Lista vagas salvas')
  .action(() => {
    console.log('Listing saved jobs...');
    // TODO: Implement list functionality
  });

program.parse();

