"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Organization, Role } from "@/db/generated/prisma/client"
import { hasAccess } from "@/lib/rbac"

/**
 * Organization Context Utilities
 * 
 * These functions help manage the "tenant context" - which organization
 * the user is currently working in. This is critical for multi-tenant SaaS.
 * 
 * The orgId is stored in a cookie and used to scope all database queries.
 */

/**
 * Get the current organization ID from cookie
 * Returns null if no org is selected
 */
export async function getCurrentOrgId(): Promise<string | null> {
  const orgId = (await cookies()).get("orgId")?.value
  return orgId || null
}

/**
 * Get the current organization with full details
 * Throws error if no org is selected or user doesn't have access
 */
export async function requireOrganization() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized: No session found")
  }

  const orgId = await getCurrentOrgId()
  if (!orgId) {
    throw new Error("No organization selected")
  }

  // Verify user is a member of this organization
  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId: orgId,
    },
    include: {
      organization: true,
    },
  })

  if (!member) {
    throw new Error("User is not a member of this organization")
  }

  return {
    organization: member.organization,
    member,
    userId: session.user.id,
  }
}

/**
 * Get organization context with user's role
 * Useful for pages that need to check permissions
 */
export async function getOrganizationContext() {
  try {
    return await requireOrganization()
  } catch (error) {
    return null
  }
}

/**
 * Verify user has access to a specific organization
 * Used in server actions to validate tenant isolation
 */
export async function verifyOrgAccess(orgId: string, userId: string): Promise<boolean> {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      organizationId: orgId,
    },
  })

  return !!member
}

/**
 * Get all organizations the user belongs to
 * Used in onboarding and org switcher
 */
export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  const memberships = await prisma.member.findMany({
    where: { userId },
    include: {
      organization: true,
    },
    orderBy: {
      organization: {
        createdAt: "desc",
      },
    },
  })

  return memberships.map(m => ({
    ...m.organization,
    role: m.role,
  }))
}

/**
 * Switch to a different organization
 * Sets the orgId cookie
 */
export async function switchOrganization(orgId: string, userId: string) {
  console.log("Switching to organization:", orgId, userId)
  // Verify user has access to this org
  const hasOrgAccess = await verifyOrgAccess(orgId, userId)
  
  if (!hasOrgAccess) {
    throw new Error("User does not have access to this organization")
  }

  // Set cookie
  (await cookies()).set("orgId", orgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return { success: true }
}

/**
 * RBAC Enhanced Helpers
 * These combine org context + role checking for server actions
 */

/**
 * Get organization context with full member data and role
 * Use this in server actions that need to check permissions
 * 
 * @returns Object with session, orgId, member (with role), and organization
 * @throws Error if user is not authenticated or not a member
 * 
 * @example
 * export async function createProject(name: string) {
 *   const { orgId, member } = await getOrgContext()
 *   
 *   if (!hasAccess(member.role, ["OWNER", "ADMIN"])) {
 *     throw new Error("Insufficient permissions")
 *   }
 *   
 *   return await prisma.project.create({
 *     data: { name, organizationId: orgId }
 *   })
 * }
 */
export async function getOrgContext() {
  const session = await auth()
  const orgId = (await cookies()).get("orgId")?.value
  
  if (!session?.user?.id || !orgId) {
    throw new Error("Unauthorized: No session or organization selected")
  }
  
  // Get user's membership with organization data
  const member = await prisma.member.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: orgId,
      },
    },
    include: { 
      organization: true,
      user: true,
    },
  })

  if (!member) {
    throw new Error("User is not a member of this organization")
  }
  
  return { 
    session, 
    orgId, 
    member, 
    organization: member.organization,
    role: member.role,
    userId: session.user.id,
  }
}

/**
 * Require specific role(s) to proceed
 * Throws error if user doesn't have required permissions
 * 
 * @param allowedRoles - Array of roles that are allowed to proceed
 * @returns Organization context if user has access
 * @throws Error if user doesn't have required role
 * 
 * @example
 * export async function deleteProject(projectId: string) {
 *   // Only OWNER and ADMIN can delete projects
 *   const { orgId } = await requireRole(["OWNER", "ADMIN"])
 *   
 *   return await prisma.project.delete({
 *     where: { id: projectId, organizationId: orgId }
 *   })
 * }
 */
export async function requireRole(allowedRoles: Role[]) {
  const context = await getOrgContext()
  
  if (!hasAccess(context.role, allowedRoles)) {
    throw new Error(
      `Insufficient permissions. Required: ${allowedRoles.join(" or ")}. Current: ${context.role}`
    )
  }
  
  return context
}

/**
 * Lightweight auth check - just verify user is authenticated with an org
 * Use this when you don't need role checking, just tenant scoping
 * 
 * @returns Object with userId and orgId
 * @throws Error if not authenticated
 * 
 * @example
 * export async function getProjects() {
 *   const { orgId } = await requireAuth()
 *   
 *   return await prisma.project.findMany({
 *     where: { organizationId: orgId }
 *   })
 * }
 */
export async function requireAuth() {
  const session = await auth()
  const orgId = (await cookies()).get("orgId")?.value

  if (!session?.user?.id || !orgId) {
    throw new Error("Unauthorized")
  }

  return { userId: session.user.id, orgId }
}
