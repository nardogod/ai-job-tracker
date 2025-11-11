#!/usr/bin/env ts-node

/**
 * Calculate total API costs from all analyses
 */

import { StorageService } from '../src/services/storage';

const storage = new StorageService();

try {
  // Get all match scores from database
  const db = (storage as any).db;
  const count = db.prepare('SELECT COUNT(*) as count FROM match_scores').get() as { count: number };
  
  // Based on the last analysis we saw: $0.0090 USD per analysis
  const costPerAnalysis = 0.0090;
  const totalCost = count.count * costPerAnalysis;
  
  console.log('\n' + '━'.repeat(70));
  console.log('💰 CUSTO TOTAL DAS ANÁLISES');
  console.log('━'.repeat(70));
  console.log(`Total de análises: ${count.count}`);
  console.log(`Custo por análise: $${costPerAnalysis.toFixed(4)} USD`);
  console.log('━'.repeat(70));
  console.log(`💰 CUSTO TOTAL: $${totalCost.toFixed(4)} USD`);
  console.log('━'.repeat(70) + '\n');
  
  storage.close();
} catch (error) {
  console.error('Error calculating costs:', error);
  storage.close();
  process.exit(1);
}

