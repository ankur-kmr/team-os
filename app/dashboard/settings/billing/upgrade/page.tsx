// app/dashboard/settings/billing/upgrade/page.tsx

import { getOrgContext } from "@/lib/org-context"
import { getOrgPlan } from "@/lib/org-context"
import { getOrgUsage } from "@/lib/usage"
import { PLANS } from "@/lib/plans"
import { UpgradeModal } from "@/components/billing/UpgradeModal"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default async function UpgradePage() {
  const [open, setOpen] = useState(false)

  const { orgId } = await getOrgContext()

  const plan = await getOrgPlan(orgId)
  const usage = await getOrgUsage(orgId)
  const limits = PLANS[plan]

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Upgrade Plan
      </Button>
      <UpgradeModal
        open={open}
        onOpenChange={setOpen}
        currentPlan={plan}
        resource="tasks"
        current={usage.tasks}
        limit={limits.taskLimit}
      />
    </>
  )
}