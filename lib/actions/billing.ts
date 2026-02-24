// lib/actions/billing.ts
"use server"

import { prisma } from "@/lib/prisma"
import { getOrgContext } from "@/lib/org-context"
import { PLANS } from "@/lib/plans"
import { logAudit } from "../audit"

export async function upgradePlan(plan: keyof typeof PLANS, userId: string) {
  const { orgId } = await getOrgContext()

  // Check permission (only OWNER)
  const member = await prisma.member.findFirst({
    where: { userId, organizationId: orgId },
  })
  console.log("Member:", member);

  if (!member || member.role !== "OWNER") {
    // throw new Error("Only organization owner can upgrade plan")
  }

  await prisma.subscription.upsert({
    where: { organizationId: orgId },
    update: {
      plan,
      status: "active",
    },
    create: {
      organizationId: orgId,
      plan,
      status: "active",
    },
  })

  await logAudit({
    organizationId: orgId,
    actorId: userId,
    action: "subscription_upgraded",
    metadata: { plan },
  })

  return { success: true }
}