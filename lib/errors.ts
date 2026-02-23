export class UsageLimitError extends Error {
    constructor(
      public resource: string,
      public current: number,
      public limit: number,
      public plan: string
    ) {
      const upgradePlan = plan === "FREE" ? "Pro" : "Enterprise"
      super(
        `You've reached your ${plan} plan limit for ${resource} (${current}/${limit}). ` +
        `Upgrade to ${upgradePlan} to continue.`
      )
      this.name = "UsageLimitError"
    }
  }