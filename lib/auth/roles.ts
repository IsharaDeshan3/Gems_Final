/**
 * Role checking utilities
 * Supports both lowercase (old schema) and capitalized (current schema) role names
 */

export type UserRole = 
  | 'Admin' | 'Moderator' | 'User'
  | 'superadmin' | 'admin' | 'moderator' | 'user';

const LEGACY_SUPER_ADMIN_ROLES = new Set(['superadmin']);
const ADMIN_ROLES = new Set(['admin', 'Admin', 'moderator', 'Moderator']);
const HIGH_ADMIN_ROLES = new Set(['admin', 'Admin']);

function normalizeRoleName(role: string): string {
  return role.trim().toLowerCase();
}
/**
 * Check if a user has admin privileges
 */
export function isAdmin(role: string): boolean {
  const normalized = normalizeRoleName(role);
  return ADMIN_ROLES.has(role) || LEGACY_SUPER_ADMIN_ROLES.has(role) || ADMIN_ROLES.has(normalized);
}

/**
 * Check if a user has super admin privileges
 */
export function isSuperAdmin(role: string): boolean {
  return LEGACY_SUPER_ADMIN_ROLES.has(role) || normalizeRoleName(role) === 'superadmin';
}

/**
 * Check if a user can perform admin actions (admin only, not moderator)
 */
export function canManageContent(role: string): boolean {
  const normalized = normalizeRoleName(role);
  return HIGH_ADMIN_ROLES.has(role) || HIGH_ADMIN_ROLES.has(normalized) || LEGACY_SUPER_ADMIN_ROLES.has(role);
}

/**
 * Normalize role name to capitalized format (current schema)
 */
export function normalizeRole(role: string): UserRole {
  const normalized = normalizeRoleName(role);

  if (normalized === 'superadmin' || normalized === 'admin') {
    return 'Admin';
  }

  if (normalized === 'moderator') {
    return 'Moderator';
  }

  if (normalized === 'user') {
    return 'User';
  }

  return 'User';
}
