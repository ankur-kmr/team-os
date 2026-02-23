import { getCurrentOrgId } from "@/lib/org-context"
import { getOrgUsage } from "@/lib/usage"
import { getOrgPlan } from "@/lib/org-context"
import { UsageBar } from "@/components/usage/UsageBar"
import { PLANS } from "@/lib/plans"
import { redirect } from "next/navigation"
import { ButtonLink } from "@/components/ui/button-link"

export default async function BillingPage() {
  const orgId = await getCurrentOrgId()
  if (!orgId) {
    redirect("/onboarding")
  }
  
  const plan = await getOrgPlan(orgId)
  const usage = await getOrgUsage(orgId)
  const limits = PLANS[plan]

  return (
    <div className="space-y-6">
      <h1>Billing & Usage</h1>
      
      <div>
        <h2>Current Plan: {plan}</h2>
      </div>

      <div className="space-y-4">
        <UsageBar
          current={usage.tasks}
          limit={limits.taskLimit}
          label="Tasks"
          plan={plan}
        />
        <UsageBar
          current={usage.projects}
          limit={limits.projectLimit}
          label="Projects"
          plan={plan}
        />
        <UsageBar
          current={usage.members}
          limit={limits.inviteLimit}
          label="Team Members"
          plan={plan}
        />
      </div>

      {plan !== "ENTERPRISE" && (
        <ButtonLink href="/dashboard/settings/billing/upgrade">Upgrade Plan</ButtonLink>
      )}
    </div>
  )
}