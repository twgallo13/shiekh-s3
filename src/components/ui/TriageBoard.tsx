"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  TriageItem, 
  getTriageItemsByStatus, 
  moveTriageItem, 
  annotateTriageItem,
  isTriageItemOverdue,
  getTriageItemSlaStatus
} from "@/lib/compliance/triageStore";
import { useToast } from "@/components/ui/ToastHost";

interface TriageBoardProps {
  items: TriageItem[];
  onItemMove?: (itemId: string, newStatus: TriageItem['status']) => void;
  onItemClick?: (item: TriageItem) => void;
  onItemAnnotate?: (itemId: string, note: string) => void;
  className?: string;
}

interface DragState {
  isDragging: boolean;
  draggedItem: TriageItem | null;
  dragOverColumn: string | null;
}

const COLUMNS = [
  { id: 'NEW', title: 'New', color: 'bg-blue-100 text-blue-800' },
  { id: 'INVESTIGATING', title: 'Investigating', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'BLOCKED', title: 'Blocked', color: 'bg-red-100 text-red-800' },
  { id: 'RESOLVED', title: 'Resolved', color: 'bg-green-100 text-green-800' }
] as const;

const SEVERITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800'
};

const PRIORITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800'
};

/**
 * Triage Board Component
 * Drag and drop board for managing compliance triage items
 * Keyboard accessible with aria-live updates and SLA tooltips
 */
