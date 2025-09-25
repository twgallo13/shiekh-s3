/**
 * Saved Filters + Quick-Insert + Deep Links
 * Type-safe registry for role-aware filter presets
 * Aligned to §8 UI/UX Contracts (routes + filters)
 */

export interface FilterPreset {
  name: string;
  params: Record<string, string | number | boolean>;
  createdAt: number;
}

export interface PresetRegistry {
  [route: string]: {
    [role: string]: FilterPreset[];
  };
}

// Valid routes that support filter presets
const VALID_ROUTES = [
  'dashboard',
  'audit',
  'approvals',
  'products',
  'orders',
  'variances',
  'compliance'
] as const;

type ValidRoute = typeof VALID_ROUTES[number];

// Valid roles for RBAC
const VALID_ROLES = [
  'ADMIN',
  'FM',
  'SM',
  'DM',
  'WHS',
  'AM',
  'COST_ANALYST'
] as const;

type ValidRole = typeof VALID_ROLES[number];

class FilterPresetManager {
  private storageKey = 's3:preset';

  /**
   * Get all presets for a specific route and role
   */
  readPresets(route: string, role: string): FilterPreset[] {
    if (!this.isValidRoute(route) || !this.isValidRole(role)) {
      return [];
    }

    try {
      const key = `${this.storageKey}:${route}:${role}`;
      const stored = localStorage.getItem(key);
      if (!stored) return [];

      const presets = JSON.parse(stored) as FilterPreset[];
      return Array.isArray(presets) ? presets : [];
    } catch (error) {
      console.warn('Failed to read filter presets:', error);
      return [];
    }
  }

  /**
   * Save a preset for a specific route and role
   */
  savePreset(route: string, role: string, preset: FilterPreset): void {
    if (!this.isValidRoute(route) || !this.isValidRole(role)) {
      console.warn('Invalid route or role for preset:', { route, role });
      return;
    }

    try {
      const key = `${this.storageKey}:${route}:${role}`;
      const existing = this.readPresets(route, role);
      
      // Check if preset with same name exists
      const existingIndex = existing.findIndex(p => p.name === preset.name);
      
      if (existingIndex >= 0) {
        // Update existing preset
        existing[existingIndex] = preset;
      } else {
        // Add new preset
        existing.push(preset);
      }

      // Sort by creation date (newest first)
      existing.sort((a, b) => b.createdAt - a.createdAt);

      localStorage.setItem(key, JSON.stringify(existing));
      
      // Emit change event
      this.emitChange(route, role);
    } catch (error) {
      console.error('Failed to save filter preset:', error);
    }
  }

  /**
   * Get a specific preset by name
   */
  getPresetByName(route: string, role: string, name: string): FilterPreset | null {
    const presets = this.readPresets(route, role);
    return presets.find(p => p.name === name) || null;
  }

  /**
   * Delete a preset by name
   */
  deletePreset(route: string, role: string, name: string): boolean {
    if (!this.isValidRoute(route) || !this.isValidRole(role)) {
      return false;
    }

    try {
      const key = `${this.storageKey}:${route}:${role}`;
      const existing = this.readPresets(route, role);
      const filtered = existing.filter(p => p.name !== name);

      if (filtered.length === existing.length) {
        return false; // Preset not found
      }

      localStorage.setItem(key, JSON.stringify(filtered));
      this.emitChange(route, role);
      return true;
    } catch (error) {
      console.error('Failed to delete filter preset:', error);
      return false;
    }
  }

  /**
   * Rename a preset
   */
  renamePreset(route: string, role: string, oldName: string, newName: string): boolean {
    if (!this.isValidRoute(route) || !this.isValidRole(role)) {
      return false;
    }

    const preset = this.getPresetByName(route, role, oldName);
    if (!preset) {
      return false;
    }

    // Check if new name already exists
    const existingWithNewName = this.getPresetByName(route, role, newName);
    if (existingWithNewName) {
      return false; // Name already exists
    }

    // Update preset with new name
    const updatedPreset: FilterPreset = {
      ...preset,
      name: newName
    };

    this.savePreset(route, role, updatedPreset);
    this.deletePreset(route, role, oldName);
    return true;
  }

  /**
   * Get all presets for current route and role (RBAC-aware)
   */
  getPresetsForCurrentContext(route: string, effectiveRole: string): FilterPreset[] {
    // Only return presets visible to the current role
    return this.readPresets(route, effectiveRole);
  }

  /**
   * Create a preset from current filter parameters
   */
  createPreset(name: string, params: Record<string, string | number | boolean>): FilterPreset {
    return {
      name: name.trim(),
      params: { ...params },
      createdAt: Date.now()
    };
  }

