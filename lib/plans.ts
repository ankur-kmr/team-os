// lib/plans.ts

export const PLANS = {
  FREE: {
    name: "FREE",
    priceLabel: "$0",
    description: "Best for individuals",
    taskLimit: 10,
    projectLimit: 3,
    memberLimit: 5,
  },
  PRO: {
    name: "PRO",
    priceLabel: "$29/mo",
    description: "Best for growing teams",
    taskLimit: 1000,
    projectLimit: 50,
    memberLimit: 20,
  },
  ENTERPRISE: {
    name: "ENTERPRISE",
    priceLabel: "Custom",
    description: "Unlimited usage",
    taskLimit: Infinity,
    projectLimit: Infinity,
    memberLimit: Infinity,
  },
} as const

export type Plan = keyof typeof PLANS