"use server";

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { hasAccess, canManageRole, canRemoveMember } from "@/lib/rbac";
import { hash } from "bcryptjs";
import { slugify } from "@/lib/utils";
import { signIn } from "@/lib/auth";
import {
  registerSchema,
  loginSchema,
  createOrganizationSchema,
  projectSchema,
  taskSchema,
  inviteMemberSchema,
  changeMemberRoleSchema,
  type RegisterInput,
  type LoginInput,
} from "@/lib/validations";
import { Priority, Role, TaskStatus } from "@/db/generated/prisma/client";

/**
 * Server Actions for TeamOS
 * These are backend functions called directly from the frontend
 * They handle validation, RBAC checks, and database mutations
 */

// ==================== AUTHENTICATION ====================

/**
 * Register a new user
 * Validates input, hashes password, creates user, and auto-signs them in
 */
export async function registerUser(input: RegisterInput) {
  try {
    // Validate input with Zod
    const validatedData = registerSchema.parse(input);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { error: "Email already registered" };
    }

    // Hash password with bcrypt
    const passwordHash = await hash(validatedData.password, 10);
    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
      },
    });

    // Auto sign-in the user after registration
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle Zod validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return { error: "Invalid input data" };
    }
    
    return { error: "Failed to create account. Please try again." };
  }
}

// ==================== ORGANIZATION ====================

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
      return { error: "Organization name is required" };
    }

    if (!slugInput || slugInput.trim().length === 0) {
      return { error: "Organization slug is required" };
    }

    const slug = slugify(slugInput);

    if (slug.length < 3) {
      return { error: "Slug must be at least 3 characters" };
    }

    // Check if slug already exists
    const existing = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      return { error: "This slug is already taken" };
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
    });

    // Log audit event
    await logAudit({
      organizationId: org.id,
      actorId: userId,
      action: "organization_created",
      metadata: { name, slug },
    });

    return { success: true, org };
  } catch (error) {
    console.error("Failed to create organization:", error);
    return { error: "Failed to create organization" };
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
    });

    if (!member || !hasAccess(member.role, ["OWNER", "ADMIN"])) {
      return { error: "Unauthorized" };
    }

    const updateData: { name?: string; slug?: string } = {};

    if (updates.name) {
      updateData.name = updates.name;
    }

    if (updates.slug) {
      const newSlug = slugify(updates.slug);

      // Check if slug is unique
      const existing = await prisma.organization.findUnique({
        where: { slug: newSlug },
      });

      if (existing && existing.id !== orgId) {
        return { error: "This slug is already taken" };
      }

      updateData.slug = newSlug;
    }

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: updateData,
    });

    // Log audit event
    await logAudit({
      organizationId: orgId,
      actorId: userId,
      action: "organization_updated",
      metadata: updates,
    });

    return { success: true, org };
  } catch (error) {
    console.error("Failed to update organization:", error);
    return { error: "Failed to update organization" };
  }
}

// ==================== MEMBERS ====================

/**
 * Invite a member to the organization
 */
