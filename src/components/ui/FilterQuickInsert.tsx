"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useRole } from "@/components/providers/RoleProvider";
import { 
  getPresetsForCurrentContext, 
  savePreset, 
  deletePreset, 
  renamePreset, 
  createPreset, 
  validatePresetName,
  FilterPreset 
} from "@/lib/filters/presets";

interface FilterQuickInsertProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: Record<string, string | number | boolean>;
  onApplyPreset: (preset: FilterPreset) => void;
  route: string;
}

/**
 * Filter Quick Insert Component
 * Small popover for saving and managing filter presets
 * A11y per §14.1 (labels, roles, focus mgmt)
 */
export default function FilterQuickInsert({
  isOpen,
  onClose,
  currentFilters,
  onApplyPreset,
  route
}: FilterQuickInsertProps) {
  const { effectiveRole } = useRole();
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'save' | 'manage'>('save');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load presets when component opens
  useEffect(() => {
    if (isOpen) {
      loadPresets();
    }
  }, [isOpen, route, effectiveRole]);

  // Focus management
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, activeTab]);

  // Focus edit input when editing
  useEffect(() => {
    if (editingPreset && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingPreset]);

  // Keyboard navigation
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

  const loadPresets = () => {
    const currentPresets = getPresetsForCurrentContext(route, effectiveRole);
    setPresets(currentPresets);
  };

  const handleSavePreset = () => {
    setError(null);
    
    const validation = validatePresetName(newPresetName);
    if (!validation.valid) {
      setError(validation.error || 'Invalid preset name');
      return;
    }

    // Check if name already exists
    const existing = presets.find(p => p.name.toLowerCase() === newPresetName.toLowerCase());
    if (existing) {
      setError('A preset with this name already exists');
      return;
    }

    const preset = createPreset(newPresetName, currentFilters);
    savePreset(route, effectiveRole, preset);
    
    setNewPresetName("");
    loadPresets();
    setActiveTab('manage');
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    onApplyPreset(preset);
    onClose();
  };

  const handleDeletePreset = (presetName: string) => {
    if (confirm(`Are you sure you want to delete the preset "${presetName}"?`)) {
      deletePreset(route, effectiveRole, presetName);
      loadPresets();
    }
  };

  const handleStartRename = (preset: FilterPreset) => {
    setEditingPreset(preset.name);
    setEditingName(preset.name);
  };

  const handleFinishRename = () => {
    if (!editingPreset) return;

    const validation = validatePresetName(editingName);
    if (!validation.valid) {
      setError(validation.error || 'Invalid preset name');
      return;
    }

    // Check if new name already exists (excluding current preset)
    const existing = presets.find(p => 
      p.name.toLowerCase() === editingName.toLowerCase() && 
      p.name !== editingPreset
    );
    if (existing) {
      setError('A preset with this name already exists');
      return;
    }

    const success = renamePreset(route, effectiveRole, editingPreset, editingName);
    if (success) {
      setEditingPreset(null);
      setEditingName("");
      setError(null);
      loadPresets();
    } else {
      setError('Failed to rename preset');
    }
  };

  const handleCancelRename = () => {
    setEditingPreset(null);
    setEditingName("");
    setError(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={containerRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
        role="dialog"
        aria-labelledby="filter-quick-insert-title"
        aria-describedby="filter-quick-insert-description"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle id="filter-quick-insert-title" className="text-lg">
              Saved Views
            </CardTitle>
            <p id="filter-quick-insert-description" className="text-sm text-gray-600">
              Save and manage filter presets for quick access
            </p>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab('save')}
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'save'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                aria-selected={activeTab === 'save'}
                role="tab"
              >
                Save Current
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                aria-selected={activeTab === 'manage'}
                role="tab"
              >
                Manage ({presets.length})
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            {/* Save Tab */}
            {activeTab === 'save' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="preset-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Preset Name
                  </label>
                  <input
                    ref={inputRef}
                    id="preset-name"
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSavePreset();
                      }
                    }}
                    placeholder="Enter preset name..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-describedby="preset-name-help"
                  />
                  <p id="preset-name-help" className="text-xs text-gray-500 mt-1">
                    Letters, numbers, spaces, hyphens, and underscores only
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-gray-700 mb-2">Current Filters:</p>
                  <div className="space-y-1">
                    {Object.entries(currentFilters).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-mono text-gray-800">{String(value)}</span>
                      </div>
                    ))}
                    {Object.keys(currentFilters).length === 0 && (
                      <p className="text-gray-500 italic">No filters applied</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSavePreset}
                    disabled={!newPresetName.trim()}
                    className="flex-1"
                  >
                    Save Preset
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Manage Tab */}
            {activeTab === 'manage' && (
              <div className="space-y-3">
                {presets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No saved presets yet.</p>
                    <p className="text-sm">Switch to "Save Current" to create your first preset.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {presets.map((preset) => (
                      <div
                        key={preset.name}
                        className="border border-gray-200 rounded p-3 hover:bg-gray-50"
                      >
                        {editingPreset === preset.name ? (
                          <div className="space-y-2">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleFinishRename();
                                } else if (e.key === 'Escape') {
                                  handleCancelRename();
                                }
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={handleFinishRename}
                                disabled={!editingName.trim()}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelRename}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{preset.name}</h4>
                              <span className="text-xs text-gray-500">
                                {formatDate(preset.createdAt)}
                              </span>
                            </div>
                            
                            <div className="text-xs text-gray-600 mb-3">
                              {Object.entries(preset.params).map(([key, value]) => (
                                <span key={key} className="inline-block mr-2">
                                  {key}: <span className="font-mono">{String(value)}</span>
                                </span>
                              ))}
                              {Object.keys(preset.params).length === 0 && (
                                <span className="italic">No filters</span>
                              )}
                            </div>

                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => handleApplyPreset(preset)}
                                className="flex-1"
                              >
                                Apply
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartRename(preset)}
                              >
                                Rename
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletePreset(preset.name)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <Button variant="outline" onClick={onClose} className="w-full">
                    Close
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Hook for managing FilterQuickInsert state
 */
export function useFilterQuickInsert(
  currentFilters: Record<string, string | number | boolean>,
  onApplyPreset: (preset: FilterPreset) => void,
  route: string
) {
  const [isOpen, setIsOpen] = useState(false);

  const openQuickInsert = () => setIsOpen(true);
  const closeQuickInsert = () => setIsOpen(false);

  // Keyboard shortcut: Alt+Shift+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        openQuickInsert();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    openQuickInsert,
    closeQuickInsert,
    FilterQuickInsertComponent: (
      <FilterQuickInsert
        isOpen={isOpen}
        onClose={closeQuickInsert}
        currentFilters={currentFilters}
        onApplyPreset={onApplyPreset}
        route={route}
      />
    )
  };
}