export default function TriageBoard({ 
  items, 
  onItemMove, 
  onItemClick, 
  onItemAnnotate,
  className = "" 
}: TriageBoardProps) {
  const toast = useToast();
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    dragOverColumn: null
  });
  const [selectedItem, setSelectedItem] = useState<TriageItem | null>(null);
  const [annotationText, setAnnotationText] = useState('');

  // Group items by status
  const itemsByStatus = items.reduce((acc, item) => {
    if (!acc[item.status]) {
      acc[item.status] = [];
    }
    acc[item.status].push(item);
    return acc;
  }, {} as Record<TriageItem['status'], TriageItem[]>);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, item: TriageItem) => {
    setDragState({
      isDragging: true,
      draggedItem: item,
      dragOverColumn: null
    });
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragOverColumn: null
    });
    
    // Remove visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    setDragState(prev => ({
      ...prev,
      dragOverColumn: columnId
    }));
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear drag over if leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragState(prev => ({
        ...prev,
        dragOverColumn: null
      }));
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, targetStatus: TriageItem['status']) => {
    e.preventDefault();
    
    const itemId = e.dataTransfer.getData('text/plain');
    const item = items.find(i => i.id === itemId);
    
    if (!item || item.status === targetStatus) {
      setDragState({
        isDragging: false,
        draggedItem: null,
        dragOverColumn: null
      });
      return;
    }

    try {
      moveTriageItem(itemId, targetStatus);
      onItemMove?.(itemId, targetStatus);
      
      toast({
        kind: 'ok',
        text: `Moved "${item.title}" to ${targetStatus.toLowerCase()}`
      });
    } catch (error) {
      toast({
        kind: 'err',
        text: 'Failed to move item'
      });
      console.error('Move item error:', error);
    }

    setDragState({
      isDragging: false,
      draggedItem: null,
      dragOverColumn: null
    });
  }, [items, onItemMove, toast]);

  // Handle item click
  const handleItemClick = useCallback((item: TriageItem) => {
    setSelectedItem(item);
    onItemClick?.(item);
  }, [onItemClick]);

  // Handle annotation submit
  const handleAnnotationSubmit = useCallback(() => {
    if (!selectedItem || !annotationText.trim()) return;

    try {
      annotateTriageItem(selectedItem.id, annotationText.trim());
      onItemAnnotate?.(selectedItem.id, annotationText.trim());
      
      toast({
        kind: 'ok',
        text: 'Annotation added successfully'
      });
      
      setAnnotationText('');
      setSelectedItem(null);
    } catch (error) {
      toast({
        kind: 'err',
        text: 'Failed to add annotation'
      });
      console.error('Annotation error:', error);
    }
  }, [selectedItem, annotationText, onItemAnnotate, toast]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, item: TriageItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(item);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const currentIndex = COLUMNS.findIndex(col => col.id === item.status);
      if (currentIndex < COLUMNS.length - 1) {
        const nextStatus = COLUMNS[currentIndex + 1].id as TriageItem['status'];
        moveTriageItem(item.id, nextStatus);
        onItemMove?.(item.id, nextStatus);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentIndex = COLUMNS.findIndex(col => col.id === item.status);
      if (currentIndex > 0) {
        const prevStatus = COLUMNS[currentIndex - 1].id as TriageItem['status'];
        moveTriageItem(item.id, prevStatus);
        onItemMove?.(item.id, prevStatus);
      }
    }
  }, [handleItemClick, onItemMove]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get SLA tooltip text
  const getSlaTooltip = (item: TriageItem) => {
    if (!item.slaDeadline) return 'No SLA deadline set';
    
    const slaStatus = getTriageItemSlaStatus(item);
    const deadline = new Date(item.slaDeadline);
    const deadlineStr = deadline.toLocaleString();
    
    switch (slaStatus) {
      case 'OVERDUE':
        return `OVERDUE: Deadline was ${deadlineStr}`;
      case 'WARNING':
        return `WARNING: Deadline is ${deadlineStr}`;
      default:
        return `SLA: Deadline is ${deadlineStr}`;
    }
  };

  return (
    <div className={`triage-board ${className}`}>
      {/* Board Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Compliance Triage Board</h2>
        <p className="text-gray-600">
          Drag items between columns or use keyboard navigation (← → arrows)
        </p>
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLUMNS.map(column => {
          const columnItems = itemsByStatus[column.id as TriageItem['status']] || [];
          const isDragOver = dragState.dragOverColumn === column.id;
          
          return (
            <div
              key={column.id}
              className={`triage-column ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id as TriageItem['status'])}
            >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className={column.color}>
                      {column.title}
                    </span>
                    <Badge className="bg-gray-100 text-gray-800">
                      {columnItems.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {columnItems.map(item => {
                    const isOverdue = isTriageItemOverdue(item);
                    const slaStatus = getTriageItemSlaStatus(item);
                    
                    return (
                      <div
                        key={item.id}
                        className={`triage-item p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleItemClick(item)}
                        onKeyDown={(e) => handleKeyDown(e, item)}
                        tabIndex={0}
                        role="button"
                        aria-label={`${item.title} - ${item.severity} severity, ${item.priority} priority`}
                        title={getSlaTooltip(item)}
                      >
                        {/* Item Header */}
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                            {item.title}
                          </h4>
                          <div className="flex gap-1 ml-2">
                            <Badge 
                              className={`text-xs ${SEVERITY_COLORS[item.severity]}`}
                              title={`Severity: ${item.severity}`}
                            >
                              {item.severity}
                            </Badge>
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>Type: {item.type.replace(/_/g, ' ')}</span>
                            <Badge 
                              className={`text-xs ${PRIORITY_COLORS[item.priority]}`}
                              title={`Priority: ${item.priority}`}
                            >
                              {item.priority}
                            </Badge>
                          </div>
                          
                          <div>Created: {formatDate(item.createdAt)}</div>
                          
                          {item.slaDeadline && (
                            <div className={`text-xs ${
                              slaStatus === 'OVERDUE' ? 'text-red-600 font-medium' :
                              slaStatus === 'WARNING' ? 'text-orange-600 font-medium' :
                              'text-gray-500'
                            }`}>
                              SLA: {formatDate(item.slaDeadline)}
                            </div>
                          )}
                        </div>

                        {/* Item Actions */}
                        {item.href && (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(item.href, '_blank');
                              }}
                              className="text-xs"
                            >
                              View Details
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {columnItems.length === 0 && (
                    <div className="text-center text-gray-500 py-8 text-sm">
                      No items in {column.title.toLowerCase()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Item Details</span>
                <Button
                  variant="outline"
                  onClick={() => setSelectedItem(null)}
                >
                  Close
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{selectedItem.title}</h3>
                <p className="text-gray-600 mb-4">{selectedItem.details}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span>
                  <span className="ml-2">{selectedItem.type.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <span className="ml-2">{selectedItem.status}</span>
                </div>
                <div>
                  <span className="font-medium">Severity:</span>
                  <span className="ml-2">{selectedItem.severity}</span>
                </div>
                <div>
                  <span className="font-medium">Priority:</span>
                  <span className="ml-2">{selectedItem.priority}</span>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <span className="ml-2">{formatDate(selectedItem.createdAt)}</span>
                </div>
                <div>
                  <span className="font-medium">Updated:</span>
                  <span className="ml-2">{formatDate(selectedItem.updatedAt)}</span>
                </div>
              </div>

              {selectedItem.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes:</h4>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                    {selectedItem.notes}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Add Note:</h4>
                <textarea
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  placeholder="Add a note about this item..."
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={handleAnnotationSubmit}
                    disabled={!annotationText.trim()}
                    size="sm"
                  >
                    Add Note
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAnnotationText('')}
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Screen Reader Updates */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
        id="triage-updates"
      >
        {/* This will be updated by JavaScript for screen reader announcements */}
      </div>
    </div>
  );
}
