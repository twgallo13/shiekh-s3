"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { 
  validate, 
  getValidationCodeDescription, 
  getAvailableEndpoints,
  getAvailableRequestEndpoints,
  createSamplePayload,
  type SchemaValidationError
} from "@/lib/dev/schemaCheck";
import { setValidationEntryCallback } from "@/lib/client/http";

interface ValidationEntry {
  id: string;
  timestamp: string;
  endpoint: string;
  isRequest: boolean;
  data: any;
  result: {
    ok: boolean;
    errors: SchemaValidationError[];
  };
}

interface SchemaOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Schema Overlay Component - Development Only
 * Draggable panel listing recent requests/responses with pass/fail badges
 * Shows validation results and allows inspection of schema conformance
 */
export default function SchemaOverlay({ isOpen, onClose }: SchemaOverlayProps) {
  const [entries, setEntries] = useState<ValidationEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<ValidationEntry | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Load entries from localStorage on mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const stored = localStorage.getItem('dev:schemaValidationEntries');
      if (stored) {
        try {
          setEntries(JSON.parse(stored));
        } catch (error) {
          console.warn('Failed to load schema validation entries:', error);
        }
      }
    }
  }, []);

  // Save entries to localStorage
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && entries.length > 0) {
      localStorage.setItem('dev:schemaValidationEntries', JSON.stringify(entries));
    }
  }, [entries]);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
      e.preventDefault();
    }
  };

  // Handle drag move
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && dragStartRef.current) {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      setPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
    }
  };

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Add new validation entry (called from http.ts)
  const addValidationEntry = (endpoint: string, data: any, isRequest: boolean) => {
    if (process.env.NODE_ENV !== 'development') return;

    const result = validate(endpoint, data, isRequest);
    const entry: ValidationEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      endpoint,
      isRequest,
      data,
      result
    };

    setEntries(prev => [entry, ...prev.slice(0, 49)]); // Keep last 50 entries
  };

  // Connect to http.ts validation
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setValidationEntryCallback(addValidationEntry);
    }
  }, []);

  // Clear all entries
  const clearEntries = () => {
    setEntries([]);
    setSelectedEntry(null);
    localStorage.removeItem('dev:schemaValidationEntries');
  };

  // Copy sample payload
  const copySamplePayload = (endpoint: string, isRequest: boolean) => {
    const sample = createSamplePayload(endpoint, isRequest);
    if (sample) {
      navigator.clipboard.writeText(JSON.stringify(sample, null, 2));
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get status badge color
  const getStatusBadgeColor = (ok: boolean) => {
    return ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Get method badge color
  const getMethodBadgeColor = (endpoint: string) => {
    if (endpoint.startsWith('GET')) return 'bg-blue-100 text-blue-800';
    if (endpoint.startsWith('POST')) return 'bg-green-100 text-green-800';
    if (endpoint.startsWith('PUT')) return 'bg-yellow-100 text-yellow-800';
    if (endpoint.startsWith('DELETE')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (process.env.NODE_ENV !== 'development' || !isOpen) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg"
      style={{
        left: position.x,
        top: position.y,
        width: '600px',
        maxHeight: '80vh',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="drag-handle flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg cursor-grab">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Schema Validation</h3>
          <Badge className="bg-blue-100 text-blue-800">Dev Only</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={clearEntries}
            className="text-xs"
          >
            Clear All
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="text-xs"
          >
            Close
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-96">
        {/* Entries List */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
          <div className="p-2">
            {entries.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No validation entries yet</p>
                <p className="text-xs mt-1">Make API calls to see validation results</p>
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <Card
                    key={entry.id}
                    className={`cursor-pointer transition-colors ${
                      selectedEntry?.id === entry.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={`text-xs ${getMethodBadgeColor(entry.endpoint)}`}>
                          {entry.endpoint.split(' ')[0]}
                        </Badge>
                        <Badge className={`text-xs ${getStatusBadgeColor(entry.result.ok)}`}>
                          {entry.result.ok ? 'PASS' : 'FAIL'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {entry.endpoint}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(entry.timestamp)}
                        {entry.isRequest && <span className="ml-1 text-blue-600">(Request)</span>}
                      </div>
                      {!entry.result.ok && (
                        <div className="text-xs text-red-600 mt-1">
                          {entry.result.errors.length} error(s)
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className="w-1/2 overflow-y-auto">
          {selectedEntry ? (
            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Validation Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Endpoint:</span> {selectedEntry.endpoint}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {selectedEntry.isRequest ? 'Request' : 'Response'}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {formatTimestamp(selectedEntry.timestamp)}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge className={`ml-2 text-xs ${getStatusBadgeColor(selectedEntry.result.ok)}`}>
                      {selectedEntry.result.ok ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                </div>
              </div>

              {!selectedEntry.result.ok && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Validation Errors</h5>
                  <div className="space-y-2">
                    {selectedEntry.result.errors.map((error, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded p-2">
                        <div className="text-sm font-medium text-red-800">
                          {error.code}: {getValidationCodeDescription(error.code as any)}
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                          Path: {error.path || 'root'}
                        </div>
                        <div className="text-xs text-red-600">
                          Value: {JSON.stringify(error.value)}
                        </div>
                        {error.expected && (
                          <div className="text-xs text-red-600">
                            Expected: {JSON.stringify(error.expected)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">Payload</h5>
                  <Button
                    variant="outline"
                    onClick={() => copySamplePayload(selectedEntry.endpoint, selectedEntry.isRequest)}
                    className="text-xs"
                  >
                    Copy Sample
                  </Button>
                </div>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(selectedEntry.data, null, 2)}
                </pre>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open('/docs#7-API-Contracts', '_blank')}
                  className="text-xs flex-1"
                >
                  Open Docs
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">Select an entry to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div>
            {entries.length} entries • Alt+Shift+S to toggle
          </div>
          <div className="text-gray-500">
            Dev privacy: No data transmitted externally
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for managing schema overlay
export function useSchemaOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  const openOverlay = () => {
    if (process.env.NODE_ENV === 'development') {
      setIsOpen(true);
    }
  };

  const closeOverlay = () => {
    setIsOpen(false);
  };

  const toggleOverlay = () => {
    if (process.env.NODE_ENV === 'development') {
      setIsOpen(prev => !prev);
    }
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        toggleOverlay();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const SchemaOverlayComponent = process.env.NODE_ENV === 'development' ? (
    <SchemaOverlay isOpen={isOpen} onClose={closeOverlay} />
  ) : null;

  return {
    isOpen,
    openOverlay,
    closeOverlay,
    toggleOverlay,
    SchemaOverlayComponent,
  };
}
