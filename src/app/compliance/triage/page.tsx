"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useRole } from "@/components/providers/RoleProvider";
import { useToast } from "@/components/ui/ToastHost";
import TriageBoard from "@/components/ui/TriageBoard";
import { 
  TriageItem, 
  getTriageStore, 
  saveTriageStore, 
  importComplianceEvents, 
  getMockComplianceEvents,
  getTriageStatistics,
  clearTriageItems,
  type TriageStore
} from "@/lib/compliance/triageStore";

/**
 * Compliance Triage Page
 * RBAC-scoped triage board for managing compliance items
 * Includes import functionality, print view, and deep linking
 */
export default function ComplianceTriagePage() {
  const { effectiveRole } = useRole();
  const toast = useToast();
  
  const [store, setStore] = useState<TriageStore>({ items: [], filters: {}, lastUpdated: '' });
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);

  // Check if user has access
  const hasAccess = ['ADMIN', 'FM', 'WHS'].includes(effectiveRole);

  // Load triage store
  useEffect(() => {
    const loadStore = () => {
      try {
        const triageStore = getTriageStore();
        setStore(triageStore);
      } catch (error) {
        console.error('Failed to load triage store:', error);
        toast({
          kind: 'err',
          text: 'Failed to load triage data'
        });
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [toast]);

  // Handle item move
  const handleItemMove = useCallback((itemId: string, newStatus: TriageItem['status']) => {
    // Store is already updated by the triage store functions
    // Just refresh the local state
    const updatedStore = getTriageStore();
    setStore(updatedStore);
  }, []);

  // Handle item click
  const handleItemClick = useCallback((item: TriageItem) => {
    if (item.href) {
      // Open deep link
      window.open(item.href, '_blank');
    }
  }, []);

  // Handle item annotation
  const handleItemAnnotate = useCallback((itemId: string, note: string) => {
    // Store is already updated by the triage store functions
    // Just refresh the local state
    const updatedStore = getTriageStore();
    setStore(updatedStore);
  }, []);

  // Handle import from API
  const handleImportFromApi = useCallback(async () => {
    setImporting(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get mock compliance events
      const mockEvents = getMockComplianceEvents();
      
      // Import events
      const action = importComplianceEvents(mockEvents);
      
      // Refresh store
      const updatedStore = getTriageStore();
      setStore(updatedStore);
      
      toast({
        kind: 'ok',
        text: `Imported ${action.payload.importedCount} compliance events`
      });
    } catch (error) {
      toast({
        kind: 'err',
        text: 'Failed to import compliance events'
      });
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  }, [toast]);

  // Handle clear all items
  const handleClearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all triage items? This action cannot be undone.')) {
      try {
        clearTriageItems();
        const updatedStore = getTriageStore();
        setStore(updatedStore);
        
        toast({
          kind: 'ok',
          text: 'All triage items cleared'
        });
      } catch (error) {
        toast({
          kind: 'err',
          text: 'Failed to clear triage items'
        });
        console.error('Clear error:', error);
      }
    }
  }, [toast]);

  // Handle print view
  const handlePrintView = useCallback(() => {
    setShowPrintView(true);
    // Trigger print after a short delay to ensure the print view is rendered
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 100);
  }, []);

  // Get statistics
  const statistics = getTriageStatistics();

  // Check for critical items and emit alerts
  useEffect(() => {
    const criticalItems = store.items.filter(item => 
      item.severity === 'CRITICAL' && item.status !== 'RESOLVED'
    );

    criticalItems.forEach(item => {
      // Emit toast for critical items (this would integrate with alerts bus)
      toast({
        kind: 'err',
        text: `CRITICAL: ${item.title}`,
        title: 'Critical Compliance Item'
      });
    });
  }, [store.items, toast]);

  // Permission denied state
  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Permission Denied</h1>
          <p className="text-gray-600 mb-4">
            You do not have permission to access the Compliance Triage Board.
          </p>
          <p className="text-sm text-gray-500">
            Required roles: Admin, FM, or WHS
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-gray-600">Loading compliance triage board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-6 ${showPrintView ? 'print-view' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Triage Board</h1>
          <p className="text-gray-600">Manage compliance items and investigations</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-100 text-blue-800">
            {effectiveRole}
          </Badge>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{statistics.byStatus.NEW || 0}</div>
            <div className="text-sm text-gray-600">New Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{statistics.byStatus.INVESTIGATING || 0}</div>
            <div className="text-sm text-gray-600">Investigating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{statistics.overdue}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleImportFromApi}
            disabled={importing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {importing ? 'Importing...' : 'Import from API'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handlePrintView}
          >
            Print View
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Triage Board */}
      <TriageBoard
        items={store.items}
        onItemMove={handleItemMove}
        onItemClick={handleItemClick}
        onItemAnnotate={handleItemAnnotate}
      />

      {/* Print View Styles */}
      {showPrintView && (
        <style jsx>{`
          .print-view .triage-board {
            break-inside: avoid;
          }
          
          .print-view .triage-column {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .print-view .triage-item {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          @media print {
            .print-view .no-print {
              display: none !important;
            }
            
            .print-view .triage-board {
              font-size: 12px;
            }
            
            .print-view .triage-item {
              border: 1px solid #ccc;
              margin-bottom: 8px;
              padding: 8px;
            }
          }
        `}</style>
      )}

      {/* Development Notice */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-medium">Development Mode</div>
              <div className="text-sm">
                All data is stored locally. No server writes are performed.
                Use "Import from API" to load mock compliance events.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
