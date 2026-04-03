/*
 * DESIGN: "Warm Authority" — Admin-only secure dashboard with stats, user list, and story moderation
 */
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Users, Crown, DollarSign, MessageSquare, CheckCircle, XCircle,
  Clock, TrendingUp, Shield, Loader2, LogIn, ChevronDown, ChevronUp
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ElementType; label: string; value: string | number; color: string; sub?: string;
}) {
  return (
    <div className="rounded-xl px-4 py-4 flex items-center gap-3" style={{ background: "white", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: color + "18" }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: "#1B3A6B", fontFamily: "'Playfair Display', serif" }}>{value}</p>
        <p className="text-xs font-semibold text-[#6B7280]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{label}</p>
        {sub && <p className="text-xs text-[#9CA3AF]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "stories">("overview");
  const [expandedStory, setExpandedStory] = useState<number | null>(null);

  const { data: stats, isLoading, refetch } = trpc.admin.stats.useQuery(undefined, {
    enabled: isAuthenticated && (user as any)?.role === "admin",
    retry: false,
  });

  const approveMutation = trpc.admin.approveStory.useMutation({
    onSuccess: () => { toast.success("Story approved!"); refetch(); },
    onError: () => toast.error("Failed to approve story"),
  });
  const rejectMutation = trpc.admin.rejectStory.useMutation({
    onSuccess: () => { toast.success("Story rejected."); refetch(); },
    onError: () => toast.error("Failed to reject story"),
  });

  if (authLoading) {
    return (
      <div className="section-page">
        <PageHeader title="Admin Dashboard" subtitle="Loading..." />
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-[#1B3A6B]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="section-page">
        <PageHeader title="Admin Dashboard" subtitle="Secure access required" />
        <div className="px-4 py-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: "#FEE2E2" }}>
            <Shield size={36} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#1B3A6B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Sign In Required</h2>
          <p className="text-sm text-[#6B7280] mb-6 max-w-xs" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            This page is restricted to authorized administrators only.
          </p>
          <a href={getLoginUrl()} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", fontFamily: "'Source Sans 3', sans-serif" }}>
            <LogIn size={16} />Sign In
          </a>
        </div>
        <PageFooter />
      </div>
    );
  }

  if ((user as any)?.role !== "admin") {
    return (
      <div className="section-page">
        <PageHeader title="Admin Dashboard" subtitle="Access Denied" />
        <div className="px-4 py-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: "#FEE2E2" }}>
            <Shield size={36} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#1B3A6B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Access Denied</h2>
          <p className="text-sm text-[#6B7280] mb-6 max-w-xs" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            This page is restricted to administrators only. If you believe this is an error, please contact support.
          </p>
          <button onClick={() => navigate("/")} className="px-6 py-3 rounded-xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", fontFamily: "'Source Sans 3', sans-serif" }}>
            Return Home
          </button>
        </div>
        <PageFooter />
      </div>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className="section-page">
        <PageHeader title="Admin Dashboard" subtitle="Loading data..." />
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-[#1B3A6B]" />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "stories", label: `Stories${stats.pendingStories > 0 ? ` (${stats.pendingStories})` : ""}` },
  ] as const;

  return (
    <div className="section-page">
      <PageHeader title="Admin Dashboard" subtitle="Business overview and content moderation" />

      {/* Admin Badge */}
      <div className="mx-4 mt-4 rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)" }}>
        <Shield size={16} className="text-[#E8B84B]" />
        <p className="text-sm font-bold text-white" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          Admin Access — {(user as any)?.name || "Administrator"}
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex mx-4 mt-4 rounded-xl overflow-hidden" style={{ border: "1.5px solid #E5E7EB" }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2.5 text-xs font-bold transition-all duration-200"
            style={{
              fontFamily: "'Source Sans 3', sans-serif",
              background: activeTab === tab.id ? "#1B3A6B" : "white",
              color: activeTab === tab.id ? "white" : "#6B7280",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {/* Revenue Highlight */}
            <div className="rounded-2xl px-5 py-5 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #C9922A 0%, #E8B84B 100%)", boxShadow: "0 8px 24px rgba(201,146,42,0.25)" }}>
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-15" style={{ background: "white", transform: "translate(30%, -30%)" }} />
              <div className="flex items-center gap-2 mb-1 relative z-10">
                <TrendingUp size={16} className="text-white" />
                <p className="text-xs font-semibold text-white/80 uppercase tracking-widest" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Estimated Revenue</p>
              </div>
              <p className="text-4xl font-bold text-white relative z-10" style={{ fontFamily: "'Playfair Display', serif" }}>
                ${stats.estimatedRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-white/70 mt-1 relative z-10" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Based on active subscriptions + lifetime purchases
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="#1B3A6B" />
              <StatCard icon={Crown} label="Premium Members" value={stats.totalPremium} color="#C9922A" sub={`${stats.activeSubscribers} monthly · ${stats.lifetimeMembers} lifetime`} />
              <StatCard icon={MessageSquare} label="Approved Stories" value={stats.approvedStories} color="#2A5298" />
              <StatCard icon={Clock} label="Pending Stories" value={stats.pendingStories} color={stats.pendingStories > 0 ? "#EF4444" : "#6B7280"} />
            </div>

            {/* Recent Subscriptions */}
            {stats.recentSubscriptions.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid #E5E7EB", background: "white" }}>
                <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#F9FAFB" }}>
                  <Crown size={14} className="text-[#C9922A]" />
                  <p className="font-bold text-sm text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Recent Subscriptions</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {stats.recentSubscriptions.map((sub) => (
                    <div key={sub.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>User #{sub.userId}</p>
                        <p className="text-xs text-[#9CA3AF]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: sub.status === "active" ? "#D1FAE5" : "#FEE2E2",
                          color: sub.status === "active" ? "#065F46" : "#991B1B",
                          fontFamily: "'Source Sans 3', sans-serif"
                        }}>
                        {sub.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid #E5E7EB", background: "white" }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#F9FAFB" }}>
              <Users size={14} className="text-[#1B3A6B]" />
              <p className="font-bold text-sm text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Recent Users ({stats.totalUsers} total)</p>
            </div>
            {stats.recentUsers.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-[#9CA3AF]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>No users yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {stats.recentUsers.map((u) => (
                  <div key={u.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                        {u.name || "Anonymous User"}
                      </p>
                      {u.role === "admin" && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#1B3A6B", color: "white", fontFamily: "'Source Sans 3', sans-serif" }}>
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {u.email || "No email"} · Joined {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-[#9CA3AF]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      Last active: {new Date(u.lastSignedIn).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STORIES TAB */}
        {activeTab === "stories" && (
          <>
            {stats.pendingStories > 0 && (
              <div className="rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: "#FEF3C7", border: "1px solid #FCD34D" }}>
                <Clock size={14} className="text-amber-600" />
                <p className="text-sm font-semibold text-amber-800" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  {stats.pendingStories} {stats.pendingStories === 1 ? "story" : "stories"} awaiting moderation
                </p>
              </div>
            )}
            {stats.pendingStoriesList.length === 0 ? (
              <div className="rounded-xl px-4 py-8 text-center" style={{ background: "white", border: "1.5px solid #E5E7EB" }}>
                <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>All caught up!</p>
                <p className="text-xs text-[#9CA3AF] mt-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>No stories pending review</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.pendingStoriesList.map((story) => (
                  <div key={story.id} className="rounded-xl overflow-hidden" style={{ border: "1.5px solid #FCD34D", background: "white" }}>
                    <div className="px-4 py-3 flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          {story.name}{story.age ? `, ${story.age}` : ""}
                        </p>
                        <p className="text-xs text-[#6B7280]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          {story.role}{story.company ? ` at ${story.company}` : ""}
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          Submitted {new Date(story.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
                        className="flex-shrink-0 p-1"
                      >
                        {expandedStory === story.id
                          ? <ChevronUp size={16} className="text-[#6B7280]" />
                          : <ChevronDown size={16} className="text-[#6B7280]" />}
                      </button>
                    </div>
                    {expandedStory === story.id && (
                      <div className="px-4 pb-3">
                        <p className="text-xs text-[#4A4A4A] leading-relaxed mb-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          {story.story}
                        </p>
                        {story.tip && (
                          <p className="text-xs italic text-[#6B7280] mb-3" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                            Tip: {story.tip}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveMutation.mutate({ storyId: story.id })}
                            disabled={approveMutation.isPending}
                            className="flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5"
                            style={{ background: "#D1FAE5", color: "#065F46", fontFamily: "'Source Sans 3', sans-serif" }}
                          >
                            <CheckCircle size={13} />
                            Approve
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate({ storyId: story.id })}
                            disabled={rejectMutation.isPending}
                            className="flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5"
                            style={{ background: "#FEE2E2", color: "#991B1B", fontFamily: "'Source Sans 3', sans-serif" }}
                          >
                            <XCircle size={13} />
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
      <PageFooter />
    </div>
  );
}
