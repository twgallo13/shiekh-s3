"use client";
import React, { useState, useEffect } from "react";
import { getSimRole, setSimRole, SIMULATABLE_ROLES, isRoleSimulationActive } from "@/lib/dev/roleSim";

export default function RoleSimSwitcher() {
  const [currentSimRole, setCurrentSimRole] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  useEffect(() => {
    const simRole = getSimRole();
    setCurrentSimRole(simRole);
    setIsActive(isRoleSimulationActive());
  }, []);

  const handleRoleChange = (role: string) => {
    if (role === "none") {
      setSimRole(null);
      setCurrentSimRole(null);
      setIsActive(false);
    } else {
      setSimRole(role as any);
      setCurrentSimRole(role);
      setIsActive(true);
    }

    // Emit event to trigger re-render of components that use role
    window.dispatchEvent(new CustomEvent("role-simulation-changed", {
      detail: { role: role === "none" ? null : role }
    }));
  };

  return (
    <div className="flex items-center gap-2">
      {/* Simulation indicator */}
      {isActive && (
        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 border border-yellow-300 rounded">
          Simulating: {currentSimRole}
        </span>
      )}
      
      {/* Role switcher dropdown */}
      <select
        value={currentSimRole || "none"}
        onChange={(e) => handleRoleChange(e.target.value)}
        className="px-2 py-1 text-xs border rounded bg-white"
        title="Simulate role (dev only)"
      >
        <option value="none">Real Role</option>
        {SIMULATABLE_ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>
  );
}
