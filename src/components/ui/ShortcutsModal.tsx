"use client";
import React from "react";
import Modal from "@/components/ui/Modal";

const shortcuts = [
  { key: "R", description: "Refresh" },
  { key: "E", description: "Export" },
  { key: "F", description: "Fullscreen" },
  { key: "C", description: "Clear filters" },
  { key: "P", description: "Print" },
  { key: "G", description: "Go to Approvals" },
  { key: "D", description: "Dashboard" },
];

export default function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-3">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.key} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{shortcut.description}</span>
            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Press any of these keys to quickly access dashboard features.
        </p>
      </div>
    </Modal>
  );
}
