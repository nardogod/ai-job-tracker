/**
 * StorageService
 *
 * Manages SQLite database for Profiles, Jobs, and MatchScores.
 * Provides CRUD operations with proper serialization/deserialization
 * of complex types (arrays, objects, dates).
 */

import Database from "better-sqlite3";
import type { Profile } from "../types/profile";
import type { Job, JobStatus } from "../types/job";
import type { MatchScore } from "../types/match-score";

/**
 * Job filters interface
 */
export interface JobFilters {
  status?: JobStatus;
  company?: string;
  minMatch?: number;
  location?: string;
}

/**
 * StorageService class
 *
 * Manages SQLite database operations for the AI Job Tracker application.
 * Handles serialization/deserialization of complex types and provides
 * type-safe CRUD operations.
 */
export class StorageService {
  private db: Database.Database;

  /**
   * Creates a new StorageService instance
   *
   * @param dbPath - Path to SQLite database file (default: './data/jobs.db')
   *                 Use ':memory:' for in-memory database (useful for testing)
   */
  constructor(dbPath: string = "./data/jobs.db") {
    this.db = new Database(dbPath);
    this.db.pragma("foreign_keys = ON"); // Important for CASCADE deletes
    this.initializeTables();
  }

  /**
   * Initialize database tables
   *
   * Creates all required tables with proper constraints and indexes.
   */
  private initializeTables(): void {
    // Profiles table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        experience_years INTEGER NOT NULL,
        skills TEXT NOT NULL,
        location_preference TEXT NOT NULL,
        visa_status TEXT NOT NULL,
        languages TEXT NOT NULL,
        company_size_preference TEXT NOT NULL,
        remote_preference TEXT NOT NULL,
        min_salary INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Jobs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        remote_type TEXT NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT NOT NULL,
        nice_to_have TEXT NOT NULL,
        salary_min INTEGER,
        salary_max INTEGER,
        salary_currency TEXT,
        url TEXT UNIQUE NOT NULL,
        source TEXT NOT NULL,
        posted_date TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Match scores table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS match_scores (
        job_id TEXT PRIMARY KEY,
        overall_score INTEGER NOT NULL,
        skills_match INTEGER NOT NULL,
        experience_match INTEGER NOT NULL,
        location_match INTEGER NOT NULL,
        company_match INTEGER NOT NULL,
        requirements_match INTEGER NOT NULL,
        missing_skills TEXT NOT NULL,
        matching_skills TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        details TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
      CREATE INDEX IF NOT EXISTS idx_jobs_url ON jobs(url);
      CREATE INDEX IF NOT EXISTS idx_match_overall ON match_scores(overall_score DESC);
    `);
  }

  /**
   * Get list of all tables in the database
   *
   * @returns Array of table names
   */
  getTables(): string[] {
    const stmt = this.db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    const rows = stmt.all() as Array<{ name: string }>;
    return rows.map((row) => row.name);
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }

  // ==================== PROFILE OPERATIONS ====================

  /**
   * Save a profile to the database
   *
   * @param profile - Profile to save
   */
  saveProfile(profile: Profile): void {
    const serialized = this.serializeProfile(profile);
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO profiles (
        id, name, email, experience_years, skills, location_preference,
        visa_status, languages, company_size_preference, remote_preference,
        min_salary, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      serialized.id,
      serialized.name,
      serialized.email,
      serialized.experience_years,
      serialized.skills,
      serialized.location_preference,
      serialized.visa_status,
      serialized.languages,
      serialized.company_size_preference,
      serialized.remote_preference,
      serialized.min_salary ?? null,
      serialized.created_at,
      serialized.updated_at
    );
  }

  /**
   * Get a profile by ID
   *
   * @param id - Profile ID
   * @returns Profile or null if not found
   */
  getProfile(id: string): Profile | null {
    const stmt = this.db.prepare("SELECT * FROM profiles WHERE id = ?");
    const row = stmt.get(id) as any;

    if (!row) {
      return null;
    }

    return this.deserializeProfile(row);
  }

  /**
   * Get the current profile (first profile in database)
   *
   * @returns Current profile
   * @throws Error if no profile exists
   */
  getCurrentProfile(): Profile {
    const stmt = this.db.prepare("SELECT * FROM profiles LIMIT 1");
    const row = stmt.get() as any;

    if (!row) {
      throw new Error("No profile found in database");
    }

    return this.deserializeProfile(row);
  }

  /**
   * List all profiles
   *
   * @returns Array of all profiles
   */
  listProfiles(): Profile[] {
    const stmt = this.db.prepare("SELECT * FROM profiles");
    const rows = stmt.all() as any[];
    return rows.map((row) => this.deserializeProfile(row));
  }

  /**
   * Get all profiles (alias for listProfiles)
   *
   * @returns Array of all profiles
   */
  getAllProfiles(): Profile[] {
    return this.listProfiles();
  }

  /**
   * Update an existing profile
   *
   * @param id - Profile ID
   * @param profile - Updated profile data
   */
  updateProfile(id: string, profile: Profile): void {
    const existing = this.getProfile(id);
    if (!existing) {
      throw new Error(`Profile with ID ${id} not found`);
    }

    // Merge updates with existing profile, preserving ID and created_at
    const updated: Profile = {
      ...existing,
      ...profile,
      id: existing.id, // Ensure ID doesn't change
      created_at: existing.created_at, // Preserve creation date
      updated_at: new Date(), // Update timestamp
    };

    this.saveProfile(updated);
  }

  /**
   * Delete a profile by ID
   *
   * @param id - Profile ID
   */
  deleteProfile(id: string): void {
    const stmt = this.db.prepare("DELETE FROM profiles WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
      throw new Error(`Profile with ID ${id} not found`);
    }
  }

  // ==================== JOB OPERATIONS ====================

  /**
   * Save a job to the database
   *
   * @param job - Job to save
   * @throws Error if URL already exists (UNIQUE constraint)
   */
  saveJob(job: Job): void {
    const serialized = this.serializeJob(job);
    const stmt = this.db.prepare(`
      INSERT INTO jobs (
        id, title, company, location, remote_type, description,
        requirements, nice_to_have, salary_min, salary_max, salary_currency,
        url, source, posted_date, status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(
        serialized.id,
        serialized.title,
        serialized.company,
        serialized.location,
        serialized.remote_type,
        serialized.description,
        serialized.requirements,
        serialized.nice_to_have,
        serialized.salary_min ?? null,
        serialized.salary_max ?? null,
        serialized.salary_currency ?? null,
        serialized.url,
        serialized.source,
        serialized.posted_date,
        serialized.status,
        serialized.notes ?? null,
        serialized.created_at,
        serialized.updated_at
      );
    } catch (error: any) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        throw new Error(`Job with URL ${job.url} already exists`);
      }
      throw error;
    }
  }

  /**
   * Get a job by ID
   *
   * @param id - Job ID
   * @returns Job or null if not found
   */
  getJobById(id: string): Job | null {
    const stmt = this.db.prepare("SELECT * FROM jobs WHERE id = ?");
    const row = stmt.get(id) as any;

    if (!row) {
      return null;
    }

    return this.deserializeJob(row);
  }

  /**
   * Get a job by URL
   *
   * @param url - Job URL
   * @returns Job or null if not found
   */
  getJobByUrl(url: string): Job | null {
    const stmt = this.db.prepare("SELECT * FROM jobs WHERE url = ?");
    const row = stmt.get(url) as any;

    if (!row) {
      return null;
    }

    return this.deserializeJob(row);
  }

  /**
   * Get jobs with optional filters
   *
   * @param filters - Optional filters (status, company, location, minMatch)
   * @returns Array of filtered jobs
   */
  getJobs(filters: JobFilters = {}): Job[] {
    let query = `
      SELECT j.* 
      FROM jobs j
      LEFT JOIN match_scores m ON j.id = m.job_id
      WHERE 1=1
    `;

    const params: unknown[] = [];

    if (filters.status) {
      query += " AND j.status = ?";
      params.push(filters.status);
    }

    if (filters.company) {
      query += " AND j.company LIKE ?";
      params.push(`%${filters.company}%`);
    }

    if (filters.location) {
      query += " AND j.location LIKE ?";
      params.push(`%${filters.location}%`);
    }

    if (filters.minMatch !== undefined) {
      query += " AND m.overall_score >= ?";
      params.push(filters.minMatch);
    }

    query += " ORDER BY j.created_at DESC";

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];
    return rows.map((row) => this.deserializeJob(row));
  }

  /**
   * Update job status
   *
   * @param id - Job ID
   * @param status - New status
   * @throws Error if job not found
   */
  updateJobStatus(id: string, status: JobStatus): void {
    const stmt = this.db.prepare(
      "UPDATE jobs SET status = ?, updated_at = ? WHERE id = ?"
    );
    const result = stmt.run(status, new Date().toISOString(), id);

    if (result.changes === 0) {
      throw new Error(`Job with ID ${id} not found`);
    }
  }

  /**
   * Delete a job
   *
   * @param id - Job ID
   * Note: MatchScore will be automatically deleted due to CASCADE
   */
  deleteJob(id: string): void {
    const stmt = this.db.prepare("DELETE FROM jobs WHERE id = ?");
    stmt.run(id);
  }

  // ==================== MATCH SCORE OPERATIONS ====================

  /**
   * Save a match score to the database
   *
   * @param matchScore - Match score to save
   */
  saveMatchScore(matchScore: MatchScore): void {
    const serialized = this.serializeMatchScore(matchScore);
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO match_scores (
        job_id, overall_score, skills_match, experience_match,
        location_match, company_match, requirements_match,
        missing_skills, matching_skills, recommendation, details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      serialized.job_id,
      serialized.overall_score,
      serialized.skills_match,
      serialized.experience_match,
      serialized.location_match,
      serialized.company_match,
      serialized.requirements_match,
      serialized.missing_skills,
      serialized.matching_skills,
      serialized.recommendation,
      serialized.details ?? null,
      serialized.created_at
    );
  }

  /**
   * Get a match score by job ID
   *
   * @param jobId - Job ID
   * @returns Match score or null if not found
   */
  getMatchScore(jobId: string): MatchScore | null {
    const stmt = this.db.prepare("SELECT * FROM match_scores WHERE job_id = ?");
    const row = stmt.get(jobId) as any;

    if (!row) {
      return null;
    }

    return this.deserializeMatchScore(row);
  }

  /**
   * Get top matches ordered by overall score
   *
   * @param limit - Maximum number of matches to return
   * @returns Array of top matches
   */
  getTopMatches(limit: number): MatchScore[] {
    const stmt = this.db.prepare(`
      SELECT * FROM match_scores 
      ORDER BY overall_score DESC 
      LIMIT ?
    `);
    const rows = stmt.all(limit) as any[];
    return rows.map((row) => this.deserializeMatchScore(row));
  }

  // ==================== SERIALIZATION HELPERS ====================

  /**
   * Serialize profile for database storage
   */
  private serializeProfile(profile: Profile): any {
    return {
      ...profile,
      skills: JSON.stringify(profile.skills),
      languages: JSON.stringify(profile.languages),
      created_at: profile.created_at.toISOString(),
      updated_at: profile.updated_at.toISOString(),
    };
  }

  /**
   * Deserialize profile from database row
   */
  private deserializeProfile(row: any): Profile {
    return {
      ...row,
      skills: JSON.parse(row.skills),
      languages: JSON.parse(row.languages),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  /**
   * Serialize job for database storage
   */
  private serializeJob(job: Job): any {
    return {
      ...job,
      requirements: JSON.stringify(job.requirements),
      nice_to_have: JSON.stringify(job.nice_to_have),
      posted_date: job.posted_date.toISOString(),
      created_at: job.created_at.toISOString(),
      updated_at: job.updated_at.toISOString(),
    };
  }

  /**
   * Deserialize job from database row
   */
  private deserializeJob(row: any): Job {
    return {
      ...row,
      requirements: JSON.parse(row.requirements),
      nice_to_have: JSON.parse(row.nice_to_have),
      posted_date: new Date(row.posted_date),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  /**
   * Serialize match score for database storage
   */
  private serializeMatchScore(matchScore: MatchScore): any {
    return {
      ...matchScore,
      missing_skills: JSON.stringify(matchScore.missing_skills),
      matching_skills: JSON.stringify(matchScore.matching_skills),
      created_at: matchScore.created_at.toISOString(),
    };
  }

  /**
   * Deserialize match score from database row
   */
  private deserializeMatchScore(row: any): MatchScore {
    return {
      ...row,
      missing_skills: JSON.parse(row.missing_skills),
      matching_skills: JSON.parse(row.matching_skills),
      created_at: new Date(row.created_at),
    };
  }
}
