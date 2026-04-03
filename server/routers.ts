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
  getUserReferralCode, getReferralStats, getAdminStats, approveStory, rejectStory, getAllStoriesAdmin,
  saveResumeDraft, loadResumeDraft,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";

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
  admin: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      return await getAdminStats();
    }),
    allStories: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      return await getAllStoriesAdmin();
    }),
    approveStory: protectedProcedure
      .input(z.object({ storyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        await approveStory(input.storyId);
        return { success: true };
      }),
    rejectStory: protectedProcedure
      .input(z.object({ storyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        await rejectStory(input.storyId);
        return { success: true };
      }),
  }),
  resume: router({
    save: protectedProcedure
      .input(z.object({ data: z.string(), template: z.string().default("classic") }))
      .mutation(async ({ ctx, input }) => {
        await saveResumeDraft(ctx.user.id, input.data, input.template);
        return { success: true };
      }),
    load: protectedProcedure.query(async ({ ctx }) => {
      return await loadResumeDraft(ctx.user.id);
    }),
    analyze: protectedProcedure
      .input(z.object({ resumeText: z.string().min(50).max(8000) }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert career coach specializing in helping adults aged 50+ navigate the modern job market. 
You analyze resumes and provide specific, actionable, encouraging feedback. 
Your feedback focuses on: reducing age bias signals, strengthening impact statements, improving ATS keyword optimization, 
and highlighting transferable skills. Always be warm, respectful, and empowering in your tone.
Return your response as JSON matching this exact schema:
{
  "overallScore": number (0-100),
  "summary": string (2-3 sentences of overall assessment),
  "strengths": string[] (3-4 specific strengths found in the resume),
  "improvements": [{"title": string, "detail": string, "priority": "high"|"medium"|"low"}] (4-6 items),
  "ageBiasFlags": string[] (specific phrases or elements that may signal age, with suggestions to fix),
  "atsKeywords": string[] (5-8 keywords to add or strengthen for ATS optimization),
  "quickWins": string[] (3 immediate changes that would have the biggest impact)
}`,
            },
            {
              role: "user",
              content: `Please analyze this resume and provide detailed feedback:\n\n${input.resumeText}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "resume_feedback",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  overallScore: { type: "number" },
                  summary: { type: "string" },
                  strengths: { type: "array", items: { type: "string" } },
                  improvements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        detail: { type: "string" },
                        priority: { type: "string" },
                      },
                      required: ["title", "detail", "priority"],
                      additionalProperties: false,
                    },
                  },
                  ageBiasFlags: { type: "array", items: { type: "string" } },
                  atsKeywords: { type: "array", items: { type: "string" } },
                  quickWins: { type: "array", items: { type: "string" } },
                },
                required: ["overallScore", "summary", "strengths", "improvements", "ageBiasFlags", "atsKeywords", "quickWins"],
                additionalProperties: false,
              },
            },
          },
        });
        const content = (response.choices[0]?.message?.content as string) || "{}";
        return JSON.parse(content);
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
