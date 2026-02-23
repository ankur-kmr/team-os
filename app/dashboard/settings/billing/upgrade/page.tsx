import { UpgradeModal } from "@/components/billing/UpgradeModal";

export default function UpgradePage() {
  return (
    <div>
      <h1>Upgrade Billing Plan</h1>
      <UpgradeModal
        open={true}
        onOpenChange={() => {}}
        currentPlan="FREE"
        resource="tasks"
        current={10}
        limit={100}
      />
    </div>
  )
}