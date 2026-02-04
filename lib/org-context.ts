import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

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
  const orgId = cookies().get("orgId")?.value
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
export async function getUserOrganizations(userId: string) {
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
  // Verify user has access to this org
  const hasAccess = await verifyOrgAccess(orgId, userId)
  
  if (!hasAccess) {
    throw new Error("User does not have access to this organization")
  }

  // Set cookie
  cookies().set("orgId", orgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return { success: true }
}
