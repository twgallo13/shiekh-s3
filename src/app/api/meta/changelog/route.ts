import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * API Route: /api/meta/changelog
 * Dev-only endpoint to read CHANGELOG.md and extract latest version
 * Returns the top version from the changelog for version comparison
 */

export async function GET(request: NextRequest) {
  // Dev-only guard
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 404 }
    );
  }

  try {
    // Read CHANGELOG.md from src/content/
    const changelogPath = join(process.cwd(), 'src', 'content', 'CHANGELOG.md');
    const changelogContent = readFileSync(changelogPath, 'utf-8');

    // Extract top version using regex
    // Look for pattern: ## vX.Y.Z (at the beginning of the file)
    const versionMatch = changelogContent.match(/^##\s+v(\d+\.\d+\.\d+)/m);
    
    if (!versionMatch) {
      return NextResponse.json(
        { 
          error: 'Could not parse version from CHANGELOG.md',
          guidance: 'Ensure latest entry starts with "## vX.Y.Z"'
        },
        { 
          status: 400,
          headers: {
            'X-Dev-Only': 'true'
          }
        }
      );
    }

    const latestVersion = `v${versionMatch[1]}`;

    return NextResponse.json(
      { 
        latest: latestVersion,
        parsed: true,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          'X-Dev-Only': 'true',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );

  } catch (error) {
    console.error('Error reading CHANGELOG.md:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to read CHANGELOG.md',
        details: error instanceof Error ? error.message : 'Unknown error',
        guidance: 'Ensure CHANGELOG.md exists in src/content/'
      },
      { 
        status: 500,
        headers: {
          'X-Dev-Only': 'true'
        }
      }
    );
  }
}

// Only allow GET requests
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
