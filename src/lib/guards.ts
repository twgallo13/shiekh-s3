// Role-based access control guards
export enum Role {
  ADMIN = 'ADMIN',
  FM = 'FM',
  WHS = 'WHS',
  DM = 'DM',
  SM = 'SM',
  AM = 'AM',
  COST_ANALYST = 'COST_ANALYST',
  AI_AGENT = 'AI_AGENT',
}

export function requireRole(allowedRoles: Role[]): (role: Role) => boolean {
  return (userRole: Role) => {
    return allowedRoles.includes(userRole);
  };
}

export function hasPermission(userRole: Role, action: string): boolean {
  // Basic permission matrix - will be expanded based on structure.md
  const permissions: Record<Role, string[]> = {
    [Role.ADMIN]: ['*'], // Admin can do everything
    [Role.FM]: ['read', 'write', 'approve', 'override'],
    [Role.WHS]: ['read', 'write', 'execute'],
    [Role.DM]: ['read', 'approve'],
    [Role.SM]: ['read', 'receive'],
    [Role.AM]: ['read', 'receive'],
    [Role.COST_ANALYST]: ['read'],
    [Role.AI_AGENT]: ['read', 'generate'],
  };

  const userPermissions = permissions[userRole] || [];
  return userPermissions.includes('*') || userPermissions.includes(action);
}

export function canAccessRoute(userRole: Role, route: string): boolean {
  // Basic route access control - will be enhanced with structure.md
  const routePermissions: Record<string, Role[]> = {
    '/': [Role.ADMIN, Role.FM, Role.WHS, Role.DM, Role.SM, Role.AM, Role.COST_ANALYST, Role.AI_AGENT],
    '/settings': [Role.ADMIN, Role.FM, Role.WHS, Role.DM, Role.SM, Role.AM, Role.COST_ANALYST, Role.AI_AGENT],
    '/changelog': [Role.ADMIN, Role.FM, Role.WHS, Role.DM, Role.SM, Role.AM, Role.COST_ANALYST, Role.AI_AGENT],
    '/admin': [Role.ADMIN],
    '/warehouse': [Role.ADMIN, Role.FM, Role.WHS],
    '/finance': [Role.ADMIN, Role.FM, Role.COST_ANALYST],
  };

  const allowedRoles = routePermissions[route] || [];
  return allowedRoles.includes(userRole);
}
