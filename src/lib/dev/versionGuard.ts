/**
 * Version Guard - Development Only
 * Compares version.ts with CHANGELOG.md to ensure consistency
 * Helps prevent version mismatches during development
 */

import { APP_VERSION } from '@/app/version';

export interface VersionCheckResult {
  ok: boolean;
  app: string;
  changelog: string;
  mismatch?: string;
  error?: string;
  timestamp: string;
}

export interface ChangelogApiResponse {
  latest: string;
  parsed: boolean;
  timestamp: string;
  error?: string;
  guidance?: string;
}

class VersionGuard {
  private cache: VersionCheckResult | null = null;
  private lastCheck: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  /**
   * Check version consistency between version.ts and CHANGELOG.md
   */
  async checkVersion(): Promise<VersionCheckResult> {
    // Return cached result if recent
    if (this.cache && Date.now() - this.lastCheck < this.CACHE_DURATION) {
      return this.cache;
    }

    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return {
        ok: true,
        app: APP_VERSION,
        changelog: 'N/A (production)',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const response = await fetch('/api/meta/changelog', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          ok: false,
          app: APP_VERSION,
          changelog: 'Error',
          error: errorData.error || `HTTP ${response.status}`,
          timestamp: new Date().toISOString()
        };
      }

      const data: ChangelogApiResponse = await response.json();

      if (data.error) {
        return {
          ok: false,
          app: APP_VERSION,
          changelog: 'Parse Error',
          error: data.error,
          timestamp: new Date().toISOString()
        };
      }

      const versionsMatch = APP_VERSION === data.latest;
      const result: VersionCheckResult = {
        ok: versionsMatch,
        app: APP_VERSION,
        changelog: data.latest,
        timestamp: new Date().toISOString()
      };

      if (!versionsMatch) {
        result.mismatch = `App version (${APP_VERSION}) does not match changelog version (${data.latest})`;
      }

      // Cache the result
      this.cache = result;
      this.lastCheck = Date.now();

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const result: VersionCheckResult = {
        ok: false,
        app: APP_VERSION,
        changelog: 'Network Error',
        error: `Failed to fetch changelog: ${errorMessage}`,
        timestamp: new Date().toISOString()
      };

      return result;
    }
  }

  /**
   * Force refresh the version check (bypass cache)
   */
  async forceCheck(): Promise<VersionCheckResult> {
    this.cache = null;
    this.lastCheck = 0;
    return this.checkVersion();
  }

  /**
   * Get cached result without making a new request
   */
  getCachedResult(): VersionCheckResult | null {
    return this.cache;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache = null;
    this.lastCheck = 0;
  }

  /**
   * Check if the current app version is newer than changelog version
   */
  isAppVersionNewer(appVersion: string, changelogVersion: string): boolean {
    try {
      // Remove 'v' prefix and split by dots
      const appParts = appVersion.replace('v', '').split('.').map(Number);
      const changelogParts = changelogVersion.replace('v', '').split('.').map(Number);

      // Compare major, minor, patch
      for (let i = 0; i < 3; i++) {
        const appPart = appParts[i] || 0;
        const changelogPart = changelogParts[i] || 0;
        
        if (appPart > changelogPart) return true;
        if (appPart < changelogPart) return false;
      }

      return false; // Equal versions
    } catch (error) {
      console.warn('Error comparing versions:', error);
      return false;
    }
  }

  /**
   * Get version comparison details
   */
  getVersionComparison(appVersion: string, changelogVersion: string): {
    status: 'match' | 'app-newer' | 'changelog-newer' | 'error';
    message: string;
  } {
    if (appVersion === changelogVersion) {
      return {
        status: 'match',
        message: 'Versions match perfectly'
      };
    }

    try {
      const appNewer = this.isAppVersionNewer(appVersion, changelogVersion);
      
      if (appNewer) {
        return {
          status: 'app-newer',
          message: `App version (${appVersion}) is newer than changelog (${changelogVersion})`
        };
      } else {
        return {
          status: 'changelog-newer',
          message: `Changelog version (${changelogVersion}) is newer than app (${appVersion})`
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Error comparing versions'
      };
    }
  }

  /**
   * Get guidance for fixing version mismatches
   */
  getFixGuidance(result: VersionCheckResult): string[] {
    const guidance: string[] = [];

    if (!result.ok && result.mismatch) {
      if (result.app !== result.changelog) {
        guidance.push('Update src/app/version.ts to match the latest CHANGELOG.md entry');
        guidance.push('Or add a new entry to CHANGELOG.md for the current version');
      }
    }

    if (result.error) {
      guidance.push('Check that CHANGELOG.md exists in src/content/');
      guidance.push('Ensure the latest entry starts with "## vX.Y.Z"');
    }

    return guidance;
  }

  /**
   * Format version info for display
   */
  formatVersionInfo(result: VersionCheckResult): {
    status: string;
    statusColor: string;
    details: string;
    icon: string;
  } {
    if (result.ok) {
      return {
        status: 'Version OK',
        statusColor: 'text-green-600',
        details: `App: ${result.app} | Changelog: ${result.changelog}`,
        icon: '✓'
      };
    }

    if (result.error) {
      return {
        status: 'Error',
        statusColor: 'text-red-600',
        details: result.error,
        icon: '⚠'
      };
    }

    return {
      status: 'Mismatch',
      statusColor: 'text-yellow-600',
      details: result.mismatch || 'Version mismatch detected',
      icon: '⚠'
    };
  }
}

// Singleton instance
let versionGuardInstance: VersionGuard | null = null;

export function getVersionGuard(): VersionGuard {
  if (!versionGuardInstance) {
    versionGuardInstance = new VersionGuard();
  }
  return versionGuardInstance;
}

// Convenience functions
export async function checkVersion(): Promise<VersionCheckResult> {
  return getVersionGuard().checkVersion();
}

export async function forceVersionCheck(): Promise<VersionCheckResult> {
  return getVersionGuard().forceCheck();
}

export function getCachedVersionResult(): VersionCheckResult | null {
  return getVersionGuard().getCachedResult();
}

export function clearVersionCache(): void {
  getVersionGuard().clearCache();
}

// Keyboard shortcut handler
export function setupVersionCheckShortcut(): () => void {
  if (process.env.NODE_ENV !== 'development') {
    return () => {}; // No-op in production
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+Alt+V to trigger version check
    if (e.ctrlKey && e.altKey && e.key === 'V') {
      e.preventDefault();
      forceVersionCheck().then(result => {
        console.log('Version Check Result:', result);
        
        // Dispatch custom event for components to listen to
        const event = new CustomEvent('versionCheck', {
          detail: result
        });
        window.dispatchEvent(event);
      });
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}
