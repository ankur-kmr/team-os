import { Role } from "@/db/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Role-Based Access Control (RBAC) Utilities
 * Handles permission checking and role management
 */

/**
 * Role hierarchy for permission checking
 * OWNER > ADMIN > MEMBER
 */
const roleHierarchy: Record<Role, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

/**
 * Check if a role has permission to access allowed roles
 * 
 * @param userRole - The user's current role
 * @param allowedRoles - Array of roles that are allowed
 * @returns true if user has access
 * 
 * @example
 * // Check if user is OWNER or ADMIN
 * if (hasAccess(member.role, ["OWNER", "ADMIN"])) {
 *   // Allow action
 * }
 */
export function hasAccess(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Check if a user can perform an action on another user
 * Based on role hierarchy: OWNER > ADMIN > MEMBER
 * 
 * @param actorRole - The role of the person performing the action
 * @param targetRole - The role of the person being acted upon
 * @returns true if actor can perform action on target
 * 
 * @example
 * // ADMIN can manage MEMBER, but not another ADMIN or OWNER
 * canManageRole("ADMIN", "MEMBER")  // true
 * canManageRole("ADMIN", "ADMIN")   // false
 * canManageRole("ADMIN", "OWNER")   // false
 */
export function canManageRole(actorRole: Role, targetRole: Role): boolean {
  return roleHierarchy[actorRole] > roleHierarchy[targetRole];
}

/**
 * Prevent owner lockout - at least one owner must remain
 * Should be used before removing a member with OWNER role
 * 
 * @param memberId - ID of the member to potentially remove
 * @param organizationId - ID of the organization
 * @param prisma - Prisma client instance
 * @returns true if member can be removed safely
 * 
 * @example
 * const canRemove = await canRemoveMember(memberId, orgId, prisma)
 * if (!canRemove) {
 *   return { error: "Cannot remove the last owner" }
 * }
 */
export async function canRemoveMember(
  memberId: string,
  organizationId: string,
  prismaClient: typeof prisma
): Promise<boolean> {
  const member = await prismaClient.member.findUnique({
    where: { id: memberId },
  });

  if (!member || member.role !== "OWNER") {
    return true; // Can remove non-owners freely
  }

  // Check if this is the last owner
  const ownerCount = await prismaClient.member.count({
    where: {
      organizationId,
      role: "OWNER",
    },
  });

  return ownerCount > 1; // Can only remove if there's another owner
}

/**
 * Get display name for a role
 * 
 * @param role - The role enum value
 * @returns Human-readable role name
 * 
 * @example
 * getRoleDisplayName("OWNER")  // "Owner"
 * getRoleDisplayName("ADMIN")  // "Administrator"
 */
export function getRoleDisplayName(role: Role): string {
  const displayNames: Record<Role, string> = {
    OWNER: "Owner",
    ADMIN: "Administrator",
    MEMBER: "Member",
  };
  return displayNames[role];
}

/**
 * Get permissions for a given role
 * Lists what actions a role can perform
 * 
 * @param role - The role enum value
 * @returns Array of permission strings
 * 
 * @example
 * const perms = getPermissions("ADMIN")
 * // ["manage_members", "manage_projects", "manage_settings", "view_audit_logs"]
 */
export function getPermissions(role: Role): string[] {
  const permissions: Record<Role, string[]> = {
    OWNER: [
      "manage_members",
      "manage_projects",
      "manage_settings",
      "manage_billing",
      "delete_organization",
      "view_audit_logs",
      "manage_feature_flags",
    ],
    ADMIN: [
      "manage_members",
      "manage_projects",
      "manage_settings",
      "view_audit_logs",
    ],
    MEMBER: [
      "create_projects",
      "manage_own_tasks",
      "view_organization",
      "add_comments",
    ],
  };
  return permissions[role];
}

/**
 * Check if a role has a specific permission
 * 
 * @param role - The role enum value
 * @param permission - The permission to check
 * @returns true if role has the permission
 * 
 * @example
 * if (hasPermission(member.role, "manage_billing")) {
 *   // Show billing page
 * }
 */
export function hasPermission(role: Role, permission: string): boolean {
  const permissions = getPermissions(role);
  return permissions.includes(permission);
}

/**
 * Get all roles that can be assigned by a given role
 * Based on hierarchy - you can only assign roles lower than yours
 * 
 * @param actorRole - The role of the person assigning
 * @returns Array of roles that can be assigned
 * 
 * @example
 * getAssignableRoles("ADMIN")  // ["MEMBER"]
 * getAssignableRoles("OWNER")  // ["ADMIN", "MEMBER"]
 */
export function getAssignableRoles(actorRole: Role): Role[] {
  const allRoles: Role[] = ["OWNER", "ADMIN", "MEMBER"];
  
  return allRoles.filter((role) => canManageRole(actorRole, role));
}
