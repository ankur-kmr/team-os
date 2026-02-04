"use server"

import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { Priority, TaskStatus } from "@/db/generated/prisma/client"

/**
 * Task Management Actions
 * Handle task CRUD and status updates
 */

/**
 * Create a new task
 */
export async function createTask(
  orgId: string,
  userId: string,
  projectId: string,
  title: string,
  description?: string,
  priority?: string,
  assignedToId?: string
) {
  try {
    // Verify user is member
    const member = await prisma.member.findFirst({
      where: { userId, organizationId: orgId },
    })

    if (!member) {
      return { error: "Unauthorized" }
    }

    // Verify project belongs to org
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId },
    })

    if (!project) {
      return { error: "Project not found" }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: (priority as Priority) || Priority.MEDIUM,
        projectId,
        organizationId: orgId,
        createdById: userId,
        assignedToId,
        status: TaskStatus.TODO,
      },
    })

    // Log audit event
    await logAudit({
      organizationId: orgId,
      actorId: userId,
      action: "task_created",
      metadata: { taskId: task.id, title, projectId },
    })

    return { success: true, task }
  } catch (error) {
    console.error("Failed to create task:", error)
    return { error: "Failed to create task" }
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  orgId: string,
  userId: string,
  taskId: string,
  status: string
) {
  try {
    // Verify user is member
    const member = await prisma.member.findFirst({
      where: { userId, organizationId: orgId },
    })

    if (!member) {
      return { error: "Unauthorized" }
    }

    // Get task and verify org access
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: { organizationId: orgId },
      },
    })

    if (!task) {
      return { error: "Task not found" }
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status: status as TaskStatus },
    })

    // Log audit event
    await logAudit({
      organizationId: orgId,
      actorId: userId,
      action: "task_updated",
      metadata: { taskId, status, oldStatus: task.status },
    })

    return { success: true, task: updated }
  } catch (error) {
    console.error("Failed to update task:", error)
    return { error: "Failed to update task" }
  }
}
