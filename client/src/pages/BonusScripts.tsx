/**
 * Bonus Interview Scripts — Premium gated content
 * Shows a paywall for non-premium users, full content for premium users.
 */
import { useState } from "react";
import { Crown, Lock, ChevronDown, ChevronUp, Star, CheckCircle, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import PageFooter from "@/components/PageFooter";

const BONUS_SCRIPTS = [
  {
    id: 1,
    category: "Age & Experience",
    question: "Aren't you overqualified for this position?",
    script: `"That's a great question, and I appreciate you raising it directly. I've intentionally chosen this role because it aligns with what I want to focus on at this stage of my career. I'm not looking to climb a ladder — I'm looking to contribute meaningfully, bring my experience to a team that values it, and do excellent work without the stress of constant advancement pressure. I see that as an asset to you, not a limitation."`,
    tip: "Reframe 'overqualified' as 'intentionally focused.' Employers fear you'll leave — reassure them of your commitment.",
    color: "#1B3A6B",
  },
  {
    id: 2,
    category: "Age & Experience",
    question: "How do you feel about working with a younger manager?",
    script: `"I genuinely enjoy it. In my experience, the best teams are multigenerational — younger managers often bring fresh perspectives and energy, and I bring institutional knowledge and pattern recognition from years in the field. I've always believed that learning goes both ways. I'm not here to compete with anyone; I'm here to collaborate and help the team succeed."`,
    tip: "Never show defensiveness. Demonstrate genuine openness and position yourself as a collaborative team player.",
    color: "#2A5298",
  },
  {
    id: 3,
    category: "Technology & Adaptability",
    question: "How do you keep up with rapidly changing technology?",
    script: `"I actually enjoy learning new tools — it keeps the work interesting. Over the past few years I've taught myself [specific tools relevant to the role], completed online courses in [relevant area], and I make it a habit to stay current through [newsletters, communities, or practice]. I've found that my experience actually helps me learn new technology faster because I understand the underlying business problems the tools are trying to solve."`,
    tip: "Always name specific tools or platforms you've learned recently. Vague answers undermine credibility.",
    color: "#C9922A",
  },
  {
    id: 4,
    category: "Technology & Adaptability",
    question: "Are you comfortable with remote work and digital collaboration tools?",
    script: `"Absolutely. I've been working effectively in remote and hybrid environments and I'm comfortable with tools like Zoom, Slack, Microsoft Teams, Google Workspace, and project management platforms like Asana or Trello. I've found that clear communication and proactive check-ins are the keys to making remote work successful, and those are habits I've built deliberately."`,
    tip: "List specific tools by name. If you haven't used one they mention, say 'I haven't used that one yet, but I pick up new platforms quickly — what's the learning curve like?'",
    color: "#1B3A6B",
  },
  {
    id: 5,
    category: "Career Transitions",
    question: "Why are you making a career change at this stage?",
    script: `"I see it less as a change and more as a refinement. Throughout my career I've built skills in [relevant areas], and this role is actually a natural extension of what I've been moving toward. I've reached a point where I know exactly what kind of work energizes me and where I add the most value — and this position fits that profile precisely. I'm not starting over; I'm starting from a place of clarity."`,
    tip: "Connect your past to this role with a clear narrative thread. Avoid phrases like 'trying something new' — they signal uncertainty.",
    color: "#2A5298",
  },
  {
    id: 6,
    category: "Career Transitions",
    question: "You've been self-employed / freelancing. Can you work in a structured environment?",
    script: `"Running my own work has actually made me more disciplined, not less. I've had to set my own deadlines, manage client expectations, prioritize competing demands, and deliver results without anyone looking over my shoulder. If anything, I've developed a stronger sense of accountability than I might have in a traditional role. I'm genuinely looking forward to collaborating with a team again and contributing to something larger than individual projects."`,
    tip: "Freelancing is not a weakness — it demonstrates initiative, self-management, and client skills. Own it confidently.",
    color: "#C9922A",
  },
  {
    id: 7,
    category: "Salary & Benefits",
    question: "What are your salary expectations?",
    script: `"Based on my research into the market rate for this role in this area, and given my [X] years of experience, I'm targeting a range of [your range]. That said, I'm open to a conversation about the full compensation package — including benefits, flexibility, and growth opportunities — because I'm looking for the right fit overall, not just the highest number."`,
    tip: "Always give a range, not a single number. Anchor high within reason. Research Glassdoor, LinkedIn Salary, and Indeed before the interview.",
    color: "#1B3A6B",
  },
  {
    id: 8,
    category: "Salary & Benefits",
    question: "We were expecting someone at a lower salary range. Can you be flexible?",
    script: `"I appreciate your transparency. My range reflects the value I bring — [X years of experience, specific skills, track record]. That said, I'm genuinely interested in this role and I'm open to a conversation. Could you share more about the full package, including benefits, flexibility, and any performance-based increases? I want to find a number that works for both of us."`,
    tip: "Never immediately drop your number. Ask about the full package first — sometimes benefits, remote work, or bonuses close the gap.",
    color: "#2A5298",
  },
  {
    id: 9,
    category: "Handling Rejection",
    question: "We've decided to go in a different direction. Do you have any questions?",
    script: `"Thank you for letting me know, and for taking the time to meet with me. I genuinely enjoyed learning about the team and the role. If you're open to it, I'd really appreciate any feedback on my candidacy — it would help me in my search. And if circumstances change or a similar role opens up, I'd welcome the chance to reconnect."`,
    tip: "Always ask for feedback — most candidates don't, and it sets you apart. It also keeps the door open for future opportunities.",
    color: "#C9922A",
  },
  {
    id: 10,
    category: "Closing Strong",
    question: "Do you have any questions for us?",
    script: `"Yes — a few. First, what does success look like in this role in the first 90 days? Second, what are the biggest challenges the person in this position will face? And third — what do you personally enjoy most about working here? I always find that question tells me more about a company than any job description."`,
    tip: "Never say 'No, I think you've covered everything.' Always have 2–3 thoughtful questions ready. The third question builds genuine rapport.",
    color: "#1B3A6B",
  },
];

const CATEGORIES = Array.from(new Set(BONUS_SCRIPTS.map(s => s.category)));

export default function BonusScripts() {
  const { user, isAuthenticated } = useAuth();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Check premium status
  const { data: premiumData, isLoading: premiumLoading } = trpc.premium.status.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const isPremium = premiumData?.isPremium ?? false;

  // Stripe checkout mutations
  const subscriptionCheckout = trpc.premium.createSubscriptionCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to secure checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: () => toast.error("Could not start checkout. Please try again."),
  });

  const lifetimeCheckout = trpc.premium.createLifetimeCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to secure checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: () => toast.error("Could not start checkout. Please try again."),
  });

  const handleSubscribe = () => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    subscriptionCheckout.mutate({ origin: window.location.origin });
  };

  const handleLifetime = () => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    lifetimeCheckout.mutate({ origin: window.location.origin });
  };

  const filtered = activeCategory === "All"
    ? BONUS_SCRIPTS
    : BONUS_SCRIPTS.filter(s => s.category === activeCategory);

  // ---- Paywall ----
  if (!isAuthenticated || (!premiumLoading && !isPremium)) {
    return (
      <div className="section-page" style={{ background: "#FDF8F0" }}>
        {/* Header */}
        <div className="px-5 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Crown size={18} className="text-[#E8B84B]" />
            <span className="text-xs font-bold tracking-widest uppercase text-[#E8B84B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Premium Content
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Bonus Interview Scripts
          </h1>
          <p className="text-sm text-blue-200" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            10 advanced scripts for the toughest questions — crafted specifically for adults 50+
          </p>
        </div>

        {/* Preview — show 2 locked cards */}
        <div className="px-4 mt-5">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Preview (2 of 10)
          </p>
          {BONUS_SCRIPTS.slice(0, 2).map(script => (
            <div key={script.id} className="tip-card mb-3 relative overflow-hidden" style={{ borderLeftColor: script.color }}>
              <div className="absolute inset-0 backdrop-blur-sm bg-white/60 flex items-center justify-center z-10 rounded-xl">
                <div className="flex flex-col items-center gap-1">
                  <Lock size={20} style={{ color: script.color }} />
                  <span className="text-xs font-bold" style={{ color: script.color, fontFamily: "'Source Sans 3', sans-serif" }}>Premium Only</span>
                </div>
              </div>
              <div className="opacity-30">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white mb-2 inline-block" style={{ background: script.color, fontFamily: "'Source Sans 3', sans-serif" }}>
                  {script.category}
                </span>
                <p className="font-bold text-sm text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{script.question}</p>
                <p className="text-xs text-[#6B7280] mt-1 line-clamp-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{script.script}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="px-4 mt-5">
          <h2 className="text-base font-bold text-[#1B3A6B] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Unlock All 10 Bonus Scripts
          </h2>
          <p className="text-xs text-[#6B7280] mb-4" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Choose the plan that works best for you. Cancel anytime.
          </p>

          {/* Monthly */}
          <div className="rounded-2xl p-4 mb-3 border-2" style={{ background: "white", borderColor: "#1B3A6B" }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Star size={14} fill="#C9922A" className="text-[#C9922A]" />
                  <span className="text-xs font-bold text-[#C9922A] uppercase tracking-wide" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Most Popular</span>
                </div>
                <p className="font-bold text-[#1B3A6B] text-base" style={{ fontFamily: "'Playfair Display', serif" }}>Monthly Premium</p>
                <p className="text-xs text-[#6B7280]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Cancel anytime</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: "'Playfair Display', serif" }}>$7.99</p>
                <p className="text-xs text-[#6B7280]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>/month</p>
              </div>
            </div>
            <ul className="mb-3 space-y-1">
              {["All 10 Bonus Interview Scripts", "Coaching tips for each answer", "All future premium content", "Cancel anytime"].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-[#374151]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  <CheckCircle size={13} className="text-green-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={handleSubscribe}
              disabled={subscriptionCheckout.isPending}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-95 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {subscriptionCheckout.isPending ? "Loading..." : isAuthenticated ? "Start Monthly Plan — $7.99/mo" : "Sign In to Subscribe"}
            </button>
          </div>

          {/* Lifetime */}
          <div className="rounded-2xl p-4 mb-4 border" style={{ background: "linear-gradient(135deg, #FDF3E0 0%, #FEF9F0 100%)", borderColor: "#C9922A" }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Sparkles size={14} className="text-[#C9922A]" />
                  <span className="text-xs font-bold text-[#C9922A] uppercase tracking-wide" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Best Value</span>
                </div>
                <p className="font-bold text-[#1B3A6B] text-base" style={{ fontFamily: "'Playfair Display', serif" }}>Lifetime Access</p>
                <p className="text-xs text-[#6B7280]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>One-time payment, forever</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#C9922A]" style={{ fontFamily: "'Playfair Display', serif" }}>$29.99</p>
                <p className="text-xs text-[#6B7280]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>one-time</p>
              </div>
            </div>
            <button
              onClick={handleLifetime}
              disabled={lifetimeCheckout.isPending}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #C9922A 0%, #E8B84B 100%)", color: "white", fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {lifetimeCheckout.isPending ? "Loading..." : isAuthenticated ? "Get Lifetime Access — $29.99" : "Sign In to Purchase"}
            </button>
          </div>

          <p className="text-center text-xs text-[#9CA3AF] mb-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            🔒 Secure checkout powered by Stripe. Use card 4242 4242 4242 4242 to test.
          </p>
        </div>

        <PageFooter />
      </div>
    );
  }

  // ---- Premium Content ----
  return (
    <div className="section-page" style={{ background: "#FDF8F0" }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-5" style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Crown size={18} className="text-[#E8B84B]" />
          <span className="text-xs font-bold tracking-widest uppercase text-[#E8B84B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Premium — Unlocked
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          Bonus Interview Scripts
        </h1>
        <p className="text-sm text-blue-200" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {BONUS_SCRIPTS.length} advanced scripts with coaching tips — for the questions that trip most people up.
        </p>
      </div>

      {/* Category Filter */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {["All", ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200"
              style={{
                background: activeCategory === cat ? "#1B3A6B" : "#EFF4FF",
                color: activeCategory === cat ? "white" : "#1B3A6B",
                fontFamily: "'Source Sans 3', sans-serif",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scripts */}
      <div className="px-4 pb-6">
        {filtered.map((script) => {
          const isExpanded = expandedId === script.id;
          return (
            <div key={script.id} className="tip-card mb-3" style={{ borderLeftColor: script.color }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white mb-2 inline-block" style={{ background: script.color, fontFamily: "'Source Sans 3', sans-serif" }}>
                    {script.category}
                  </span>
                  <p className="font-bold text-sm text-[#1B3A6B] leading-snug" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {script.question}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : script.id)}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: isExpanded ? script.color : "#EFF4FF" }}
                >
                  {isExpanded
                    ? <ChevronUp size={16} className="text-white" />
                    : <ChevronDown size={16} style={{ color: script.color }} />
                  }
                </button>
              </div>

              {isExpanded && (
                <div className="mt-3 space-y-3 fade-up">
                  {/* Script */}
                  <div className="rounded-xl p-3" style={{ background: "#EFF4FF" }}>
                    <p className="text-xs font-bold text-[#1B3A6B] mb-1.5 uppercase tracking-wide" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      Your Script
                    </p>
                    <p className="text-sm text-[#374151] leading-relaxed italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {script.script}
                    </p>
                  </div>

                  {/* Coaching Tip */}
                  <div className="rounded-xl p-3" style={{ background: "#FDF3E0", border: "1px solid #F0D9A0" }}>
                    <p className="text-xs font-bold text-[#C9922A] mb-1.5 uppercase tracking-wide" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      Coaching Tip
                    </p>
                    <p className="text-sm text-[#374151] leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {script.tip}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <PageFooter />
    </div>
  );
}
