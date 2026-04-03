/*
 * DESIGN: "Warm Authority" — Navy/gold section headers, expandable script cards,
 * do/don't comparison cards, and a salary range calculator widget
 */
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { ChevronDown, ChevronUp, DollarSign, CheckCircle2, XCircle, MessageSquare, Lightbulb, TrendingUp } from "lucide-react";

interface ScriptItem {
  situation: string;
  script: string;
  tip: string;
}

interface TipCard {
  title: string;
  body: string;
  icon: React.ReactNode;
  color: string;
}

const SCRIPTS: ScriptItem[] = [
  {
    situation: "When asked 'What are your salary expectations?'",
    script: "Based on my research and the value I bring — including [X years of experience] in [field] — I'm targeting a range of $[low] to $[high]. That said, I'm open to discussing the full compensation package, including benefits and flexibility.",
    tip: "Always give a range, not a single number. Anchor the low end at or above your true minimum.",
  },
  {
    situation: "When you receive an offer lower than expected",
    script: "Thank you so much — I'm genuinely excited about this opportunity. I was hoping we could get closer to $[target]. Given my background in [specific skill] and the results I've delivered, I believe that figure reflects the value I'd bring. Is there flexibility there?",
    tip: "Express enthusiasm first, then counter. Never apologize for negotiating — it's expected and respected.",
  },
  {
    situation: "When they say 'That's the best we can do'",
    script: "I appreciate you being straightforward with me. If the base salary is fixed, could we explore other parts of the package — such as an additional week of PTO, a signing bonus, or a 6-month performance review with a raise built in?",
    tip: "Salary isn't the only lever. Benefits, flexibility, and review timelines all have real dollar value.",
  },
  {
    situation: "When negotiating after a long career gap",
    script: "During my time away from the workforce, I stayed current by [specific activity — e.g., freelancing, volunteering, taking courses]. I'm bringing that experience plus [X years of prior expertise], which I believe positions me well for the $[target] range.",
    tip: "Address the gap proactively and confidently. Frame it as a strength, not a weakness.",
  },
  {
    situation: "When asking about benefits and flexibility",
    script: "I'd love to understand the full picture of the compensation package. Could you walk me through the benefits, any remote or flexible work options, and how performance reviews typically work here?",
    tip: "Ask about the full package before accepting. Remote work, health benefits, and PTO can be worth thousands annually.",
  },
  {
    situation: "When you need time to consider an offer",
    script: "I'm very interested and want to give this the consideration it deserves. Would it be alright if I got back to you by [specific date — 2–3 business days]? I want to make sure I'm fully committed when I say yes.",
    tip: "You are always entitled to 24–72 hours to consider an offer. Never accept on the spot under pressure.",
  },
];

const TIPS: TipCard[] = [
  {
    title: "Research Your Market Value First",
    body: "Before any negotiation, look up salary ranges on Glassdoor, LinkedIn Salary, Bureau of Labor Statistics, and Indeed. Know the range for your role, your city, and your experience level. Walk in informed.",
    icon: <TrendingUp size={18} />,
    color: "#1B3A6B",
  },
  {
    title: "Your Experience Is Worth More, Not Less",
    body: "Decades of real-world experience, institutional knowledge, and professional maturity are genuinely valuable. Don't accept a lower offer simply because you feel pressure to 'prove yourself.' You've already proven yourself.",
    icon: <Lightbulb size={18} />,
    color: "#C9922A",
  },
  {
    title: "The First Number Sets the Anchor",
    body: "Whoever names a number first sets the anchor for the negotiation. If possible, let the employer go first. If you must go first, anchor high — you can always come down, but you can rarely go up.",
    icon: <DollarSign size={18} />,
    color: "#2A5298",
  },
  {
    title: "Silence Is a Powerful Tool",
    body: "After you name your number, stop talking. Silence feels uncomfortable, but it works in your favor. The first person to speak after a number is named often makes a concession. Let them fill the silence.",
    icon: <MessageSquare size={18} />,
    color: "#1B3A6B",
  },
];

const DOS = [
  "Research salary ranges before the conversation",
  "Express genuine enthusiasm for the role first",
  "Give a range, not a single number",
  "Ask about the full compensation package",
  "Request time to consider any offer",
  "Counter at least once — it's expected",
  "Highlight specific skills and achievements",
  "Get the final offer in writing",
];

const DONTS = [
  "Don't accept the first offer without countering",
  "Don't apologize for negotiating",
  "Don't reveal your current or previous salary",
  "Don't give a number below your true minimum",
  "Don't make it personal or emotional",
  "Don't accept under pressure on the spot",
  "Don't forget to negotiate non-salary benefits",
  "Don't burn bridges if you decline an offer",
];

