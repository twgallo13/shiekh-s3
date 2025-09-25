/**
 * Development-only role simulation utility
 * Allows QA to test different roles without changing server-side authentication
 * NO-OP in production - preserves strict authority model
 */

const SIM_ROLE_KEY = "dev:simRole";

/**
 * Available roles for simulation
 */
export const SIMULATABLE_ROLES = [
  "ADMIN",
  "FM", 
  "WHS",
  "DM",
  "SM", 
  "AM",
  "COST_ANALYST"
] as const;

export type SimulatableRole = typeof SIMULATABLE_ROLES[number];

/**
 * Get the current simulated role (development only)
 * Returns null if not in development or no role is set
 */
export function getSimRole(): SimulatableRole | null {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  try {
    const stored = localStorage.getItem(SIM_ROLE_KEY);
    if (stored && SIMULATABLE_ROLES.includes(stored as SimulatableRole)) {
      return stored as SimulatableRole;
    }
  } catch {
    // Silently fail if localStorage is not available
  }

  return null;
}

/**
 * Set the simulated role (development only)
 * NO-OP in production
 */
export function setSimRole(role: SimulatableRole | null): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  try {
    if (role === null) {
      localStorage.removeItem(SIM_ROLE_KEY);
    } else {
      localStorage.setItem(SIM_ROLE_KEY, role);
    }
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Get the effective role for UI display
 * In development: returns simulated role if set, otherwise real role
 * In production: always returns real role
 */
export function getEffectiveRole(realRole: string): string {
  if (process.env.NODE_ENV !== "development") {
    return realRole;
  }

  const simRole = getSimRole();
  return simRole || realRole;
}

/**
 * Check if role simulation is active
 */
export function isRoleSimulationActive(): boolean {
  return process.env.NODE_ENV === "development" && getSimRole() !== null;
}

/**
 * Get the real role from cookie (unchanged)
 */
export function getRealRole(): string {
  if (typeof document === "undefined") return "ANON";
  const match = document.cookie.match(/(?:^|;\s*)x-role=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "ANON";
}
