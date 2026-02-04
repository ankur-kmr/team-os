/**
 * Server Actions Index
 * 
 * Centralized export for all server actions.
 * Import from here for convenience: import { registerUser } from "@/lib/actions"
 */

// Authentication
export { registerUser, logoutUser } from "./auth"

// Organizations
export { createOrganization, updateOrganization } from "./organizations"

// Members
export { inviteMember, changeMemberRole, removeMember } from "./members"

// Projects
export { createProject } from "./projects"

// Tasks
export { createTask, updateTaskStatus } from "./tasks"
