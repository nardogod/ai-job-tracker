#!/usr/bin/env ts-node
/**
 * Helper script to create a user profile
 * Run: npx ts-node scripts/create-profile.ts
 */

import { StorageService } from '../src/services/storage';
import { createProfile } from '../src/types/profile';

const storage = new StorageService();

// Create a sample profile
const profile = createProfile({
  name: 'Your Name',
  email: 'your.email@example.com',
  experience_years: 5,
  skills: [
    'Python',
    'TypeScript',
    'Machine Learning',
    'LLMs',
    'NLP',
    'TensorFlow',
    'PyTorch',
    'AWS',
    'Docker',
    'Git',
  ],
  location_preference: 'Stockholm, Sweden',
  visa_status: 'needs_sponsorship', // Change to 'has_permit' or 'eu_citizen' if applicable
  languages: {
    English: 'fluent',
    Swedish: 'intermediate',
    Portuguese: 'native', // Add/remove languages as needed
  },
  company_size_preference: 'scaleup', // Options: 'startup', 'scaleup', 'corporate', 'any'
  remote_preference: 'hybrid', // Options: 'office', 'hybrid', 'remote', 'flexible'
  min_salary: 60000, // Annual salary in SEK (optional)
});

try {
  storage.saveProfile(profile);
  console.log('✅ Profile created successfully!');
  console.log('\nProfile details:');
  console.log(`  Name: ${profile.name}`);
  console.log(`  Email: ${profile.email}`);
  console.log(`  Experience: ${profile.experience_years} years`);
  console.log(`  Skills: ${profile.skills.join(', ')}`);
  console.log(`  Location: ${profile.location_preference}`);
  console.log(`  Visa Status: ${profile.visa_status}`);
  console.log(`  Company Size: ${profile.company_size_preference}`);
  console.log(`  Remote: ${profile.remote_preference}`);
  console.log(`\nProfile ID: ${profile.id}`);
  console.log('\nYou can now use the CLI commands!');
  console.log('Try: npm run cli analyze -- --help');
} catch (error) {
  console.error('❌ Error creating profile:', error);
  process.exit(1);
} finally {
  storage.close();
}

