"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PLANS } from "@/lib/plans"

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan: string
  resource: string
  current: number
  limit: number
}

export function UpgradeModal({
  open,
  onOpenChange,
  currentPlan,
  resource,
  current,
  limit,
}: UpgradeModalProps) {
  const nextPlan = currentPlan === "FREE" ? "PRO" : "ENTERPRISE"
  const nextPlanLimits = PLANS[nextPlan]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade Required</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            You&apos;ve reached your {currentPlan} plan limit for {resource} ({current}/{limit}).
          </p>
          <div>
            <h3 className="font-semibold">Upgrade to {nextPlan}</h3>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>{nextPlanLimits.taskLimit === Infinity ? "∞" : nextPlanLimits.taskLimit} tasks</li>
              <li>{nextPlanLimits.projectLimit === Infinity ? "∞" : nextPlanLimits.projectLimit} projects</li>
              <li>{nextPlanLimits.inviteLimit === Infinity ? "∞" : nextPlanLimits.inviteLimit} team members</li>
            </ul>
          </div>
          <Button onClick={() => window.location.href = "/dashboard/billing"}>
            Upgrade Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}