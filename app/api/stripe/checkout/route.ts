import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { getOrgContext } from "@/lib/org-context"
import { Plan, PLANS } from "@/lib/plans"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { plan } = await req.json() as { plan: Plan }
  const { orgId } = await getOrgContext()

  const subscription = await prisma.subscription.findUnique({
    where: { organizationId: orgId },
  })
  console.log("Current subscription:", subscription)

  let customerId = subscription?.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { organizationId: orgId },
    })
    console.log("Created new Stripe customer:", customer)

    customerId = customer.id

    await prisma.subscription.update({
      where: { organizationId: orgId },
      data: { stripeCustomerId: customerId },
    }).then(() => {
      console.log("Updated subscription with new customer ID")
    }).catch((err) => {
      console.error("Failed to update subscription with customer ID:", err)
    })
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: PLANS[plan].stripePriceId!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.BASE_URL}/dashboard/settings/billing`,
    cancel_url: `${process.env.BASE_URL}/dashboard/settings/billing`,
    subscription_data: {
      metadata: {
        organizationId: orgId,
        plan,
      },
    },
  })
  console.log("Created Stripe checkout session:", session)

  return Response.json({ url: session.url })
}