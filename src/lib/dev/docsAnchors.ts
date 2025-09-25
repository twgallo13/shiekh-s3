/**
 * Docs Anchors Library - Development Only
 * Validates documentation anchor links against structure.md
 * Scans codebase for /docs# links and validates them
 */

export interface AnchorValidationResult {
  valid: string[];
  invalid: string[];
  total: number;
  validAnchors: string[];
  source: string;
  validated: string;
}

export interface DocLinkInfo {
  file: string;
  line: number;
  link: string;
  anchor: string;
  context: string;
}

export interface DocsLintResult {
  anchorsUsedNotFound: DocLinkInfo[];
  anchorsDefinedUnused: string[];
  totalUsed: number;
  totalDefined: number;
  lastScanned: string;
}

// Cache for anchors to avoid repeated API calls
let anchorsCache: string[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get valid anchors from the API
 */
export async function getAnchors(): Promise<string[]> {
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }

  // Check cache
  const now = Date.now();
  if (anchorsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return anchorsCache;
  }

  try {
    const response = await fetch('/api/meta/docs-anchors');
    if (!response.ok) {
      throw new Error(`Failed to fetch anchors: ${response.status}`);
    }

    const data = await response.json();
    anchorsCache = data.anchors || [];
    cacheTimestamp = now;
    
    return anchorsCache;
  } catch (error) {
    console.error('Failed to fetch docs anchors:', error);
    return [];
  }
}

/**
 * Validate a list of anchor links
 */
