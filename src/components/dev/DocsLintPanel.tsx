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

interface DocsLintPanelProps {
  className?: string;
}

/**
 * Docs Lint Panel Component
 * Development-only panel for validating documentation anchor links
 * Lists invalid links with file hints and provides fix commands
 */
export default function DocsLintPanel({ className = "" }: DocsLintPanelProps) {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [lintResult, setLintResult] = useState<DocsLintResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedLink, setSelectedLink] = useState<DocLinkInfo | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Keyboard shortcut to toggle panel (Alt+Shift+D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey && event.key === 'D') {
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load lint results on mount
  useEffect(() => {
    if (isOpen && !lintResult) {
      handleRescan();
    }
  }, [isOpen, lintResult]);

  // Drag functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [isDragging, position]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

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

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <TooltipProvider>
      <div
        className={`fixed z-[1000] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl transition-all duration-200 ease-in-out
                    ${isOpen ? 'w-[500px] h-[700px] opacity-100' : 'w-10 h-10 opacity-0 pointer-events-none'}
                    flex flex-col`}
        style={{ left: position.x, top: position.y }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 cursor-grab rounded-t-lg"
          onMouseDown={handleMouseDown}
        >
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Docs Lint Panel (Dev)</h3>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open('/dev/docs-lint', '_blank')} 
                  className="h-7 w-7 p-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Full Docs Lint Page</TooltipContent>
            </Tooltip>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-7 w-7 p-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-2 text-xs text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-700">
          <p><strong>Dev-Only:</strong> Scans local files for /docs# links. No external data transmission.</p>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex overflow-hidden">
          <div className="w-full flex flex-col">
            {/* Summary */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRescan}
                    disabled={loading}
                    className="text-xs"
                  >
                    {loading ? 'Scanning...' : 'Re-scan'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCache}
                    className="text-xs"
                  >
                    Clear Cache
                  </Button>
                </div>
              </div>
              
              {lintResult && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {lintResult.totalUsed}
                    </Badge>
                    <span className="text-gray-600 dark:text-gray-400">Links Used</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      {lintResult.totalDefined}
                    </Badge>
                    <span className="text-gray-600 dark:text-gray-400">Anchors Defined</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800">
                      {lintResult.anchorsUsedNotFound.length}
                    </Badge>
                    <span className="text-gray-600 dark:text-gray-400">Invalid Links</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {lintResult.anchorsDefinedUnused.length}
                    </Badge>
                    <span className="text-gray-600 dark:text-gray-400">Unused Anchors</span>
                  </div>
                </div>
              )}
            </div>

            {/* Invalid Links */}
            <div className="flex-grow overflow-hidden">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Invalid Links ({lintResult?.anchorsUsedNotFound.length || 0})
                </h4>
              </div>
              
              <ScrollArea className="flex-grow p-3">
                {lintResult?.anchorsUsedNotFound.length === 0 ? (
                  <div className="text-center text-green-600 dark:text-green-400 py-4">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm">All documentation links are valid!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
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
                                    className="h-6 w-6 p-0 text-xs"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    className="h-6 w-6 p-0 text-xs"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    className="h-6 w-6 p-0 text-xs"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>
          </div>
        </div>

        {/* Suggestions Modal */}
        {showSuggestions && selectedLink && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1100]">
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
