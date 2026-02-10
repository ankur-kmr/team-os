import { prisma } from "./prisma";

interface AuditLogPayload {
  organizationId: string;
  actorId?: string;
  action: string;
  metadata?: Record<string, string | number | boolean | null>;
}

/**
 * Log an audit event
 * Every important action creates an audit log for compliance and debugging
 *
 * @example
 * await logAudit({
 *   organizationId: org.id,
 *   actorId: user.id,
 *   action: "member_invited",
 *   metadata: { email: "user@example.com", role: "ADMIN" }
 * });
 */
export async function logAudit({
  organizationId,
  actorId,
  action,
  metadata,
}: AuditLogPayload): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId,
        actorId,
        action,
        metadata,
      },
    });
  } catch (error) {
    // Log error but don't fail the main operation
    console.error("Failed to create audit log:", error);
  }
}

/**
 * Create a human-readable description of an audit action
 */
export function getActionDescription(action: string, metadata?: Record<string, string | number | boolean | null>): string {
  const descriptions: Record<string, string> = {
    organization_created: "Created organization",
    organization_updated: "Updated organization settings",
    member_invited: "Invited member",
    member_role_changed: "Changed member role",
    member_removed: "Removed member",
    project_created: "Created project",
    project_updated: "Updated project",
    project_deleted: "Deleted project",
    task_created: "Created task",
    task_updated: "Updated task",
    task_deleted: "Deleted task",
    comment_created: "Added comment",
    subscription_created: "Created subscription",
    subscription_updated: "Updated subscription",
    subscription_cancelled: "Cancelled subscription",
  };

  return descriptions[action] || action;
}

/**
 * Get activity feed from audit logs
 * Used to display recent activity on dashboard
 */
export async function getActivityFeed(
  organizationId: string,
  limit: number = 10
) {
  const logs = await prisma.auditLog.findMany({
    where: {
      organizationId,
    },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    description: getActionDescription(log.action, log.metadata as Record<string, string | number | boolean | null>),
    actor: log.actor?.name || log.actor?.email || "System",
    timestamp: log.createdAt,
    metadata: log.metadata,
  }));
}
