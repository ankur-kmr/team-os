"use server"

import { prisma } from "@/lib/prisma"
import { PLANS, PlanType } from "@/lib/plans"
import { getOrgPlan } from "@/lib/org-context"
import { UsageLimitError } from "./errors"

/**
 * Get current usage counts for an organization
 */
export async function getOrgUsage(orgId: string) {
  const [taskCount, projectCount, memberCount] = await Promise.all([
    prisma.task.count({ where: { organizationId: orgId } }),
    prisma.project.count({ where: { organizationId: orgId } }),
    prisma.member.count({ where: { organizationId: orgId } }),
  ])

  return {
    tasks: taskCount,
    projects: projectCount,
    members: memberCount,
  }
}

/**
 * Check if organization can perform an action based on plan limits
 */
export async function checkUsageLimit(
  orgId: string,
  resource: "tasks" | "projects" | "members"
): Promise<{ allowed: boolean; current: number; limit: number; plan: PlanType }> {
  const plan = await getOrgPlan(orgId)
  const limits = PLANS[plan]
  const usage = await getOrgUsage(orgId)

  let current: number
  let limit: number

  switch (resource) {
    case "tasks":
      current = usage.tasks
      limit = limits.taskLimit
      break
    case "projects":
      current = usage.projects
      limit = limits.projectLimit
      break
    case "members":
      current = usage.members // Current members count
      limit = limits.inviteLimit
      break
  }

  const allowed = limit === Infinity || current < limit

  return {
    allowed,
    current,
    limit,
    plan,
  }
}

/**
 * Throw error if limit reached (for use in server actions)
 */
export async function requireUsageLimit(orgId: string, resource: "tasks" | "projects" | "members") {
  const check = await checkUsageLimit(orgId, resource)

  if (!check.allowed) {
    throw new UsageLimitError(resource, check.current, check.limit, check.plan)
  }

  return check
}