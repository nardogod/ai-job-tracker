/**
 * Profile API Route
 * 
 * Handles CRUD operations for user profiles
 * 
 * Endpoints:
 * - POST /api/profile - Create a new profile
 * - GET /api/profile - Get current profile (first profile in database)
 * - PUT /api/profile - Update existing profile
 * - DELETE /api/profile?id={id} - Delete profile by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/services/storage';
import { createProfile } from '@/lib/types/profile';

// Initialize storage service
// In production, use a shared instance or connection pool
const getStorage = () => {
  const dbPath = process.env.DATABASE_PATH || './data/jobs.db';
  return new StorageService(dbPath);
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
      return NextResponse.json(
        { error: 'Missing or invalid required field: email' },
        { status: 400 }
      );
    }

    if (body.experience_years === undefined || body.experience_years === null || typeof body.experience_years !== 'number') {
      return NextResponse.json(
        { error: 'Missing required field: experience_years' },
        { status: 400 }
      );
    }

    if (!body.skills || !Array.isArray(body.skills) || body.skills.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: skills (must be non-empty array)' },
        { status: 400 }
      );
    }

    if (!body.location_preference || typeof body.location_preference !== 'string' || body.location_preference.trim() === '') {
      return NextResponse.json(
        { error: 'Missing required field: location_preference' },
        { status: 400 }
      );
    }

    // Create profile with validation
    const profile = createProfile({
      name: body.name,
      email: body.email,
      experience_years: body.experience_years,
      skills: body.skills,
      location_preference: body.location_preference,
      visa_status: body.visa_status || 'has_permit',
      languages: body.languages || { English: 'fluent' },
      company_size_preference: body.company_size_preference || 'any',
      remote_preference: body.remote_preference || 'flexible',
      min_salary: body.min_salary,
    });
    
    // Save to storage
    const storage = getStorage();
    storage.saveProfile(profile);
    
    console.log('[Profile API] Created profile:', profile.id);
    return NextResponse.json({ 
      success: true, 
      profile 
    });
  } catch (error) {
    console.error('[Profile API] Creation error:', error);
    
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as any;
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: zodError.issues.map((issue: any) => issue.message).join(', ')
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get latest profile (assuming single user for now)
    const storage = getStorage();
    const profiles = storage.getAllProfiles();
    const profile = profiles.length > 0 ? profiles[0] : null;
    
    console.log('[Profile API] Retrieved profile:', profile?.id || 'none');
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[Profile API] Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Profile ID required' },
        { status: 400 }
      );
    }

    const storage = getStorage();
    const existingProfile = storage.getProfile(id);
    
    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Merge updates with existing profile
    const updatedProfile = createProfile({ 
      ...existingProfile, 
      ...updates,
      id: existingProfile.id, // Ensure ID doesn't change
      created_at: existingProfile.created_at // Preserve creation date
    });

    storage.updateProfile(id, updatedProfile);
    
    console.log('[Profile API] Updated profile:', id);
    return NextResponse.json({ 
      success: true, 
      profile: updatedProfile 
    });
  } catch (error) {
    console.error('[Profile API] Update error:', error);
    
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as any;
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: zodError.issues.map((issue: any) => issue.message).join(', ')
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Profile ID required' },
        { status: 400 }
      );
    }

    const storage = getStorage();
    storage.deleteProfile(id);
    
    console.log('[Profile API] Deleted profile:', id);
    return NextResponse.json({ 
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('[Profile API] Delete error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