  /**
   * Validate preset name
   */
  validatePresetName(name: string): { valid: boolean; error?: string } {
    const trimmed = name.trim();
    
    if (!trimmed) {
      return { valid: false, error: 'Preset name cannot be empty' };
    }
    
    if (trimmed.length > 50) {
      return { valid: false, error: 'Preset name must be 50 characters or less' };
    }
    
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
      return { valid: false, error: 'Preset name can only contain letters, numbers, spaces, hyphens, and underscores' };
    }
    
    return { valid: true };
  }

  /**
   * Get preset statistics
   */
  getPresetStats(route: string, role: string): { total: number; oldest?: number; newest?: number } {
    const presets = this.readPresets(route, role);
    
    if (presets.length === 0) {
      return { total: 0 };
    }
    
    const timestamps = presets.map(p => p.createdAt);
    return {
      total: presets.length,
      oldest: Math.min(...timestamps),
      newest: Math.max(...timestamps)
    };
  }

  /**
   * Clear all presets for a route and role
   */
  clearAllPresets(route: string, role: string): boolean {
    if (!this.isValidRoute(route) || !this.isValidRole(role)) {
      return false;
    }

    try {
      const key = `${this.storageKey}:${route}:${role}`;
      localStorage.removeItem(key);
      this.emitChange(route, role);
      return true;
    } catch (error) {
      console.error('Failed to clear filter presets:', error);
      return false;
    }
  }

  /**
   * Export presets for backup
   */
  exportPresets(route: string, role: string): string | null {
    const presets = this.readPresets(route, role);
    if (presets.length === 0) {
      return null;
    }

    try {
      return JSON.stringify({
        route,
        role,
        presets,
        exportedAt: Date.now(),
        version: '1.0'
      }, null, 2);
    } catch (error) {
      console.error('Failed to export presets:', error);
      return null;
    }
  }

  /**
   * Import presets from backup
   */
  importPresets(route: string, role: string, data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (!parsed.presets || !Array.isArray(parsed.presets)) {
        return false;
      }

      // Validate preset structure
      const validPresets = parsed.presets.filter((p: any) => 
        p && 
        typeof p.name === 'string' && 
        typeof p.params === 'object' && 
        typeof p.createdAt === 'number'
      );

      if (validPresets.length === 0) {
        return false;
      }

      // Save imported presets
      const key = `${this.storageKey}:${route}:${role}`;
      localStorage.setItem(key, JSON.stringify(validPresets));
      this.emitChange(route, role);
      return true;
    } catch (error) {
      console.error('Failed to import presets:', error);
      return false;
    }
  }

  private isValidRoute(route: string): route is ValidRoute {
    return VALID_ROUTES.includes(route as ValidRoute);
  }

  private isValidRole(role: string): role is ValidRole {
    return VALID_ROLES.includes(role as ValidRole);
  }

  private emitChange(route: string, role: string): void {
    // Emit custom event for components to listen to
    const event = new CustomEvent('presetChanged', {
      detail: { route, role }
    });
    window.dispatchEvent(event);
  }
}

// Singleton instance
let presetManagerInstance: FilterPresetManager | null = null;

export function getPresetManager(): FilterPresetManager {
  if (!presetManagerInstance) {
    presetManagerInstance = new FilterPresetManager();
  }
  return presetManagerInstance;
}

// Convenience functions
export function readPresets(route: string, role: string): FilterPreset[] {
  return getPresetManager().readPresets(route, role);
}

export function savePreset(route: string, role: string, preset: FilterPreset): void {
  getPresetManager().savePreset(route, role, preset);
}

export function getPresetByName(route: string, role: string, name: string): FilterPreset | null {
  return getPresetManager().getPresetByName(route, role, name);
}

export function deletePreset(route: string, role: string, name: string): boolean {
  return getPresetManager().deletePreset(route, role, name);
}

export function renamePreset(route: string, role: string, oldName: string, newName: string): boolean {
  return getPresetManager().renamePreset(route, role, oldName, newName);
}

export function getPresetsForCurrentContext(route: string, effectiveRole: string): FilterPreset[] {
  return getPresetManager().getPresetsForCurrentContext(route, effectiveRole);
}

export function createPreset(name: string, params: Record<string, string | number | boolean>): FilterPreset {
  return getPresetManager().createPreset(name, params);
}

export function validatePresetName(name: string): { valid: boolean; error?: string } {
  return getPresetManager().validatePresetName(name);
}
