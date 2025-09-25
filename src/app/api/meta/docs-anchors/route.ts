/**
 * Docs Anchors API Route - Development Only
 * Extracts heading anchors from structure.md for documentation link validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Slugify a string to create a valid anchor
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

/**
 * Extract headings from markdown content
 */
function extractHeadings(content: string): string[] {
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const headings: string[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    
    // Only extract H1-H4 headings
    if (level >= 1 && level <= 4) {
      const anchor = slugify(text);
      headings.push(anchor);
    }
  }

  return headings;
}

/**
 * GET /api/meta/docs-anchors
 * Returns all valid documentation anchors from structure.md
 */
export async function GET(request: NextRequest) {
  // Development only
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 404 }
    );
  }

  try {
    // Read structure.md file
    const docsPath = join(process.cwd(), 'public', 'docs', 'structure.md');
    const content = readFileSync(docsPath, 'utf-8');

    // Extract headings and create anchors
    const anchors = extractHeadings(content);

    // Remove duplicates and sort
    const uniqueAnchors = [...new Set(anchors)].sort();

    return NextResponse.json(
      { 
        anchors: uniqueAnchors,
        count: uniqueAnchors.length,
        source: 'public/docs/structure.md',
        extracted: new Date().toISOString()
      },
      {
        headers: {
          'X-Dev-Only': 'true',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('Failed to extract docs anchors:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to read structure.md',
        details: error instanceof Error ? error.message : 'Unknown error'
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

/**
 * POST /api/meta/docs-anchors/validate
 * Validates a list of anchor links against structure.md
 */
export async function POST(request: NextRequest) {
  // Development only
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { links } = body;

    if (!Array.isArray(links)) {
      return NextResponse.json(
        { error: 'Links must be an array' },
        { status: 400 }
      );
    }

    // Read structure.md file
    const docsPath = join(process.cwd(), 'public', 'docs', 'structure.md');
    const content = readFileSync(docsPath, 'utf-8');

    // Extract valid anchors
    const validAnchors = extractHeadings(content);
    const validAnchorsSet = new Set(validAnchors);

    // Validate links
    const results = {
      valid: [] as string[],
      invalid: [] as string[],
      total: links.length
    };

    links.forEach(link => {
      if (typeof link === 'string' && link.startsWith('/docs#')) {
        const anchor = link.replace('/docs#', '');
        if (validAnchorsSet.has(anchor)) {
          results.valid.push(link);
        } else {
          results.invalid.push(link);
        }
      } else {
        results.invalid.push(link);
      }
    });

    return NextResponse.json(
      {
        ...results,
        validAnchors: validAnchors,
        source: 'public/docs/structure.md',
        validated: new Date().toISOString()
      },
      {
        headers: {
          'X-Dev-Only': 'true',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('Failed to validate docs anchors:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to validate anchors',
        details: error instanceof Error ? error.message : 'Unknown error'
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
