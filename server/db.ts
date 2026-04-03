import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, subscriptions, purchases, successStories, InsertSuccessStory, referrals } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized; updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserStripeCustomerId(userId: number, stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ stripeCustomerId }).where(eq(users.id, userId));
}

export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertSubscription(data: {
  userId: number; stripeSubscriptionId: string; stripeCustomerId: string;
  stripePriceId: string; status: string; currentPeriodEnd?: number;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(subscriptions).values({
    userId: data.userId, stripeSubscriptionId: data.stripeSubscriptionId,
    stripeCustomerId: data.stripeCustomerId, stripePriceId: data.stripePriceId,
    status: data.status, currentPeriodEnd: data.currentPeriodEnd ?? null,
  }).onDuplicateKeyUpdate({ set: { status: data.status, currentPeriodEnd: data.currentPeriodEnd ?? null } });
}

export async function updateSubscriptionStatus(stripeSubscriptionId: string, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptions).set({ status }).where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
}

export async function getLifetimePurchase(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(purchases).where(eq(purchases.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createPurchase(data: {
  userId: number; stripePaymentIntentId: string; stripeCustomerId?: string; productType?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(purchases).values({
    userId: data.userId, stripePaymentIntentId: data.stripePaymentIntentId,
    stripeCustomerId: data.stripeCustomerId ?? null, productType: data.productType ?? "premium_lifetime",
  }).onDuplicateKeyUpdate({ set: { productType: data.productType ?? "premium_lifetime" } });
}

export async function hasPremiumAccess(userId: number): Promise<boolean> {
  const [sub, purchase] = await Promise.all([getActiveSubscription(userId), getLifetimePurchase(userId)]);
  if (purchase) return true;
  if (sub && sub.status === "active") {
    if (sub.currentPeriodEnd && sub.currentPeriodEnd * 1000 > Date.now()) return true;
    if (!sub.currentPeriodEnd) return true;
  }
  return false;
}

export async function getApprovedStories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(successStories)
    .where(eq(successStories.approved, "approved"))
    .orderBy(desc(successStories.createdAt))
    .limit(50);
}

export async function createSuccessStory(data: InsertSuccessStory) {
  const db = await getDb();
  if (!db) return;
  await db.insert(successStories).values(data);
}

export async function getUserReferralCode(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) return "";
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (result.length > 0 && result[0].referralCode) return result[0].referralCode;
  // Generate a new code if none exists
  const code = "WR" + Math.random().toString(36).substring(2, 8).toUpperCase();
  await db.update(users).set({ referralCode: code }).where(eq(users.id, userId));
  return code;
}

export async function getReferralStats(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, rewarded: 0 };
  const rows = await db.select().from(referrals).where(eq(referrals.referrerId, userId));
  return { total: rows.length, rewarded: rows.filter(r => r.rewarded === 1).length };
}

export async function recordReferral(referralCode: string, referredUserId: number) {
  const db = await getDb();
  if (!db) return;
  // Find the referrer
  const referrers = await db.select().from(users).where(eq(users.referralCode, referralCode)).limit(1);
  if (!referrers.length) return;
  const referrerId = referrers[0].id;
  if (referrerId === referredUserId) return; // can't refer yourself
  // Check not already recorded
  const existing = await db.select().from(referrals)
    .where(and(eq(referrals.referrerId, referrerId), eq(referrals.referredUserId, referredUserId)))
    .limit(1);
  if (existing.length) return;
  await db.insert(referrals).values({ referrerId, referredUserId, referralCode, rewarded: 0 });
}
