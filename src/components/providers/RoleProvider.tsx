"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getEffectiveRole, getRealRole } from "@/lib/dev/roleSim";

interface RoleContextType {
  effectiveRole: string;
  realRole: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

export default function RoleProvider({ children }: { children: React.ReactNode }) {
  const [realRole, setRealRole] = useState<string>("ANON");
  const [effectiveRole, setEffectiveRole] = useState<string>("ANON");

  // Get real role from cookie
  useEffect(() => {
    const updateRole = () => {
      const role = getRealRole();
      setRealRole(role);
      setEffectiveRole(getEffectiveRole(role));
    };

    // Initial load
    updateRole();

    // Listen for role simulation changes
    const handleRoleSimulationChange = () => {
      updateRole();
    };

    window.addEventListener("role-simulation-changed", handleRoleSimulationChange);
    
    return () => {
      window.removeEventListener("role-simulation-changed", handleRoleSimulationChange);
    };
  }, []);

  return (
    <RoleContext.Provider value={{ effectiveRole, realRole }}>
      {children}
    </RoleContext.Provider>
  );
}
