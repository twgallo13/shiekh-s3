"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { 
  performDocsLint, 
  generateFixCommands, 
  getAnchorSuggestions,
  clearAnchorsCache,
  getCacheStatus,
  type DocsLintResult,
  type DocLinkInfo
} from "@/lib/dev/docsAnchors";
import { useToast } from "@/components/ui/ToastHost";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

/**
 * Docs Lint Page
 * Development-only page for comprehensive documentation link validation
 * Provides detailed analysis of all /docs# links in the codebase
 */
export default function DocsLintPage() {
  const toast = useToast();
  const [lintResult, setLintResult] = useState<DocsLintResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLink, setSelectedLink] = useState<DocLinkInfo | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cacheStatus, setCacheStatus] = useState({ cached: false, age: 0 });

  // Load lint results on mount
  useEffect(() => {
    handleRescan();
  }, []);

  // Update cache status periodically
  useEffect(() => {
    const updateCacheStatus = () => {
      setCacheStatus(getCacheStatus());
    };

    updateCacheStatus();
    const interval = setInterval(updateCacheStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle rescan
  const handleRescan = useCallback(async () => {
    setLoading(true);
    try {
      const result = await performDocsLint();
      setLintResult(result);
      
      toast({
        kind: 'ok',
        text: `Scanned ${result.totalUsed} links, found ${result.anchorsUsedNotFound.length} invalid`
      });
    } catch (error) {
      toast({
        kind: 'err',
        text: 'Failed to scan documentation links'
      });
      console.error('Docs lint error:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Handle clear cache
  const handleClearCache = useCallback(() => {
    clearAnchorsCache();
    setCacheStatus(getCacheStatus());
    toast({
      kind: 'ok',
      text: 'Anchors cache cleared'
    });
  }, [toast]);

  // Handle copy fix command
  const handleCopyFixCommand = useCallback((link: DocLinkInfo) => {
    const commands = generateFixCommands([link]);
    const commandText = commands.join('\n');
    
    navigator.clipboard.writeText(commandText).then(() => {
      toast({
        kind: 'ok',
        text: 'Fix command copied to clipboard'
      });
    }).catch(() => {
      toast({
        kind: 'err',
        text: 'Failed to copy fix command'
      });
    });
  }, [toast]);

  // Handle copy all fix commands
  const handleCopyAllFixCommands = useCallback(() => {
    if (!lintResult) return;
    
    const commands = generateFixCommands(lintResult.anchorsUsedNotFound);
    const commandText = commands.join('\n\n');
    
    navigator.clipboard.writeText(commandText).then(() => {
      toast({
        kind: 'ok',
        text: 'All fix commands copied to clipboard'
      });
    }).catch(() => {
      toast({
        kind: 'err',
        text: 'Failed to copy fix commands'
      });
    });
  }, [lintResult, toast]);

  // Handle open docs at anchor
  const handleOpenDocs = useCallback((anchor: string) => {
    const docsUrl = `/docs#${anchor}`;
    window.open(docsUrl, '_blank');
  }, []);

  // Handle show suggestions
  const handleShowSuggestions = useCallback((link: DocLinkInfo) => {
    setSelectedLink(link);
    setShowSuggestions(true);
  }, []);

  // Get suggestions for selected link
  const suggestions = selectedLink && lintResult 
    ? getAnchorSuggestions(selectedLink.anchor, lintResult.anchorsDefinedUnused)
    : [];

  // Format cache age
  const formatCacheAge = (age: number) => {
    if (age < 1000) return `${age}ms`;
    if (age < 60000) return `${Math.floor(age / 1000)}s`;
    return `${Math.floor(age / 60000)}m`;
  };

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Development Only</h1>
          <p className="text-gray-600">
            This page is only available in development mode.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Docs Lint Dashboard</h1>
            <p className="text-gray-600">Validate documentation anchor links against structure.md</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 text-blue-800">
              Development Only
            </Badge>
            {cacheStatus.cached && (
              <Badge className="bg-green-100 text-green-800">
                Cache: {formatCacheAge(cacheStatus.age)}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRescan}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Scanning...' : 'Re-scan'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClearCache}
            >
              Clear Cache
            </Button>

            {lintResult && lintResult.anchorsUsedNotFound.length > 0 && (
              <Button
                variant="outline"
                onClick={handleCopyAllFixCommands}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                Copy All Fix Commands
              </Button>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            Last scanned: {lintResult?.lastScanned ? new Date(lintResult.lastScanned).toLocaleString() : 'Never'}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{lintResult?.totalUsed || 0}</div>
              <div className="text-sm text-gray-600">Links Used</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{lintResult?.totalDefined || 0}</div>
              <div className="text-sm text-gray-600">Anchors Defined</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{lintResult?.anchorsUsedNotFound.length || 0}</div>
              <div className="text-sm text-gray-600">Invalid Links</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{lintResult?.anchorsDefinedUnused.length || 0}</div>
              <div className="text-sm text-gray-600">Unused Anchors</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invalid Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Invalid Links</span>
                <Badge className="bg-red-100 text-red-800">
                  {lintResult?.anchorsUsedNotFound.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {lintResult?.anchorsUsedNotFound.length === 0 ? (
                  <div className="text-center text-green-600 dark:text-green-400 py-8">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-lg font-medium">All documentation links are valid!</p>
                    <p className="text-sm text-gray-500 mt-2">No invalid links found in the codebase</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lintResult?.anchorsUsedNotFound.map((link, index) => (
                      <Card key={index} className="p-3 border-red-200 bg-red-50 dark:bg-red-900">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-red-800 dark:text-red-200">
                                {link.file}:{link.line}
                              </div>
                              <div className="text-xs text-red-600 dark:text-red-300 font-mono">
                                {link.link}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {link.context}
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopyFixCommand(link)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy Fix Command</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenDocs(link.anchor)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Open Docs at Anchor</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleShowSuggestions(link)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Show Suggestions</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Unused Anchors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Unused Anchors</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {lintResult?.anchorsDefinedUnused.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {lintResult?.anchorsDefinedUnused.length === 0 ? (
                  <div className="text-center text-green-600 dark:text-green-400 py-8">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-lg font-medium">All anchors are being used!</p>
                    <p className="text-sm text-gray-500 mt-2">No unused anchors found in structure.md</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lintResult?.anchorsDefinedUnused.map((anchor, index) => (
                      <div
                        key={index}
                        className="p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <code className="text-sm font-mono text-yellow-800 dark:text-yellow-200">
                              {anchor}
                            </code>
                            <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                              Defined in structure.md but not referenced
                            </p>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDocs(anchor)}
                                className="h-7 w-7 p-0"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Open Docs at Anchor</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Development Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-medium">Development Mode</div>
              <div className="text-sm">
                This tool scans local files for /docs# links and validates them against structure.md.
                No external data transmission occurs. Use Alt+Shift+D to open the floating panel.
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions Modal */}
        {showSuggestions && selectedLink && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Anchor Suggestions</span>
                  <Button
                    variant="outline"
                    onClick={() => setShowSuggestions(false)}
                  >
                    Close
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Invalid anchor: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{selectedLink.anchor}</code>
                    </p>
                  </div>
                  
                  {suggestions.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium mb-2">Similar anchors found:</p>
                      <div className="space-y-1">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="p-2 bg-gray-50 dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => {
                              handleOpenDocs(suggestion);
                              setShowSuggestions(false);
                            }}
                          >
                            <code className="text-sm">{suggestion}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      <p className="text-sm">No similar anchors found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
