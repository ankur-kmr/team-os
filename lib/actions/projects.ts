"use server"

import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

/**
 * Project Management Actions
 * Handle project CRUD operations
 */

/**
 * Create a new project
 */
export async function createProject(
  orgId: string,
  userId: string,
  name: string,
  description?: string
) {
  try {
    // Verify user is member
    const member = await prisma.member.findFirst({
      where: { userId, organizationId: orgId },
    })

    if (!member) {
      return { error: "Unauthorized" }
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        organizationId: orgId,
      },
    })

    // Log audit event
    await logAudit({
      organizationId: orgId,
      actorId: userId,
      action: "project_created",
      metadata: { projectId: project.id, name },
    })

    return { success: true, project }
  } catch (error) {
    console.error("Failed to create project:", error)
    return { error: "Failed to create project" }
  }
}
