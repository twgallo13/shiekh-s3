"use client";
import React, { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { APP_VERSION } from "@/app/version";

function getRoleFromCookie(): string {
  if (typeof document === "undefined") return "ANON";
  const m = document.cookie.match(/(?:^|;\s*)x-role=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "ANON";
}

export default function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [role, setRole] = useState("ANON");
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    setRole(getRoleFromCookie());
    setTheme(document.body.classList.contains("dark") ? "dark" : "light");
  }, [open]);
  return (
    <Modal open={open} onClose={onClose} title="About">
      <div className="text-sm space-y-2">
        <div><b>Version:</b> {APP_VERSION}</div>
        <div><b>Role (cookie):</b> {role}</div>
        <div><b>Theme:</b> {theme}</div>
        <div className="pt-2 text-xs text-gray-600">
          This app uses an in-process domain events bus (audited), demo approvals/forecast/replenishment flows, dev monitor, and export tools.
        </div>
      </div>
    </Modal>
  );
}
