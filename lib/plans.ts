// lib/plans.ts

export const PLANS = {
  FREE: {
    name: "FREE",
    priceLabel: "₹0/mo",
    description: "Best for individuals",
    taskLimit: 10,
    projectLimit: 3,
    memberLimit: 5,
    stripePriceId: null,
  },
  PRO: {
    name: "PRO",
    priceLabel: "₹999/mo",
    description: "Best for growing teams",
    taskLimit: 500,
    projectLimit: 50,
    memberLimit: 20,
    stripePriceId: "price_1T4fOBHLfmSt2ERgNX3fuvKY",
  },
  ENTERPRISE: {
    name: "ENTERPRISE",
    priceLabel: "₹1999/mo",
    description: "Built for scaling teams with unlimited usage, advanced controls, and priority support.",
    taskLimit: Infinity,
    projectLimit: Infinity,
    memberLimit: Infinity,
    stripePriceId: "price_1T4fWAHLfmSt2ERgrhk9nUi3",
  },
} as const

export type Plan = keyof typeof PLANS