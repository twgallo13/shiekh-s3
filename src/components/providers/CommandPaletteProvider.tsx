"use client";
import React, { useState, useEffect } from "react";
import CommandPalette from "@/components/ui/CommandPalette";

export default function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle command palette actions
  useEffect(() => {
    const handleCommandAction = (e: CustomEvent) => {
      const { commandId } = e.detail;
      
      // Map command IDs to actions
      switch (commandId) {
        case 'action-refresh':
          // Trigger refresh by dispatching a custom event
          window.dispatchEvent(new CustomEvent('dashboard-refresh'));
          break;
        case 'action-export':
          // Trigger export
          window.dispatchEvent(new CustomEvent('dashboard-export'));
          break;
        case 'action-fullscreen':
          // Toggle fullscreen
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
          break;
        case 'action-clear-filters':
          // Clear filters
          window.dispatchEvent(new CustomEvent('dashboard-clear-filters'));
          break;
        case 'action-print':
          // Print page
          window.print();
          break;
        case 'action-toggle-theme':
          // Toggle theme
          window.dispatchEvent(new CustomEvent('dashboard-toggle-theme'));
          break;
        case 'action-start-tour':
          // Start tour
          localStorage.removeItem('tourSeen');
          window.location.reload();
          break;
        case 'action-shortcuts':
          // Open shortcuts modal
          window.dispatchEvent(new CustomEvent('dashboard-open-shortcuts'));
          break;
        case 'action-about':
          // Open about modal
          window.dispatchEvent(new CustomEvent('dashboard-open-about'));
          break;
      }
    };

    window.addEventListener('command-palette-action', handleCommandAction as EventListener);
    return () => window.removeEventListener('command-palette-action', handleCommandAction as EventListener);
  }, []);

  return (
    <>
      {children}
      <CommandPalette open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
