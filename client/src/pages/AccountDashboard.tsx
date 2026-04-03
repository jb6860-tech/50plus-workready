/*
 * DESIGN: "Warm Authority" — User account hub with premium status card,
 * Stripe portal link, referral stats, and quick navigation to premium content.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Crown, User, CreditCard, Star, Share2, LogIn, Loader2, ExternalLink, CheckCircle, Clock, XCircle, Gift, Linkedin } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

function formatDate(ts: number | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function AccountDashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: dashboard, isLoading } = trpc.account.dashboard.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createPortal = trpc.account.createPortalSession.useMutation({
    onSuccess: ({ url }) => {
      if (url) window.open(url, "_blank");
    },
    onError: () => toast.error("Could not open billing portal. Please try again."),
    onSettled: () => setPortalLoading(false),
  });

  const createSubscriptionCheckout = trpc.premium.createSubscriptionCheckout.useMutation({
    onSuccess: ({ url }) => { if (url) window.open(url, "_blank"); },
    onError: () => toast.error("Could not start checkout. Please try again."),
  });

  const handleManageBilling = () => {
    setPortalLoading(true);
    createPortal.mutate({ origin: window.location.origin });
  };

  const handleUpgrade = () => {
    createSubscriptionCheckout.mutate({ origin: window.location.origin });
  };

  const handleCopyReferral = async () => {
    if (!dashboard?.referralCode) return;
    const url = `${window.location.origin}?ref=${dashboard.referralCode}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join 50+ WorkReady",
          text: "I've been using this free job toolkit designed for adults 50+. Check it out!",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Referral link copied to clipboard!");
      }
    } catch { /* user cancelled */ }
  };

  // Not logged in
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="section-page">
        <PageHeader title="My Account" subtitle="Sign in to access your dashboard" />
        <div className="px-4 py-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: "#EFF4FF" }}>
            <User size={36} className="text-[#1B3A6B]" />
          </div>
          <h2 className="text-xl font-bold text-[#1B3A6B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sign in to view your account
          </h2>
          <p className="text-sm text-[#6B7280] mb-6 leading-relaxed max-w-xs" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Create a free account to track your premium status, manage your subscription, and access your referral program.
          </p>
          <a
            href={getLoginUrl()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", fontFamily: "'Source Sans 3', sans-serif", boxShadow: "0 4px 14px rgba(27,58,107,0.25)" }}
          >
            <LogIn size={16} />
            Sign In / Create Account
          </a>
        </div>
        <PageFooter />
      </div>
    );
  }

  // Loading
  if (authLoading || isLoading) {
    return (
      <div className="section-page">
        <PageHeader title="My Account" subtitle="Loading your dashboard..." />
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-[#1B3A6B]" />
        </div>
      </div>
    );
  }

  const isPremium = dashboard?.isPremium ?? false;
  const hasLifetime = dashboard?.hasLifetime ?? false;
  const sub = dashboard?.subscription;
  const referralCode = dashboard?.referralCode ?? "";
  const referralStats = dashboard?.referralStats ?? { total: 0, rewarded: 0 };

  const subStatusColor = sub?.status === "active" ? "#16A34A" : sub?.status === "canceled" ? "#DC2626" : "#C9922A";
  const subStatusIcon = sub?.status === "active" ? CheckCircle : sub?.status === "canceled" ? XCircle : Clock;
  const SubStatusIcon = subStatusIcon;

  return (
    <div className="section-page">
      <PageHeader title="My Account" subtitle="Manage your subscription and referrals" />

      <div className="px-4 py-5 flex flex-col gap-4">

        {/* Profile Card */}
        <div className="rounded-2xl px-5 py-5 fade-up" style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", boxShadow: "0 8px 24px rgba(27,58,107,0.2)" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)", fontFamily: "'Playfair Display', serif" }}>
              {(dashboard?.user?.name || user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-base leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {dashboard?.user?.name || user?.name || "Welcome!"}
              </p>
              <p className="text-xs text-blue-200 mt-0.5 truncate" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                {dashboard?.user?.email || user?.email || ""}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                {isPremium ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: "#C9922A", color: "white", fontFamily: "'Source Sans 3', sans-serif" }}>
                    <Crown size={11} /> {hasLifetime ? "Lifetime Member" : "Premium Member"}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(255,255,255,0.15)", color: "white", fontFamily: "'Source Sans 3', sans-serif" }}>
                    <User size={11} /> Free Member
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Status Card */}
        <div className="rounded-xl overflow-hidden fade-up" style={{ border: isPremium ? "1.5px solid #C9922A" : "1.5px solid #E5E7EB", background: "white", boxShadow: "0 3px 12px rgba(0,0,0,0.07)" }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: isPremium ? "linear-gradient(135deg, #FDF8F0 0%, #FFF9EC 100%)" : "#F9FAFB" }}>
            <Crown size={16} style={{ color: isPremium ? "#C9922A" : "#9CA3AF" }} />
            <p className="font-bold text-sm" style={{ color: isPremium ? "#C9922A" : "#6B7280", fontFamily: "'Source Sans 3', sans-serif" }}>
              {isPremium ? "Premium Access Active" : "Free Plan"}
            </p>
          </div>
          <div className="px-4 py-4">
            {isPremium ? (
              <>
                {hasLifetime ? (
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                    <p className="text-sm text-[#2D2D2D]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      <strong>Lifetime Access</strong> — you never need to renew.
                    </p>
                  </div>
                ) : sub ? (
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <SubStatusIcon size={15} style={{ color: subStatusColor }} className="flex-shrink-0" />
                      <p className="text-sm text-[#2D2D2D]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                        Subscription: <strong style={{ color: subStatusColor }}>{sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}</strong>
                      </p>
                    </div>
                    {sub.currentPeriodEnd && (
                      <p className="text-xs text-[#6B7280] pl-6" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                        {sub.status === "active" ? "Renews" : "Access until"}: {formatDate(sub.currentPeriodEnd)}
                      </p>
                    )}
                  </div>
                ) : null}

                {/* Premium Features List */}
                <div className="flex flex-col gap-1.5 mb-4">
                  {["Bonus Interview Scripts (10 advanced Q&As)", "LinkedIn Profile Optimization Guide", "All future premium content"].map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <Star size={12} fill="#C9922A" className="text-[#C9922A] flex-shrink-0" />
                      <p className="text-xs text-[#4A4A4A]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{f}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  {!hasLifetime && sub?.status === "active" && (
                    <button
                      onClick={handleManageBilling}
                      disabled={portalLoading}
                      className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: "#1B3A6B", color: "white", fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      {portalLoading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                      Manage Billing & Subscription
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/bonus-scripts")}
                    className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: "#FDF8F0", color: "#C9922A", border: "1.5px solid #E8D9C0", fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    <Crown size={14} />
                    View Bonus Interview Scripts
                  </button>
                  <button
                    onClick={() => navigate("/linkedin-guide")}
                    className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: "#EFF4FF", color: "#1B3A6B", border: "1.5px solid #C5D5F0", fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    <Linkedin size={14} />
                    View LinkedIn Profile Guide
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-[#4A4A4A] mb-3 leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Upgrade to Premium to unlock exclusive content designed to give you a competitive edge in your job search.
                </p>
                <div className="flex flex-col gap-1.5 mb-4">
                  {["Bonus Interview Scripts (10 advanced Q&As)", "LinkedIn Profile Optimization Guide", "All future premium content"].map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <Crown size={12} className="text-[#C9922A] flex-shrink-0" />
                      <p className="text-xs text-[#4A4A4A]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{f}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleUpgrade}
                  disabled={createSubscriptionCheckout.isPending}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #C9922A 0%, #E8B84B 100%)", fontFamily: "'Source Sans 3', sans-serif", boxShadow: "0 4px 12px rgba(201,146,42,0.3)" }}
                >
                  {createSubscriptionCheckout.isPending ? <Loader2 size={14} className="animate-spin" /> : <Crown size={14} />}
                  Upgrade to Premium — $7.99/mo
                </button>
                <p className="text-center text-xs text-[#9CA3AF] mt-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Or get <button onClick={() => navigate("/bonus-scripts")} className="underline text-[#C9922A]">lifetime access for $29.99</button>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Referral Program Card */}
        <div className="rounded-xl overflow-hidden fade-up" style={{ border: "1.5px solid #E5E7EB", background: "white", boxShadow: "0 3px 12px rgba(0,0,0,0.07)" }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: "linear-gradient(135deg, #EFF4FF 0%, #F0FDF4 100%)" }}>
            <Gift size={16} className="text-[#1B3A6B]" />
            <p className="font-bold text-sm text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Referral Program</p>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-[#4A4A4A] mb-3 leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Share 50+ WorkReady with friends and colleagues. Every person you refer helps grow our community of empowered job seekers 50+.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl px-3 py-3 text-center" style={{ background: "#EFF4FF" }}>
                <p className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: "'Playfair Display', serif" }}>{referralStats.total}</p>
                <p className="text-xs text-[#6B7280] mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>People Referred</p>
              </div>
              <div className="rounded-xl px-3 py-3 text-center" style={{ background: "#FDF8F0" }}>
                <p className="text-2xl font-bold text-[#C9922A]" style={{ fontFamily: "'Playfair Display', serif" }}>{referralStats.rewarded}</p>
                <p className="text-xs text-[#6B7280] mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Rewards Earned</p>
              </div>
            </div>

            {/* Referral Link */}
            {referralCode && (
              <div className="rounded-lg px-3 py-2.5 mb-3 flex items-center gap-2" style={{ background: "#F3F4F6", border: "1px solid #E5E7EB" }}>
                <p className="flex-1 text-xs font-mono text-[#4A4A4A] truncate">
                  {window.location.origin}?ref={referralCode}
                </p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#1B3A6B", color: "white", fontFamily: "'Source Sans 3', sans-serif" }}>
                  {referralCode}
                </span>
              </div>
            )}

            <button
              onClick={handleCopyReferral}
              className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", color: "white", fontFamily: "'Source Sans 3', sans-serif", boxShadow: "0 4px 12px rgba(27,58,107,0.2)" }}
            >
              <Share2 size={14} />
              Share My Referral Link
            </button>

            <div className="mt-3 rounded-lg px-3 py-2.5" style={{ background: "#FDF8F0", border: "1px solid #E8D9C0" }}>
              <p className="text-xs font-semibold text-[#C9922A] mb-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>How it works</p>
              <p className="text-xs text-[#6B7280] leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Share your unique link. When someone joins using your link, it counts as a referral. Future rewards (discounts, free months) will be applied automatically to your account.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-xl px-4 py-4 fade-up" style={{ background: "white", border: "1.5px solid #E5E7EB", boxShadow: "0 3px 12px rgba(0,0,0,0.07)" }}>
          <p className="font-bold text-sm text-[#1B3A6B] mb-3" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Quick Access</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Bonus Scripts", path: "/bonus-scripts", icon: Crown, color: "#C9922A" },
              { label: "LinkedIn Guide", path: "/linkedin-guide", icon: Linkedin, color: "#0077B5" },
              { label: "Referral Program", path: "/referral", icon: Gift, color: "#1B3A6B" },
              { label: "Job Tracker", path: "/job-tracker", icon: ExternalLink, color: "#2A5298" },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left"
                  style={{ background: "#F9FAFB", color: "#1B3A6B", border: "1px solid #E5E7EB", fontFamily: "'Source Sans 3', sans-serif" }}>
                  <Icon size={14} style={{ color: item.color, flexShrink: 0 }} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>
      <PageFooter />
    </div>
  );
}
