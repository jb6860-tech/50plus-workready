/*
 * DESIGN: "Warm Authority" — Referral program with shareable link, stats, and reward tiers
 */
import { useLocation } from "wouter";
import { Gift, Share2, Users, Star, Crown, CheckCircle, Loader2, Copy, LogIn } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const REWARD_TIERS = [
  { count: 1, reward: "Warm thank-you shoutout in our community", icon: Star, color: "#6B7280" },
  { count: 3, reward: "1 free month of Premium access", icon: Crown, color: "#C9922A" },
  { count: 5, reward: "3 free months of Premium access", icon: Crown, color: "#C9922A" },
  { count: 10, reward: "Lifetime Premium access — FREE", icon: Gift, color: "#1B3A6B" },
];

export default function ReferralProgram() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: dashboard, isLoading } = trpc.account.dashboard.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const referralCode = dashboard?.referralCode ?? "";
  const referralStats = dashboard?.referralStats ?? { total: 0, rewarded: 0 };
  const referralUrl = referralCode ? `${window.location.origin}?ref=${referralCode}` : "";

  const handleShare = async () => {
    if (!referralUrl) return;
    const shareData = {
      title: "50+ WorkReady — Free Job Toolkit for Adults 50+",
      text: "I've been using this free job preparation app designed for adults 50+. It has resume tips, interview scripts, a scam job checker, and more. Check it out!",
      url: referralUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(referralUrl);
        toast.success("Referral link copied to clipboard!");
      }
    } catch { /* user cancelled */ }
  };

  const handleCopyCode = async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  // Not logged in
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="section-page">
        <PageHeader title="Referral Program" subtitle="Share the app and earn rewards" />
        <div className="px-4 py-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: "#EFF4FF" }}>
            <Gift size={36} className="text-[#1B3A6B]" />
          </div>
          <h2 className="text-xl font-bold text-[#1B3A6B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sign in to get your referral link
          </h2>
          <p className="text-sm text-[#6B7280] mb-6 leading-relaxed max-w-xs" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Create a free account to get your unique referral link and start earning rewards for every person you bring into the 50+ WorkReady community.
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

  if (authLoading || isLoading) {
    return (
      <div className="section-page">
        <PageHeader title="Referral Program" subtitle="Loading..." />
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-[#1B3A6B]" />
        </div>
      </div>
    );
  }

  const nextTier = REWARD_TIERS.find(t => t.count > referralStats.total);
  const referralsToNextTier = nextTier ? nextTier.count - referralStats.total : 0;

  return (
    <div className="section-page">
      <PageHeader title="Referral Program" subtitle="Share the app and earn rewards for growing our community" />

      <div className="px-4 py-5 flex flex-col gap-4">

        {/* Hero Banner */}
        <div
          className="rounded-2xl px-5 py-5 fade-up relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", boxShadow: "0 8px 24px rgba(27,58,107,0.2)" }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Gift size={22} className="text-[#E8B84B]" />
            </div>
            <div>
              <p className="font-bold text-white text-base leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Refer & Earn Rewards
              </p>
              <p className="text-xs text-blue-100 mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Every referral helps another adult 50+ find the tools they deserve
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 relative z-10">
            <div className="rounded-xl px-3 py-3 text-center" style={{ background: "rgba(255,255,255,0.12)" }}>
              <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{referralStats.total}</p>
              <p className="text-xs text-blue-200 mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>People Referred</p>
            </div>
            <div className="rounded-xl px-3 py-3 text-center" style={{ background: "rgba(201,146,42,0.3)" }}>
              <p className="text-3xl font-bold text-[#E8B84B]" style={{ fontFamily: "'Playfair Display', serif" }}>{referralStats.rewarded}</p>
              <p className="text-xs text-blue-200 mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Rewards Earned</p>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="rounded-xl px-4 py-4 fade-up" style={{ background: "#FDF8F0", border: "1.5px solid #E8D9C0" }}>
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} fill="#C9922A" className="text-[#C9922A]" />
              <p className="text-xs font-bold text-[#C9922A] uppercase tracking-wide" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Next Reward</p>
            </div>
            <p className="text-sm font-semibold text-[#1B3A6B] mb-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {nextTier.reward}
            </p>
            <p className="text-xs text-[#6B7280] mb-3" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Refer <strong>{referralsToNextTier} more {referralsToNextTier === 1 ? "person" : "people"}</strong> to unlock this reward
            </p>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#E5E7EB" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((referralStats.total / nextTier.count) * 100, 100)}%`, background: "linear-gradient(90deg, #C9922A, #E8B84B)" }}
              />
            </div>
            <p className="text-xs text-[#9CA3AF] mt-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {referralStats.total} / {nextTier.count} referrals
            </p>
          </div>
        )}

        {/* Referral Link Card */}
        <div className="rounded-xl overflow-hidden fade-up" style={{ border: "1.5px solid #E5E7EB", background: "white", boxShadow: "0 3px 12px rgba(0,0,0,0.07)" }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#EFF4FF" }}>
            <Share2 size={15} className="text-[#1B3A6B]" />
            <p className="font-bold text-sm text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Your Referral Link</p>
          </div>
          <div className="px-4 py-4">
            {referralCode ? (
              <>
                <div className="rounded-lg px-3 py-2.5 mb-3 flex items-center gap-2" style={{ background: "#F3F4F6", border: "1px solid #E5E7EB" }}>
                  <p className="flex-1 text-xs font-mono text-[#4A4A4A] truncate">{referralUrl}</p>
                  <button onClick={handleCopyCode} className="flex-shrink-0 p-1.5 rounded-lg" style={{ background: "#1B3A6B" }}>
                    <Copy size={12} className="text-white" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-xs text-[#6B7280]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Your code:</p>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono" style={{ background: "#1B3A6B", color: "white" }}>{referralCode}</span>
                </div>
                <button
                  onClick={handleShare}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #C9922A 0%, #E8B84B 100%)", fontFamily: "'Source Sans 3', sans-serif", boxShadow: "0 4px 12px rgba(201,146,42,0.3)" }}
                >
                  <Share2 size={15} />
                  Share My Referral Link
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={20} className="animate-spin text-[#1B3A6B]" />
              </div>
            )}
          </div>
        </div>

        {/* Reward Tiers */}
        <div className="rounded-xl overflow-hidden fade-up" style={{ border: "1.5px solid #E5E7EB", background: "white", boxShadow: "0 3px 12px rgba(0,0,0,0.07)" }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#F9FAFB" }}>
            <Crown size={15} className="text-[#C9922A]" />
            <p className="font-bold text-sm text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Reward Tiers</p>
          </div>
          <div className="px-4 py-3 flex flex-col gap-3">
            {REWARD_TIERS.map((tier) => {
              const Icon = tier.icon;
              const achieved = referralStats.total >= tier.count;
              return (
                <div key={tier.count} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: achieved ? tier.color : "#F3F4F6" }}>
                    {achieved ? (
                      <CheckCircle size={18} className="text-white" />
                    ) : (
                      <Icon size={18} style={{ color: tier.color }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {tier.count} {tier.count === 1 ? "Referral" : "Referrals"}
                    </p>
                    <p className="text-xs text-[#6B7280] leading-snug" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {tier.reward}
                    </p>
                  </div>
                  {achieved && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "#D1FAE5", color: "#065F46", fontFamily: "'Source Sans 3', sans-serif" }}>
                      Earned!
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sharing Tips */}
        <div className="rounded-xl px-4 py-4 fade-up" style={{ background: "#EFF4FF", border: "1px solid #C5D5F0" }}>
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-[#1B3A6B]" />
            <p className="text-xs font-bold text-[#1B3A6B] uppercase tracking-wide" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Where to Share</p>
          </div>
          <div className="flex flex-col gap-2">
            {[
              "Facebook groups for job seekers 50+",
              "AARP community forums and local chapters",
              "LinkedIn posts and direct messages",
              "Church, community center, or neighborhood groups",
              "Text message to a friend who's job searching",
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#C9922A" }} />
                <p className="text-xs text-[#4A4A4A]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
      <PageFooter />
    </div>
  );
}