export default function SalaryNegotiation() {
  const [expandedScript, setExpandedScript] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<"tips" | "scripts" | "dos">("tips");

  return (
    <div className="section-page">
      <PageHeader
        title="Salary Negotiation"
        subtitle="Know your worth — and ask for it with confidence"
      />

      <div className="px-4 py-5">
        {/* Intro Banner */}
        <div
          className="rounded-2xl px-5 py-5 mb-5 relative overflow-hidden fade-up"
          style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", boxShadow: "0 8px 24px rgba(27,58,107,0.2)" }}
        >
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10" style={{ background: "#C9922A", transform: "translate(30%,-30%)" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-[#E8B84B]" />
              <span className="text-xs font-semibold text-[#E8B84B] uppercase tracking-widest" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Your Worth</span>
            </div>
            <p className="text-lg font-bold text-white leading-snug mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Negotiating is not rude — it's professional.
            </p>
            <p className="text-sm text-blue-100 leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Studies show that 85% of people who negotiate receive more than the initial offer. Your experience, skills, and maturity are assets. Ask for what you deserve.
            </p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-5">
          {([["tips", "Key Tips"], ["scripts", "Scripts"], ["dos", "Do's & Don'ts"]] as [typeof activeSection, string][]).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveSection(tab)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
              style={{ background: activeSection === tab ? "#1B3A6B" : "#F3F4F6", color: activeSection === tab ? "white" : "#6B7280", fontFamily: "'Source Sans 3', sans-serif" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Key Tips */}
        {activeSection === "tips" && (
          <div className="flex flex-col gap-3 fade-up">
            {TIPS.map((tip, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: "white", border: "1.5px solid #E5E7EB", borderLeftWidth: "4px", borderLeftColor: tip.color, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: tip.color }}>
                    <span className="text-white">{tip.icon}</span>
                  </div>
                  <p className="font-bold text-[#1B3A6B] text-sm leading-tight" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{tip.title}</p>
                </div>
                <p className="text-sm text-[#4A4A4A] leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{tip.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Scripts */}
        {activeSection === "scripts" && (
          <div className="flex flex-col gap-3 fade-up">
            <p className="text-xs text-[#6B7280] mb-1 leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Tap any situation to reveal a ready-to-use script. Customize the bracketed parts with your own details.
            </p>
            {SCRIPTS.map((item, i) => {
              const isOpen = expandedScript === i;
              return (
                <div key={i} className="rounded-xl overflow-hidden" style={{ background: "white", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <button
                    onClick={() => setExpandedScript(isOpen ? null : i)}
                    className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#EFF4FF" }}>
                        <span className="text-xs font-bold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{i + 1}</span>
                      </div>
                      <p className="text-sm font-semibold text-[#1B3A6B] leading-snug" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{item.situation}</p>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-[#C9922A] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#9CA3AF] flex-shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 fade-up">
                      <div className="rounded-xl p-4 mb-3" style={{ background: "#FDF8F0", border: "1px solid #E8D9C0" }}>
                        <p className="text-xs font-semibold text-[#C9922A] uppercase tracking-wide mb-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>What to say:</p>
                        <p className="text-sm text-[#2D2D2D] leading-relaxed italic" style={{ fontFamily: "'Playfair Display', serif" }}>"{item.script}"</p>
                      </div>
                      <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#EFF4FF", border: "1px solid #C5D5F0" }}>
                        <Lightbulb size={14} className="text-[#1B3A6B] flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-[#1B3A6B] leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{item.tip}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Do's & Don'ts */}
        {activeSection === "dos" && (
          <div className="fade-up">
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-xl p-4" style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={18} className="text-[#166534]" />
                  <p className="font-bold text-[#166534] text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>DO These Things</p>
                </div>
                <div className="flex flex-col gap-2">
                  {DOS.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#16A34A" }}>
                        <span className="text-white text-[9px] font-bold">✓</span>
                      </div>
                      <p className="text-sm text-[#166534] leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-4" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle size={18} className="text-[#991B1B]" />
                  <p className="font-bold text-[#991B1B] text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>DON'T Do These Things</p>
                </div>
                <div className="flex flex-col gap-2">
                  {DONTS.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#DC2626" }}>
                        <span className="text-white text-[9px] font-bold">✕</span>
                      </div>
                      <p className="text-sm text-[#991B1B] leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <PageFooter />
    </div>
  );
}