export async function inviteMember(
  orgId: string,
  userId: string,
  email: string,
  role: string
) {
  try {
    // Verify actor has permission
    const actor = await prisma.member.findFirst({
      where: { userId, organizationId: orgId },
    });

    if (!actor || !hasAccess(actor.role, ["OWNER", "ADMIN"])) {
      return { error: "Unauthorized" };
    }

    // Check if user already exists
    let invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, create them (they'll set password on first login)
    if (!invitedUser) {
      invitedUser = await prisma.user.create({
        data: { email },
      });
    }

    // Check if already a member
    const existingMember = await prisma.member.findFirst({
      where: {
        userId: invitedUser.id,
        organizationId: orgId,
      },
    });

    if (existingMember) {
      return { error: "User is already a member of this organization" };
    }

    // Create member
    const member = await prisma.member.create({
      data: {
        userId: invitedUser.id,
        organizationId: orgId,
        role: role as Role,
      },
    });

    // Log audit event
    await logAudit({
      organizationId: orgId,
      actorId: userId,
      action: "member_invited",
      metadata: { email, role },
    });

    // TODO: Send invitation email to invitedUser.email

    return { success: true, member };
  } catch (error) {
    console.error("Failed to invite member:", error);
    return { error: "Failed to invite member" };
  }
}

/**
 * Change a member's role
 */
export async function changeMemberRole(
  orgId: string,
  actorId: string,
  memberId: string,
  newRole: string
) {
  try {
    // Verify actor has permission
    const actor = await prisma.member.findFirst({
      where: { userId: actorId, organizationId: orgId },
    });

    if (!actor || !hasAccess(actor.role, ["OWNER", "ADMIN"])) {
      return { error: "Unauthorized" };
    }

    // Get target member
    const target = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!target || target.organizationId !== orgId) {
      return { error: "Member not found" };
    }

    // Check if actor can manage this role
    if (!canManageRole(actor.role as Role, target.role as Role)) {
      return { error: "Cannot change role of equal or higher role" };
    }

    // Update role
    const updated = await prisma.member.update({
      where: { id: memberId },
      data: { role: newRole as Role },
    });

    // Log audit event
    await logAudit({
      organizationId: orgId,
      actorId,
      action: "member_role_changed",
      metadata: { memberId, oldRole: target.role, newRole },
    });

    return { success: true, member: updated };
  } catch (error) {
    console.error("Failed to change member role:", error);
    return { error: "Failed to change member role" };
  }
}

/**
 * Remove a member from the organization
 */
export async function removeMember(
  orgId: string,
  actorId: string,
  memberId: string
) {
  try {
    // Verify actor has permission
    const actor = await prisma.member.findFirst({
      where: { userId: actorId, organizationId: orgId },
    });

    if (!actor || !hasAccess(actor.role, ["OWNER", "ADMIN"])) {
      return { error: "Unauthorized" };
    }

    // Check if can remove this member
    const canRemove = await canRemoveMember(memberId, orgId, prisma);
    if (!canRemove) {
      return { error: "Cannot remove the last owner" };
    }

    // Get member info before deletion
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) {
      return { error: "Member not found" };
    }

    // Delete member
    await prisma.member.delete({
      where: { id: memberId },
    });

    // Log audit event
    await logAudit({
      organizationId: orgId,
      actorId,
      action: "member_removed",
      metadata: { email: member.user.email, role: member.role },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to remove member:", error);
    return { error: "Failed to remove member" };
  }
}

// ==================== PROJECTS ====================

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
    });

    if (!member) {
      return { error: "Unauthorized" };
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        organizationId: orgId,
      },
    });

    // Log audit event
    await logAudit({
      organizationId: orgId,
      actorId: userId,
      action: "project_created",
      metadata: { projectId: project.id, name },
    });

    return { success: true, project };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { error: "Failed to create project" };
  }
}

// ==================== TASKS ====================

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
    });

    if (!member) {
      return { error: "Unauthorized" };
    }

    // Verify project belongs to org
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId },
    });

    if (!project) {
      return { error: "Project not found" };
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
    });

    // Log audit event
    await logAudit({
      organizationId: orgId,
      actorId: userId,
      action: "task_created",
      metadata: { taskId: task.id, title, projectId },
    });

    return { success: true, task };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { error: "Failed to create task" };
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
    });

    if (!member) {
      return { error: "Unauthorized" };
    }

    // Get task and verify org access
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: { organizationId: orgId },
      },
    });

    if (!task) {
      return { error: "Task not found" };
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status: status as TaskStatus },
    });

    // Log audit event
    await logAudit({
      organizationId: orgId,
      actorId: userId,
      action: "task_updated",
      metadata: { taskId, status, oldStatus: task.status },
    });

    return { success: true, task: updated };
  } catch (error) {
    console.error("Failed to update task:", error);
    return { error: "Failed to update task" };
  }
}
