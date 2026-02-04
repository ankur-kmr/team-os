"use server"

import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { hasAccess } from "@/lib/rbac"
import { slugify } from "@/lib/utils"
import { cookies } from "next/headers"
import { Member, Organization } from "@/db/generated/prisma/client"

/**
 * Organization Actions
 * Handle organization CRUD operations
 */

/**
 * Create a new organization
 */
export async function createOrganization(
  userId: string,
  name: string,
  slugInput: string
) {
  try {
    // Validate inputs
    if (!name || name.trim().length === 0) {
      return { error: "Organization name is required" }
    }

    if (!slugInput || slugInput.trim().length === 0) {
      return { error: "Organization slug is required" }
    }

    const slug = slugify(slugInput)

    if (slug.length < 3) {
      return { error: "Slug must be at least 3 characters" }
    }

    // Check if slug already exists
    const existing = await prisma.organization.findUnique({
      where: { slug },
    })

    if (existing) {
      return { error: "This slug is already taken" }
    }

    // Create organization
    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
      include: { members: true },
    }) as Organization & { members: Member[] }

    // Set as active organization
    (await cookies()).set("orgId", org.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    // Log audit event
    await logAudit({
      organizationId: org.id,
      actorId: userId,
      action: "organization_created",
      metadata: { name, slug },
    })

    return { success: true, org }
  } catch (error) {
    console.error("Failed to create organization:", error)
    return { error: "Failed to create organization" }
  }
}

/**
 * Update organization settings
 */
export async function updateOrganization(
  orgId: string,
  userId: string,
  updates: { name?: string; slug?: string }
) {
  try {
    // Verify user is OWNER or ADMIN
    const member = await prisma.member.findFirst({
      where: { userId, organizationId: orgId },
    })

    if (!member || !hasAccess(member.role, ["OWNER", "ADMIN"])) {
      return { error: "Unauthorized" }
    }

    const updateData: { name?: string; slug?: string } = {}

    if (updates.name) {
      updateData.name = updates.name
    }

    if (updates.slug) {
      const newSlug = slugify(updates.slug)

      // Check if slug is unique
      const existing = await prisma.organization.findUnique({
        where: { slug: newSlug },
      })

      if (existing && existing.id !== orgId) {
        return { error: "This slug is already taken" }
      }

      updateData.slug = newSlug
    }

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: updateData,
    })

    // Log audit event
    await logAudit({
      organizationId: orgId,
      actorId: userId,
      action: "organization_updated",
      metadata: updates,
    })

    return { success: true, org }
  } catch (error) {
    console.error("Failed to update organization:", error)
    return { error: "Failed to update organization" }
  }
}
