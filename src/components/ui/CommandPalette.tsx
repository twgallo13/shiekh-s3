"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCommands, searchCommands, getUserRole, Command } from "@/lib/search/registry";
import { getPresetsForCurrentContext, FilterPreset } from "@/lib/filters/presets";
import { useRole } from "@/components/providers/RoleProvider";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  route?: string;
  onApplyPreset?: (preset: FilterPreset) => void;
}

export default function CommandPalette({ open, onClose, route, onApplyPreset }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commands, setCommands] = useState<Command[]>([]);
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const router = useRouter();
  const { effectiveRole } = useRole();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load commands based on user role
  useEffect(() => {
    const role = getUserRole();
    const availableCommands = getCommands(role);
    setCommands(availableCommands);
    setFilteredCommands(availableCommands);
  }, []);

  // Load presets for current route and role
  useEffect(() => {
    if (route && onApplyPreset) {
      const currentPresets = getPresetsForCurrentContext(route, effectiveRole);
      setPresets(currentPresets);
    }
  }, [route, effectiveRole, onApplyPreset]);

  // Filter commands and presets based on search query
  useEffect(() => {
    const filtered = searchCommands(commands, query);
    
    // Add preset commands if route and onApplyPreset are provided
    if (route && onApplyPreset && presets.length > 0) {
      const presetCommands: Command[] = presets
        .filter(preset => 
          !query || 
          preset.name.toLowerCase().includes(query.toLowerCase()) ||
          Object.entries(preset.params).some(([key, value]) => 
            key.toLowerCase().includes(query.toLowerCase()) ||
            String(value).toLowerCase().includes(query.toLowerCase())
          )
        )
        .map(preset => ({
          id: `preset-${preset.name}`,
          label: preset.name,
          description: `Apply saved view: ${Object.entries(preset.params).map(([k, v]) => `${k}=${v}`).join(', ') || 'No filters'}`,
          type: 'preset' as const,
          category: 'Saved Views (This Page)',
          action: () => onApplyPreset(preset)
        }));
      
      setFilteredCommands([...filtered, ...presetCommands]);
    } else {
      setFilteredCommands(filtered);
    }
    
    setSelectedIndex(0);
  }, [query, commands, presets, route, onApplyPreset]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  }, [open, filteredCommands, selectedIndex, onClose]);

  // Execute command
  const executeCommand = (command: Command) => {
    if (command.type === "nav" && command.path) {
      router.push(command.path);
      onClose();
    } else if (command.type === "action") {
      // Dispatch custom event for actions
      const event = new CustomEvent("command-palette-action", {
        detail: { commandId: command.id }
      });
      window.dispatchEvent(event);
      onClose();
    } else if (command.type === "preset" && command.action) {
      // Execute preset action
      command.action();
      onClose();
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle command click
  const handleCommandClick = (command: Command) => {
    executeCommand(command);
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth"
        });
      }
    }
  }, [selectedIndex]);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      role="dialog"
      aria-labelledby="command-palette-title"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl border">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span id="command-palette-title">Command Palette</span>
          </div>
        </div>

        {/* Search Input */}
        <div className="px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search commands..."
            className="w-full px-3 py-2 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search commands"
          />
        </div>

        {/* Commands List */}
        <div 
          ref={listRef}
          className="max-h-96 overflow-y-auto border-t"
          role="listbox"
          aria-label="Available commands"
        >
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No commands found
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <div
                key={command.id}
                className={`px-4 py-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                  index === selectedIndex 
                    ? "bg-blue-50 border-blue-200" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleCommandClick(command)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      command.type === "nav" ? "bg-green-500" : 
                      command.type === "preset" ? "bg-purple-500" : "bg-blue-500"
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900">
                        {command.label}
                      </div>
                      {command.description && (
                        <div className="text-sm text-gray-500">
                          {command.description}
                        </div>
                      )}
                      {command.category && (
                        <div className="text-xs text-gray-400 mt-1">
                          {command.category}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {command.hotkey && (
                      <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                        {command.hotkey}
                      </kbd>
                    )}
                    <div className="text-xs text-gray-400 uppercase">
                      {command.type}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 text-xs text-gray-500 border-t bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Execute</span>
              <span>Esc Close</span>
            </div>
            <span>{filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