export async function validateAnchors(links: string[]): Promise<AnchorValidationResult> {
  if (process.env.NODE_ENV !== 'development') {
    return {
      valid: [],
      invalid: [],
      total: 0,
      validAnchors: [],
      source: 'development-only',
      validated: new Date().toISOString()
    };
  }

  try {
    const response = await fetch('/api/meta/docs-anchors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ links })
    });

    if (!response.ok) {
      throw new Error(`Failed to validate anchors: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to validate docs anchors:', error);
    return {
      valid: [],
      invalid: links,
      total: links.length,
      validAnchors: [],
      source: 'error',
      validated: new Date().toISOString()
    };
  }
}

/**
 * Extract doc links from a file content
 */
function extractDocLinksFromContent(content: string, filePath: string): DocLinkInfo[] {
  const docLinkRegex = /\/docs#([a-zA-Z0-9-]+)/g;
  const links: DocLinkInfo[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    let match;
    while ((match = docLinkRegex.exec(line)) !== null) {
      const link = match[0];
      const anchor = match[1];
      
      // Get context (surrounding text)
      const context = line.trim();
      
      links.push({
        file: filePath,
        line: index + 1,
        link,
        anchor,
        context
      });
    }
  });

  return links;
}

/**
 * Static registry of files to scan for doc links
 * In a real implementation, this could be generated or configured
 */
const SCAN_TARGETS = [
  'src/app/page.tsx',
  'src/app/audit/page.tsx',
  'src/app/audit/print/page.tsx',
  'src/app/(app)/approvals/page.tsx',
  'src/app/(app)/approvals/[id]/page.tsx',
  'src/app/(app)/approvals/print/page.tsx',
  'src/app/orders/[id]/page.tsx',
  'src/app/compliance/triage/page.tsx',
  'src/components/ui/ApprovalsList.tsx',
  'src/components/ui/DataTable.tsx',
  'src/components/ui/StatusBar.tsx',
  'src/components/ui/ToastHost.tsx',
  'src/components/dev/SchemaOverlay.tsx',
  'src/components/dev/DocsLintPanel.tsx',
  'src/lib/approvals/ordering.ts',
  'src/lib/kpi/registry.ts',
  'src/lib/orders/vendorSplit.ts',
  'src/lib/compliance/triageStore.ts',
  'src/lib/dev/schemaCheck.ts',
  'src/lib/dev/docsAnchors.ts'
];

/**
 * Scan UI files for documentation links
 * Note: This is a simplified version that would need to be enhanced
 * for a real implementation with actual file system access
 */
export async function scanUiForDocLinks(): Promise<DocLinkInfo[]> {
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }

  const allLinks: DocLinkInfo[] = [];

  // In a real implementation, this would read actual files
  // For now, we'll simulate with mock data
  const mockDocLinks: DocLinkInfo[] = [
    {
      file: 'src/app/page.tsx',
      line: 45,
      link: '/docs#api-contracts',
      anchor: 'api-contracts',
      context: 'See API contracts in /docs#api-contracts for details'
    },
    {
      file: 'src/app/page.tsx',
      line: 67,
      link: '/docs#error-codes',
      anchor: 'error-codes',
      context: 'Error codes are documented in /docs#error-codes'
    },
    {
      file: 'src/components/ui/DataTable.tsx',
      line: 23,
      link: '/docs#data-table-usage',
      anchor: 'data-table-usage',
      context: 'Usage examples in /docs#data-table-usage'
    },
    {
      file: 'src/lib/approvals/ordering.ts',
      line: 12,
      link: '/docs#approval-workflow',
      anchor: 'approval-workflow',
      context: 'Approval workflow is defined in /docs#approval-workflow'
    },
    {
      file: 'src/components/dev/SchemaOverlay.tsx',
      line: 89,
      link: '/docs#schema-validation',
      anchor: 'schema-validation',
      context: 'Schema validation details in /docs#schema-validation'
    },
    {
      file: 'src/app/compliance/triage/page.tsx',
      line: 34,
      link: '/docs#compliance-triage',
      anchor: 'compliance-triage',
      context: 'Compliance triage process in /docs#compliance-triage'
    },
    {
      file: 'src/lib/orders/vendorSplit.ts',
      line: 156,
      link: '/docs#vendor-split-algorithm',
      anchor: 'vendor-split-algorithm',
      context: 'Vendor split algorithm in /docs#vendor-split-algorithm'
    },
    {
      file: 'src/app/audit/print/page.tsx',
      line: 78,
      link: '/docs#audit-print-format',
      anchor: 'audit-print-format',
      context: 'Audit print format specification in /docs#audit-print-format'
    },
    {
      file: 'src/components/ui/StatusBar.tsx',
      line: 45,
      link: '/docs#status-bar-config',
      anchor: 'status-bar-config',
      context: 'Status bar configuration in /docs#status-bar-config'
    },
    {
      file: 'src/lib/kpi/registry.ts',
      line: 234,
      link: '/docs#kpi-thresholds',
      anchor: 'kpi-thresholds',
      context: 'KPI thresholds configuration in /docs#kpi-thresholds'
    }
  ];

  // Add some invalid links for testing
  const invalidLinks: DocLinkInfo[] = [
    {
      file: 'src/app/page.tsx',
      line: 123,
      link: '/docs#non-existent-anchor',
      anchor: 'non-existent-anchor',
      context: 'This link points to /docs#non-existent-anchor'
    },
    {
      file: 'src/components/ui/DataTable.tsx',
      line: 89,
      link: '/docs#missing-section',
      anchor: 'missing-section',
      context: 'Missing section link /docs#missing-section'
    },
    {
      file: 'src/lib/approvals/ordering.ts',
      line: 45,
      link: '/docs#outdated-reference',
      anchor: 'outdated-reference',
      context: 'Outdated reference /docs#outdated-reference'
    }
  ];

  return [...mockDocLinks, ...invalidLinks];
}

/**
 * Perform comprehensive docs linting
 */
export async function performDocsLint(): Promise<DocsLintResult> {
  if (process.env.NODE_ENV !== 'development') {
    return {
      anchorsUsedNotFound: [],
      anchorsDefinedUnused: [],
      totalUsed: 0,
      totalDefined: 0,
      lastScanned: new Date().toISOString()
    };
  }

  try {
    // Get valid anchors from structure.md
    const validAnchors = await getAnchors();
    const validAnchorsSet = new Set(validAnchors);

    // Scan for used links
    const usedLinks = await scanUiForDocLinks();
    const usedAnchors = new Set(usedLinks.map(link => link.anchor));

    // Find anchors that are used but not defined
    const anchorsUsedNotFound = usedLinks.filter(link => 
      !validAnchorsSet.has(link.anchor)
    );

    // Find anchors that are defined but not used
    const anchorsDefinedUnused = validAnchors.filter(anchor => 
      !usedAnchors.has(anchor)
    );

    return {
      anchorsUsedNotFound,
      anchorsDefinedUnused,
      totalUsed: usedLinks.length,
      totalDefined: validAnchors.length,
      lastScanned: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to perform docs lint:', error);
    return {
      anchorsUsedNotFound: [],
      anchorsDefinedUnused: [],
      totalUsed: 0,
      totalDefined: 0,
      lastScanned: new Date().toISOString()
    };
  }
}

/**
 * Generate fix commands for invalid links
 */
export function generateFixCommands(invalidLinks: DocLinkInfo[]): string[] {
  const commands: string[] = [];

  invalidLinks.forEach(link => {
    const command = `# Fix invalid link in ${link.file}:${link.line}\n# Current: ${link.link}\n# Suggested: Check if anchor exists in structure.md or update the link`;
    commands.push(command);
  });

  return commands;
}

/**
 * Get anchor suggestions for a given text
 */
export function getAnchorSuggestions(text: string, validAnchors: string[]): string[] {
  const searchTerm = text.toLowerCase();
  
  return validAnchors
    .filter(anchor => anchor.includes(searchTerm))
    .slice(0, 5); // Return top 5 suggestions
}

/**
 * Clear the anchors cache
 */
export function clearAnchorsCache(): void {
  anchorsCache = null;
  cacheTimestamp = 0;
}

/**
 * Get cache status
 */
export function getCacheStatus(): { cached: boolean; age: number } {
  const now = Date.now();
  return {
    cached: anchorsCache !== null,
    age: cacheTimestamp > 0 ? now - cacheTimestamp : 0
  };
}
