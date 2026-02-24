"use client"

import { Button } from "@/components/ui/button"
import { Plan, PLANS } from "@/lib/plans"
import { upgradePlan } from "@/lib/actions/billing"
import { useTransition } from "react"
import { useSession } from "next-auth/react"

interface PlanCardProps {
  plan: Plan
  currentPlan: Plan
}

export function PlanCard({ plan, currentPlan }: PlanCardProps) {
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()

  const details = PLANS[plan]
  const isCurrent = plan === currentPlan

  function handleUpgrade() {
    if (!session?.user?.id) return

    startTransition(async () => {
      await upgradePlan(plan, session.user!.id as string)
      window.location.reload()
    })
  }

  return (
    <div className="border rounded-xl p-6 space-y-4 shadow-sm">
      <div>
        <h3 className="text-xl font-semibold">{details.name}</h3>
        <p className="text-muted-foreground">{details.description}</p>
      </div>

      <div className="text-3xl font-bold">{details.priceLabel}</div>

      <ul className="space-y-1 text-sm">
        <li>{details.taskLimit === Infinity ? "Unlimited" : details.taskLimit} tasks</li>
        <li>{details.projectLimit === Infinity ? "Unlimited" : details.projectLimit} projects</li>
        <li>{details.memberLimit === Infinity ? "Unlimited" : details.memberLimit} members</li>
      </ul>

      {isCurrent ? (
        <Button disabled className="w-full">
          Current Plan
        </Button>
      ) : (
        <Button
          onClick={handleUpgrade}
          disabled={isPending}
          className="w-full"
        >
          {plan === "FREE" ? "Downgrade" : "Upgrade"}
        </Button>
      )}
    </div>
  )
}