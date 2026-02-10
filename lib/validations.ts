import { z } from "zod";

/**
 * Zod Validation Schemas for TeamOS
 * Centralized validation for forms and API inputs
 */

// ==================== REUSABLE FIELD SCHEMAS ====================

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters");

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters")
  .optional();

export const orgNameSchema = z
  .string()
  .min(2, "Organization name must be at least 2 characters")
  .max(100, "Organization name must be less than 100 characters");

export const slugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(50, "Slug must be less than 50 characters")
  .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens");

// ==================== AUTH SCHEMAS ====================

/**
 * Registration form schema
 * Used in: app/(auth)/register/page.tsx
 */
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/**
 * Login form schema
 * Used in: app/(auth)/login/page.tsx
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// ==================== ORGANIZATION SCHEMAS ====================

/**
 * Create organization schema
 * Used in: app/(org)/create-org/page.tsx
 */
export const createOrganizationSchema = z.object({
  name: orgNameSchema,
  slug: slugSchema,
});

/**
 * Update organization schema
 * Used in: app/dashboard/settings/page.tsx
 */
export const updateOrganizationSchema = z.object({
  name: orgNameSchema.optional(),
  slug: slugSchema.optional(),
});

// ==================== PROJECT SCHEMAS ====================

/**
 * Create/Update project schema
 * Used in: app/dashboard/projects/
 */
export const projectSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

// ==================== TASK SCHEMAS ====================

/**
 * Create/Update task schema
 * Used in: app/dashboard/projects/[id]/
 */
export const taskSchema = z.object({
  title: z
    .string()
    .min(2, "Task title must be at least 2 characters")
    .max(200, "Task title must be less than 200 characters"),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM").optional(),
  assignedToId: z.string().optional(),
});

/**
 * Update task status only
 * Used for quick status changes
 */
export const updateTaskStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
});

// ==================== MEMBER SCHEMAS ====================

/**
 * Invite member schema
 * Used in: app/dashboard/members/page.tsx
 */
export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

/**
 * Change member role schema
 * Used in: app/dashboard/members/page.tsx
 */
export const changeMemberRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

// ==================== COMMENT SCHEMAS ====================

/**
 * Create comment schema
 * Used in: app/dashboard/projects/[id]/
 */
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be less than 1000 characters"),
});

// ==================== TYPE EXPORTS ====================

// Export inferred TypeScript types for use throughout the app
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type ChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
