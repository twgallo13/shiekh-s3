import fs from 'fs';
import path from 'path';
import { logAudit } from './audit';

export interface StructureConfig {
  roles: string[];
  navigation: Array<{
    title: string;
    path: string;
    roles: string[];
  }>;
  pages?: Record<string, unknown>;
}

const DEFAULT_STRUCTURE: StructureConfig = {
  roles: ['ADMIN', 'FM', 'WHS', 'DM', 'SM', 'AM', 'COST_ANALYST', 'AI_AGENT'],
  navigation: [
    { title: 'Dashboard', path: '/', roles: ['ADMIN', 'FM', 'WHS', 'DM', 'SM', 'AM', 'COST_ANALYST', 'AI_AGENT'] },
    { title: 'Settings', path: '/settings', roles: ['ADMIN', 'FM', 'WHS', 'DM', 'SM', 'AM', 'COST_ANALYST', 'AI_AGENT'] },
    { title: 'Changelog', path: '/changelog', roles: ['ADMIN', 'FM', 'WHS', 'DM', 'SM', 'AM', 'COST_ANALYST', 'AI_AGENT'] },
  ],
};

let cachedStructure: StructureConfig | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 30 * 1000; // 30 seconds

export async function loadStructure(): Promise<StructureConfig> {
  // Check cache first
  if (cachedStructure && Date.now() < cacheExpiry) {
    return cachedStructure;
  }

  try {
    const structurePath = path.join(process.cwd(), 'structure.md');
    
    if (!fs.existsSync(structurePath)) {
      await logAudit({
        actor: 'SYSTEM',
        action: 'STRUCTURE_LOAD',
        payload: { reason: 'STRUCTURE_MD_MISSING' },
      });
      
      cachedStructure = DEFAULT_STRUCTURE;
      cacheExpiry = Date.now() + CACHE_DURATION;
      return cachedStructure;
    }

    const content = fs.readFileSync(structurePath, 'utf-8');
    
    // Parse YAML frontmatter if present
    const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (yamlMatch) {
      const yamlContent = yamlMatch[1];
      // Simple YAML parsing for roles and navigation
      // This is a basic implementation - in production, use a proper YAML parser
      const rolesMatch = yamlContent.match(/roles:\s*\[(.*?)\]/);
      const navigationMatch = yamlContent.match(/navigation:\s*\[(.*?)\]/);
      
      if (rolesMatch || navigationMatch) {
        // For now, use defaults and log that we found YAML but couldn't parse it properly
        await logAudit({
          actor: 'SYSTEM',
          action: 'STRUCTURE_LOAD',
          payload: { reason: 'YAML_PARSING_NOT_IMPLEMENTED' },
        });
      }
    }

    // For now, always return defaults since we don't have a full YAML parser
    cachedStructure = DEFAULT_STRUCTURE;
    cacheExpiry = Date.now() + CACHE_DURATION;
    return cachedStructure;

  } catch (error) {
    await logAudit({
      actor: 'SYSTEM',
      action: 'STRUCTURE_LOAD',
      payload: { 
        reason: 'STRUCTURE_LOAD_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
    });
    
    cachedStructure = DEFAULT_STRUCTURE;
    cacheExpiry = Date.now() + CACHE_DURATION;
    return cachedStructure;
  }
}

export function getNavigationForRole(role: string, structure: StructureConfig) {
  return structure.navigation.filter(item => item.roles.includes(role));
}
