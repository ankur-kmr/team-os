export const dynamic = "force-dynamic"

import { getCurrentOrgId } from "@/lib/org-context"
import { getOrgUsage } from "@/lib/usage"
import { getOrgPlan } from "@/lib/org-context"
import { UsageBar } from "@/components/usage/UsageBar"
import { type Plan, PLANS } from "@/lib/plans"
import { redirect } from "next/navigation"
import { PlanCard } from "@/components/billing/PlanCard"

export default async function BillingPage() {
  const orgId = await getCurrentOrgId()
  if (!orgId) {
    redirect("/onboarding")
  }
  
  const currentPlan = await getOrgPlan(orgId)
  const usage = await getOrgUsage(orgId)
  const limits = PLANS[currentPlan]

  return (
    <div className="p-6 space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Billing & Usage</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view usage limits.
        </p>
      </div>

      {/* Current Usage */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Current Plan: {currentPlan}
        </h2>

        <UsageBar
          current={usage.tasks}
          limit={limits.taskLimit}
          label="Tasks"
          plan={currentPlan}
        />
        <UsageBar
          current={usage.projects}
          limit={limits.projectLimit}
          label="Projects"
          plan={currentPlan}
        />
        <UsageBar
          current={usage.members}
          limit={limits.memberLimit}
          label="Team Members"
          plan={currentPlan}
        />
      </div>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Available Plans
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {(Object.keys(PLANS) as Plan[]).map((plan) => (
            <PlanCard
              key={plan}
              plan={plan}
              currentPlan={currentPlan}
            />
          ))}
        </div>
      </div>
    </div>
  )
}