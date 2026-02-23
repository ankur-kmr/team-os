export type PlanType = "FREE" | "PRO" | "ENTERPRISE"

export const PLANS = {
  FREE: {
    taskLimit: 20,
    projectLimit: 3,
    inviteLimit: 5,
  },
  PRO: {
    taskLimit: 500,
    projectLimit: 50,
    inviteLimit: 100,
  },
  ENTERPRISE: {
    taskLimit: Infinity,
    projectLimit: Infinity,
    inviteLimit: Infinity,
  },
} as const
