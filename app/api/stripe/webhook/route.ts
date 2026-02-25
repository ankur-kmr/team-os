// app/api/stripe/webhook/route.ts

import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { Plan } from "@/lib/plans"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return new Response("Missing signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("❌ Invalid webhook signature", err)
    return new Response("Invalid signature", { status: 400 })
  }

  try {
    switch (event.type) {
      /**
       * 1️⃣ Checkout completed (initial subscription)
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (!session.subscription) break

        const stripeSub = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        console.log("Retrieved Stripe subscription:", stripeSub, session)

        const orgId = stripeSub.metadata.organizationId
        const plan = stripeSub.metadata.plan as Plan

        if (!orgId || !plan) break

        await prisma.subscription.update({
          where: { organizationId: orgId },
          data: {
            stripeSubscriptionId: stripeSub.id,
            stripeCustomerId: stripeSub.customer as string,
            plan,
            status: stripeSub.status,
          },
        })

        break
      }

      /**
       * 2️⃣ Subscription updated (renewal, upgrade, downgrade, payment changes)
       */
      case "customer.subscription.updated": {
        const stripeSub = event.data.object as Stripe.Subscription
        console.log("Subscription updated:", stripeSub)

        const orgId = stripeSub.metadata.organizationId
        if (!orgId) break

        await prisma.subscription.update({
          where: { organizationId: orgId },
          data: {
            status: stripeSub.status,
          },
        })

        break
      }

      /**
       * 3️⃣ Subscription cancelled
       */
      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription
        console.log("Subscription cancelled:", stripeSub)

        const orgId = stripeSub.metadata.organizationId
        if (!orgId) break

        await prisma.subscription.update({
          where: { organizationId: orgId },
          data: {
            status: "canceled",
            plan: "FREE",
            stripeSubscriptionId: null,
          },
        })

        break
      }
    }

    return new Response("ok", { status: 200 })
  } catch (err) {
    console.error("❌ Webhook processing error", err)
    return new Response("Webhook error", { status: 500 })
  }
}