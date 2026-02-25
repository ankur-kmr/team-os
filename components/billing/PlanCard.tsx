"use client"

import { Button } from "@/components/ui/button"
import { Plan, PLANS } from "@/lib/plans"
import { upgradePlan } from "@/lib/actions/billing"
import { useTransition } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Loader } from "lucide-react"

interface PlanCardProps {
  plan: Plan
  currentPlan: Plan
}

export function PlanCard({ plan, currentPlan }: PlanCardProps) {
  const [isPending, startTransition] = useTransition()

  const details = PLANS[plan]
  const currentPlanDetails = PLANS[currentPlan]
  
  const isCurrent = plan === currentPlan

  async function handleUpgrade() {
    // if (!session?.user?.id) return

    // startTransition(async () => {
    //   await upgradePlan(plan, session.user!.id as string)
    //   window.location.reload()
    // })

    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        })

        if (!res.ok) {
          throw new Error("Failed to create checkout session")
        }

        const { url } = await res.json()

        if (!url) {
          throw new Error("No checkout URL returned")
        }

        window.location.href = url
      } catch (error) {
        console.error("Upgrade failed:", error)
        toast.error("Upgrade failed. Please try again.")
      }
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
          {isPending && <Loader className="mr-2 animate-spin" />}
          {extractPlanPrice(details.priceLabel) < extractPlanPrice(currentPlanDetails.priceLabel) ? "Downgrade" : "Upgrade"}
        </Button>
      )}
    </div>
  )
}

function extractPlanPrice(price: string): number {
  return parseInt(price.split('₹')[1].split('/')[0])
}