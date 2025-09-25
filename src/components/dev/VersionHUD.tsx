"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { 
  checkVersion, 
  forceVersionCheck, 
  getCachedVersionResult,
  VersionCheckResult,
  getVersionGuard
} from "@/lib/dev/versionGuard";

interface VersionHUDProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Version HUD Component - Development Only
 * Shows version consistency between version.ts and CHANGELOG.md
 * Minimal idle cost with lazy fetch on first open or Ctrl+Alt+V
 */
export default function VersionHUD({ isOpen, onClose }: VersionHUDProps) {
  const [result, setResult] = useState<VersionCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // Load cached result on mount
  useEffect(() => {
    const cached = getCachedVersionResult();
    if (cached) {
      setResult(cached);
      setHasChecked(true);
    }
  }, []);

  // Check version when opened
  useEffect(() => {
    if (isOpen && !hasChecked) {
      handleCheckVersion();
    }
  }, [isOpen, hasChecked]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCheckVersion = async () => {
    setLoading(true);
    setError(null);

    try {
      const versionResult = await checkVersion();
      setResult(versionResult);
      setHasChecked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check version');
    } finally {
      setLoading(false);
    }
  };

  const handleForceCheck = async () => {
    setLoading(true);
    setError(null);

    try {
      const versionResult = await forceVersionCheck();
      setResult(versionResult);
      setHasChecked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to force check version');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChangelog = () => {
    // Open CHANGELOG.md in a new tab
    window.open('/src/content/CHANGELOG.md', '_blank');
  };

  const handleCopyVersions = () => {
    if (!result) return;

    const text = `App Version: ${result.app}\nChangelog Version: ${result.changelog}\nStatus: ${result.ok ? 'OK' : 'Mismatch'}\nTimestamp: ${result.timestamp}`;
    
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast here
      console.log('Versions copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  };

  const formatStatus = (result: VersionCheckResult) => {
    if (result.ok) {
      return {
        status: 'Version OK',
        statusColor: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: '✓'
      };
    }

    if (result.error) {
      return {
        status: 'Error',
        statusColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: '⚠'
      };
    }

    return {
      status: 'Mismatch',
      statusColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: '⚠'
    };
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={containerRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        role="dialog"
        aria-labelledby="version-hud-title"
        aria-describedby="version-hud-description"
        aria-modal="true"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle id="version-hud-title" className="text-lg flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Version Guard
            </CardTitle>
            <p id="version-hud-description" className="text-sm text-gray-600">
              Checks consistency between version.ts and CHANGELOG.md
            </p>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Status Display */}
              {result && (
                <div className={`p-4 rounded-lg border ${formatStatus(result).bgColor} ${formatStatus(result).borderColor}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-lg ${formatStatus(result).statusColor}`}>
                      {formatStatus(result).icon}
                    </span>
                    <span className={`font-medium ${formatStatus(result).statusColor}`}>
                      {formatStatus(result).status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>App Version: <span className="font-mono font-medium">{result.app}</span></div>
                    <div>Changelog Version: <span className="font-mono font-medium">{result.changelog}</span></div>
                    {result.mismatch && (
                      <div className="text-yellow-700 mt-2 p-2 bg-yellow-100 rounded text-xs">
                        {result.mismatch}
                      </div>
                    )}
                    {result.error && (
                      <div className="text-red-700 mt-2 p-2 bg-red-100 rounded text-xs">
                        {result.error}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-sm text-gray-600">Checking versions...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700" role="alert">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="font-medium">Check Failed</p>
                      <p className="text-xs mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleCheckVersion}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  {loading ? 'Checking...' : 'Check Version'}
                </Button>
                <Button
                  onClick={handleForceCheck}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  Force Check
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleOpenChangelog}
                  variant="outline"
                  className="flex-1"
                >
                  Open CHANGELOG
                </Button>
                <Button
                  onClick={handleCopyVersions}
                  disabled={!result}
                  variant="outline"
                  className="flex-1"
                >
                  Copy Versions
                </Button>
              </div>

              {/* Development Info */}
              <div className="pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Press Ctrl+Alt+V to trigger version check</p>
                  <p>• Results are cached for 30 seconds</p>
                  <p>• Only available in development mode</p>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2">
                <Button variant="outline" onClick={onClose} className="w-full">
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Hook for managing VersionHUD state
 */
export function useVersionHUD() {
  const [isOpen, setIsOpen] = useState(false);

  const openVersionHUD = () => setIsOpen(true);
  const closeVersionHUD = () => setIsOpen(false);

  // Keyboard shortcut: Ctrl+Alt+V
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'V') {
        e.preventDefault();
        openVersionHUD();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    openVersionHUD,
    closeVersionHUD,
    VersionHUDComponent: (
      <VersionHUD
        isOpen={isOpen}
        onClose={closeVersionHUD}
      />
    )
  };
}
