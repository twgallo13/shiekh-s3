/**
 * Command registry for the global command palette
 * RBAC-aware command definitions with navigation and actions
 */

export interface Command {
  id: string;
  label: string;
  type: "nav" | "action" | "preset";
  path?: string;
  hotkey?: string;
  rbacRoles?: string[];
  description?: string;
  category?: string;
  action?: () => void;
}

/**
 * Get all available commands for a given role
 * Filters commands based on RBAC permissions
 */
export function getCommands(role: string): Command[] {
  const allCommands: Command[] = [
    // Navigation commands
    {
      id: "nav-dashboard",
      label: "Dashboard",
      type: "nav",
      path: "/",
      rbacRoles: ["ANON", "USER", "ADMIN", "FM", "VIEWER"],
      description: "Go to main dashboard"
    },
    {
      id: "nav-products",
      label: "Products",
      type: "nav",
      path: "/products",
      rbacRoles: ["USER", "ADMIN", "FM", "VIEWER"],
      description: "View products catalog"
    },
    {
      id: "nav-orders",
      label: "Orders",
      type: "nav",
      path: "/orders",
      rbacRoles: ["USER", "ADMIN", "FM", "VIEWER"],
      description: "View orders management"
    },
    {
      id: "nav-approvals",
      label: "Approvals",
      type: "nav",
      path: "/approvals",
      rbacRoles: ["ADMIN", "FM"],
      description: "Manage approvals and requests"
    },
    {
      id: "nav-variances",
      label: "Variances",
      type: "nav",
      path: "/variances",
      rbacRoles: ["ADMIN", "FM", "VIEWER"],
      description: "View variance reports"
    },
    {
      id: "nav-changelog",
      label: "Changelog",
      type: "nav",
      path: "/changelog",
      rbacRoles: ["ANON", "USER", "ADMIN", "FM", "VIEWER"],
      description: "View application changelog"
    },
    
    // Action commands
    {
      id: "action-refresh",
      label: "Refresh",
      type: "action",
      hotkey: "R",
      rbacRoles: ["ANON", "USER", "ADMIN", "FM", "VIEWER"],
      description: "Refresh dashboard data"
    },
    {
      id: "action-export",
      label: "Export",
      type: "action",
      hotkey: "E",
      rbacRoles: ["USER", "ADMIN", "FM", "VIEWER"],
      description: "Export current view to JSON/CSV"
    },
    {
      id: "action-fullscreen",
      label: "Fullscreen",
      type: "action",
      hotkey: "F",
      rbacRoles: ["ANON", "USER", "ADMIN", "FM", "VIEWER"],
      description: "Toggle fullscreen mode"
    },
    {
      id: "action-clear-filters",
      label: "Clear filters",
      type: "action",
      hotkey: "C",
      rbacRoles: ["USER", "ADMIN", "FM", "VIEWER"],
      description: "Clear all filters and search terms"
    },
    {
      id: "action-print",
      label: "Print",
      type: "action",
      hotkey: "P",
      rbacRoles: ["ANON", "USER", "ADMIN", "FM", "VIEWER"],
      description: "Print current page"
    },
    {
      id: "action-toggle-theme",
      label: "Toggle theme",
      type: "action",
      rbacRoles: ["ANON", "USER", "ADMIN", "FM", "VIEWER"],
      description: "Switch between light and dark themes"
    },
    {
      id: "action-start-tour",
      label: "Start tour",
      type: "action",
      rbacRoles: ["ANON", "USER", "ADMIN", "FM", "VIEWER"],
      description: "Start the demo tour"
    },
    {
      id: "action-shortcuts",
      label: "Keyboard shortcuts",
      type: "action",
      rbacRoles: ["ANON", "USER", "ADMIN", "FM", "VIEWER"],
      description: "View keyboard shortcuts help"
    },
    {
      id: "action-about",
      label: "About",
      type: "action",
      rbacRoles: ["ANON", "USER", "ADMIN", "FM", "VIEWER"],
      description: "View application information"
    }
  ];

  // Filter commands based on user role
  return allCommands.filter(command => 
    command.rbacRoles.includes(role)
  );
}

/**
 * Simple fuzzy search implementation
 * Matches commands based on label and description
 */
export function searchCommands(commands: Command[], query: string): Command[] {
  if (!query.trim()) return commands;
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return commands.filter(command => {
    const label = command.label.toLowerCase();
    const description = command.description?.toLowerCase() || "";
    const hotkey = command.hotkey?.toLowerCase() || "";
    
    return (
      label.includes(normalizedQuery) ||
      description.includes(normalizedQuery) ||
      hotkey.includes(normalizedQuery) ||
      // Fuzzy match: check if all query characters appear in order
      fuzzyMatch(label, normalizedQuery) ||
      fuzzyMatch(description, normalizedQuery)
    );
  });
}

/**
 * Simple fuzzy matching algorithm
 * Checks if all characters in query appear in order in the text
 */
function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  if (!text) return false;
  
  let queryIndex = 0;
  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      queryIndex++;
    }
  }
  
  return queryIndex === query.length;
}

/**
 * Get user role from cookie
 */
export function getUserRole(): string {
  if (typeof document === "undefined") return "ANON";
  const match = document.cookie.match(/(?:^|;\s*)x-role=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "ANON";
}
