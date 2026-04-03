import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { toast } from "sonner";
import {
  Check, X, Crown, Zap, Star, Loader2, ChevronDown, ChevronUp, Shield
} from "lucide-react";

const FREE_FEATURES = [
  "Resume Tips & Age-Bias Guide",
  "Interview Confidence Scripts (8 questions)",
  "Cover Letter Builder",
  "Scam Job Red-Flag Checker",
  "Age-Friendly Job Resources",
  "Daily Affirmations (30+)",
  "Job Application Tracker",
  "Salary Negotiation Tips",
  "Success Stories Community",
  "Networking Hub",
  "Resume Builder (3 templates)",
  "AI Job Match Tool",
  "AI Interview Coach",
];

const PREMIUM_ONLY = [
  "Bonus Interview Scripts (10 advanced scripts)",
  "LinkedIn Profile Optimization Guide",
  "AI Resume Feedback & Score",
  "AI-Generated Cover Letters",
  "Save Resume Drafts to Account",
  "Priority access to all future premium features",
];

const FAQ = [
  {
    q: "Can I cancel my monthly subscription anytime?",
    a: "Yes — you can cancel at any time from your Account Dashboard or directly through Stripe. You keep access until the end of your current billing period. No questions asked.",
  },
  {
    q: "What is the difference between Monthly and Lifetime?",
    a: "Monthly gives you full premium access for $7.99/month — great if you want to try it first. Lifetime is a one-time payment of $29.99 that gives you permanent access to all premium content, including every future feature we add. Most users who plan to use the app for more than 4 months choose Lifetime.",
  },
  {
    q: "Is my payment secure?",
    a: "Absolutely. All payments are processed by Stripe, one of the world's most trusted payment platforms. We never see or store your card details.",
  },
  {
    q: "Do I need to create an account?",
    a: "You need to sign in with your Manus account to purchase a subscription so we can link your premium access to your profile. The free tools are available without signing in.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "We stand behind our content. If you're not satisfied within the first 7 days, contact us and we'll make it right.",
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const createSubscription = trpc.premium.createSubscriptionCheckout.useMutation({
    onSuccess: (data: { url: string | null }) => {
      setLoadingPlan(null);
      if (data.url) {
        toast.info("Redirecting to secure checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (err: { message: string }) => {
      setLoadingPlan(null);
      toast.error("Could not start checkout: " + err.message);
    },
  });

  const createLifetime = trpc.premium.createLifetimeCheckout.useMutation({
    onSuccess: (data: { url: string | null }) => {
      setLoadingPlan(null);
      if (data.url) {
        toast.info("Redirecting to secure checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (err: { message: string }) => {
      setLoadingPlan(null);
      toast.error("Could not start checkout: " + err.message);
    },
  });

  const handleUpgrade = (plan: "monthly" | "lifetime") => {
    if (!isAuthenticated) {
      toast.info("Please sign in first to unlock premium access.");
      window.location.href = getLoginUrl();
      return;
    }
    setLoadingPlan(plan);
    const origin = window.location.origin;
    if (plan === "monthly") {
      createSubscription.mutate({ origin });
    } else {
      createLifetime.mutate({ origin });
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ background: "#f8f5f0", fontFamily: "'Source Sans 3', sans-serif" }}>
      <PageHeader title="Pricing" subtitle="Simple, honest pricing for every stage of your journey" />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-6">

        {/* Hero */}
        <div className="rounded-2xl p-5 text-white text-center" style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #2a4a8a 100%)" }}>
          <Crown size={32} color="#c9a84c" className="mx-auto mb-2" />
          <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Invest in Your Next Chapter
          </h1>
          <p className="text-sm opacity-90">
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="space-y-4">

          {/* Free Plan */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border-2" style={{ borderColor: "#e5e7eb" }}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold" style={{ color: "#1a2e5a", fontFamily: "'Playfair Display', serif" }}>Free</h2>
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#f3f4f6", color: "#6b7280" }}>Current Plan</span>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold" style={{ color: "#1a2e5a" }}>$0</span>
              <span className="text-sm" style={{ color: "#9ca3af" }}>/ forever</span>
            </div>
            <div className="space-y-2">
              {FREE_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check size={15} color="#059669" className="flex-shrink-0" />
                  <span className="text-sm" style={{ color: "#374151" }}>{f}</span>
                </div>
              ))}
              {PREMIUM_ONLY.map((f, i) => (
                <div key={i} className="flex items-center gap-2 opacity-40">
                  <X size={15} color="#9ca3af" className="flex-shrink-0" />
                  <span className="text-sm line-through" style={{ color: "#9ca3af" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Plan */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border-2" style={{ borderColor: "#1a2e5a" }}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold" style={{ color: "#1a2e5a", fontFamily: "'Playfair Display', serif" }}>Monthly Premium</h2>
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#eff4ff", color: "#1a2e5a" }}>Most Flexible</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold" style={{ color: "#1a2e5a" }}>$7.99</span>
              <span className="text-sm" style={{ color: "#9ca3af" }}>/ month</span>
            </div>
            <p className="text-xs mb-4" style={{ color: "#9ca3af" }}>Cancel anytime — no commitment</p>
            <div className="space-y-2 mb-5">
              {FREE_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check size={15} color="#059669" className="flex-shrink-0" />
                  <span className="text-sm" style={{ color: "#374151" }}>{f}</span>
                </div>
              ))}
              {PREMIUM_ONLY.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Crown size={15} color="#c9a84c" className="flex-shrink-0" />
                  <span className="text-sm font-medium" style={{ color: "#1a2e5a" }}>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleUpgrade("monthly")}
              disabled={loadingPlan === "monthly"}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
              style={{ background: "#1a2e5a", color: "white", opacity: loadingPlan === "monthly" ? 0.7 : 1 }}>
              {loadingPlan === "monthly"
                ? <><Loader2 size={16} className="animate-spin" /> Redirecting to checkout...</>
                : <><Zap size={16} /> Get Monthly Premium</>
              }
            </button>
          </div>

          {/* Lifetime Plan */}
          <div className="rounded-2xl p-5 shadow-sm border-2 relative overflow-hidden" style={{ borderColor: "#c9a84c", background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)" }}>
            {/* Best Value Badge */}
            <div className="absolute top-4 right-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: "#c9a84c" }}>
                BEST VALUE
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Star size={20} color="#c9a84c" fill="#c9a84c" />
              <h2 className="text-lg font-bold" style={{ color: "#1a2e5a", fontFamily: "'Playfair Display', serif" }}>Lifetime Access</h2>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold" style={{ color: "#1a2e5a" }}>$29.99</span>
              <span className="text-sm" style={{ color: "#9ca3af" }}>/ one-time</span>
            </div>
            <p className="text-xs mb-4" style={{ color: "#92400e" }}>
              Pay once. Access everything forever. Includes all future premium features.
            </p>
            <div className="space-y-2 mb-5">
              {FREE_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check size={15} color="#059669" className="flex-shrink-0" />
                  <span className="text-sm" style={{ color: "#374151" }}>{f}</span>
                </div>
              ))}
              {PREMIUM_ONLY.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Crown size={15} color="#c9a84c" className="flex-shrink-0" />
                  <span className="text-sm font-medium" style={{ color: "#1a2e5a" }}>{f}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Star size={15} color="#c9a84c" fill="#c9a84c" className="flex-shrink-0" />
                <span className="text-sm font-bold" style={{ color: "#92400e" }}>All future premium features — included free</span>
              </div>
            </div>
            <button
              onClick={() => handleUpgrade("lifetime")}
              disabled={loadingPlan === "lifetime"}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
              style={{ background: "#c9a84c", color: "#1a2e5a", opacity: loadingPlan === "lifetime" ? 0.7 : 1 }}>
              {loadingPlan === "lifetime"
                ? <><Loader2 size={16} className="animate-spin" /> Redirecting to checkout...</>
                : <><Star size={16} /> Get Lifetime Access — $29.99</>
              }
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <Shield size={20} color="#1a2e5a" className="mx-auto mb-1" />
              <p className="text-xs font-semibold" style={{ color: "#1a2e5a" }}>Secure Checkout</p>
              <p className="text-xs" style={{ color: "#9ca3af" }}>Powered by Stripe</p>
            </div>
            <div>
              <Zap size={20} color="#c9a84c" className="mx-auto mb-1" />
              <p className="text-xs font-semibold" style={{ color: "#1a2e5a" }}>Instant Access</p>
              <p className="text-xs" style={{ color: "#9ca3af" }}>Unlocks immediately</p>
            </div>
            <div>
              <Check size={20} color="#059669" className="mx-auto mb-1" />
              <p className="text-xs font-semibold" style={{ color: "#1a2e5a" }}>Cancel Anytime</p>
              <p className="text-xs" style={{ color: "#9ca3af" }}>No hidden fees</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: "#f0f0f0" }}>
            <h2 className="font-bold text-base" style={{ color: "#1a2e5a", fontFamily: "'Playfair Display', serif" }}>
              Frequently Asked Questions
            </h2>
          </div>
          {FAQ.map((item, i) => (
            <div key={i} className="border-b last:border-b-0" style={{ borderColor: "#f0f0f0" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-5 py-4 text-left flex items-start justify-between gap-3 transition-colors"
                style={{ background: openFaq === i ? "#f8f5f0" : "white" }}>
                <span className="text-sm font-semibold" style={{ color: "#1a2e5a" }}>{item.q}</span>
                {openFaq === i
                  ? <ChevronUp size={16} style={{ color: "#9ca3af", flexShrink: 0, marginTop: 2 }} />
                  : <ChevronDown size={16} style={{ color: "#9ca3af", flexShrink: 0, marginTop: 2 }} />
                }
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4" style={{ background: "#f8f5f0" }}>
                  <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="rounded-2xl p-5 text-center" style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #2a4a8a 100%)" }}>
          <p className="text-white text-sm font-medium mb-1">Still not sure?</p>
          <p className="text-white text-xs opacity-80 mb-3">
            Start with the free plan — all 13 core tools are yours at no cost, forever.
          </p>
          <p className="text-xs font-semibold" style={{ color: "#c9a84c" }}>
            "Built for the experienced. Designed for the future."
          </p>
        </div>

      </main>
      <PageFooter />
    </div>
  );
}
