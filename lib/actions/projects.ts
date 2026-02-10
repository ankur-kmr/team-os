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

/**
 * Update a project
 */
export async function updateProject(orgId: string, userId: string, projectId: string, name: string, description?: string) {
  try {
    // Verify user is member
    const member = await prisma.member.findFirst({
      where: { userId, organizationId: orgId },
    })

    if (!member) {
      return { error: "Unauthorized" }
    }
    // Verify project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId, organizationId: orgId },
    })

    if (!existingProject) {
      return { error: "Project not found" }
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { name, description },
    })

    // Log audit event
    await logAudit({
      organizationId: orgId,
      actorId: userId,
      action: "project_updated",
      metadata: { projectId, name },
    })

    return { success: true, project: updatedProject }
  } catch (error) {
    console.error("Failed to update project:", error)
    return { error: "Failed to update project" }
  }
}