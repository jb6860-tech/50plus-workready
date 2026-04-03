import Stripe from "stripe";
import express from "express";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  hasPremiumAccess, upsertSubscription, updateSubscriptionStatus,
  createPurchase, getUserByStripeCustomerId, updateUserStripeCustomerId,
  getApprovedStories, createSuccessStory, getActiveSubscription, getLifetimePurchase,
  getUserReferralCode, getReferralStats,
} from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-01-27.acacia" });

export function registerStripeWebhook(app: express.Application) {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: express.Request, res: express.Response) => {
      const sig = req.headers["stripe-signature"] as string;
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
      } catch (err) {
        console.error("[Webhook] Signature verification failed:", err);
        res.status(400).send("Webhook signature verification failed");
        return;
      }
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        res.json({ verified: true });
        return;
      }
      console.log("[Webhook] Received event: " + event.type + " (" + event.id + ")");
      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = parseInt(session.metadata?.user_id || "0");
            if (!userId) break;
            if (session.customer) await updateUserStripeCustomerId(userId, session.customer as string);
            if (session.mode === "subscription" && session.subscription) {
              const sub = await stripe.subscriptions.retrieve(session.subscription as string);
              await upsertSubscription({
                userId, stripeSubscriptionId: sub.id, stripeCustomerId: sub.customer as string,
                stripePriceId: sub.items.data[0]?.price.id || "", status: sub.status,
                currentPeriodEnd: (sub.items.data[0] as any)?.current_period_end,
              });
            } else if (session.mode === "payment" && session.payment_intent) {
              await createPurchase({
                userId, stripePaymentIntentId: session.payment_intent as string,
                stripeCustomerId: session.customer as string || undefined, productType: "premium_lifetime",
              });
            }
            break;
          }
          case "customer.subscription.updated": {
            const sub = event.data.object as Stripe.Subscription;
            const user = await getUserByStripeCustomerId(sub.customer as string);
            if (user) {
              await upsertSubscription({
                userId: user.id, stripeSubscriptionId: sub.id, stripeCustomerId: sub.customer as string,
                stripePriceId: sub.items.data[0]?.price.id || "", status: sub.status,
                currentPeriodEnd: (sub.items.data[0] as any)?.current_period_end,
              });
            }
            break;
          }
          case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            await updateSubscriptionStatus(sub.id, "canceled");
            break;
          }
          default:
            console.log("[Webhook] Unhandled event type: " + event.type);
        }
      } catch (err) {
        console.error("[Webhook] Error processing event:", err);
      }
      res.json({ received: true });
    }
  );
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  premium: router({
    status: protectedProcedure.query(async ({ ctx }) => {
      const isPremium = await hasPremiumAccess(ctx.user.id);
      return { isPremium };
    }),
    createSubscriptionCheckout: protectedProcedure
      .input(z.object({ origin: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          customer_email: ctx.user.email || undefined,
          line_items: [{
            price_data: {
              currency: "usd",
              product_data: {
                name: "50+ WorkReady Premium — Monthly",
                description: "Unlock Bonus Interview Scripts, exclusive content, and all future premium features.",
              },
              unit_amount: 799,
              recurring: { interval: "month" },
            },
            quantity: 1,
          }],
          allow_promotion_codes: true,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
          },
          success_url: input.origin + "/premium-success?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: input.origin + "/bonus-scripts",
        });
        return { url: session.url };
      }),
    createLifetimeCheckout: protectedProcedure
      .input(z.object({ origin: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          customer_email: ctx.user.email || undefined,
          line_items: [{
            price_data: {
              currency: "usd",
              product_data: {
                name: "50+ WorkReady Premium — Lifetime Access",
                description: "One-time payment for lifetime access to all premium content.",
              },
              unit_amount: 2999,
            },
            quantity: 1,
          }],
          allow_promotion_codes: true,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
          },
          success_url: input.origin + "/premium-success?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: input.origin + "/bonus-scripts",
        });
        return { url: session.url };
      }),
  }),
  account: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      const [isPremium, sub, purchase, referralCode, referralStats] = await Promise.all([
        hasPremiumAccess(ctx.user.id),
        getActiveSubscription(ctx.user.id),
        getLifetimePurchase(ctx.user.id),
        getUserReferralCode(ctx.user.id),
        getReferralStats(ctx.user.id),
      ]);
      return {
        user: { name: ctx.user.name, email: ctx.user.email },
        isPremium,
        subscription: sub ? {
          status: sub.status,
          currentPeriodEnd: sub.currentPeriodEnd,
          stripeSubscriptionId: sub.stripeSubscriptionId,
        } : null,
        hasLifetime: !!purchase,
        referralCode,
        referralStats,
      };
    }),
    createPortalSession: protectedProcedure
      .input(z.object({ origin: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const sub = await getActiveSubscription(ctx.user.id);
        if (!sub?.stripeCustomerId) throw new Error("No active subscription found");
        const session = await stripe.billingPortal.sessions.create({
          customer: sub.stripeCustomerId,
          return_url: input.origin + "/account",
        });
        return { url: session.url };
      }),
  }),
  stories: router({
    list: publicProcedure.query(async () => {
      return await getApprovedStories();
    }),
    submit: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(128),
        age: z.string().max(8).optional(),
        role: z.string().min(1).max(128),
        company: z.string().max(128).optional(),
        story: z.string().min(10),
        tip: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createSuccessStory({
          userId: ctx.user.id,
          name: input.name, age: input.age ?? null, role: input.role,
          company: input.company ?? null, story: input.story, tip: input.tip ?? null,
          approved: "approved",
        });
        return { success: true };
      }),
    submitPublic: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(128),
        age: z.string().max(8).optional(),
        role: z.string().min(1).max(128),
        company: z.string().max(128).optional(),
        story: z.string().min(10),
        tip: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createSuccessStory({
          userId: null,
          name: input.name, age: input.age ?? null, role: input.role,
          company: input.company ?? null, story: input.story, tip: input.tip ?? null,
          approved: "approved",
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
