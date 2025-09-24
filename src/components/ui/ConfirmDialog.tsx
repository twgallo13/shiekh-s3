"use client";
import React from "react";
import { Button } from "@/components/ui/Button";

export default function ConfirmDialog({
  open, title, message, confirmText = "Confirm", cancelText = "Cancel",
  onConfirm, onCancel,
}: {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-lg border bg-white p-4 shadow-lg">
        <h3 className="text-base font-semibold mb-2">{title}</h3>
        <div className="text-sm mb-4">{message}</div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>{cancelText}</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}
