/*
 * DESIGN: "Warm Authority" — Hero with navy/cream gradient, Playfair Display headline,
 * gold accent, Morning Ritual banner, Share App button, quick-access cards with staggered fade-up animation
 */
import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  FileText, MessageSquare, Mail, ShieldAlert, Briefcase, Star, Heart,
  ClipboardList, Sun, X, ArrowRight, DollarSign, Share2, Users, Crown
} from "lucide-react";
import PageFooter from "@/components/PageFooter";
import { toast } from "sonner";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663372772610/7aCQhXVwYTmP85sKfYqKej/hero-banner-DWYyjSeupqiTNoNsnQcrDH.webp";

const BUILT_IN_AFFIRMATIONS = [
  "My decades of experience are a powerful advantage — not a liability.",
  "I bring wisdom, reliability, and depth that cannot be taught in a classroom.",
  "Every setback I have faced has made me more resilient and resourceful.",
  "I am worthy of a fulfilling, well-paying role that values what I bring.",
  "My age is a testament to my dedication, not a barrier to my future.",
  "I have navigated challenges before, and I will navigate this one too.",
  "The right employer will recognize my value — and I will find them.",
  "I am not starting over. I am starting from experience.",
  "My skills, instincts, and professionalism are assets in any workplace.",
  "I deserve to be treated with respect in every interview and workplace.",
  "I am adaptable, curious, and fully capable of learning new things.",
  "My career story is not finished — the best chapters may still be ahead.",
  "I bring calm, perspective, and maturity that younger teams benefit from.",
  "I will not let one rejection define my worth or dim my confidence.",
  "I am building something meaningful, and I am exactly the right person to build it.",
  "Every 'no' is redirecting me toward the right 'yes.'",
  "I show up prepared, professional, and proud of who I am.",
  "My lived experience is a gift I bring to every room I enter.",
  "I am not too old — I am exactly the right age for the right opportunity.",
  "I believe in my ability to create the career and life I deserve.",
  "I am courageous enough to try, strong enough to persist, and wise enough to succeed.",
  "The world needs people like me — experienced, grounded, and genuinely committed.",
  "I release the fear of judgment and step forward with confidence.",
  "I am a whole, capable, and valuable person — in work and in life.",
  "Today I take one step forward, and that is enough.",
  "I trust the process. My breakthrough is coming.",
  "I am not competing with anyone. I am becoming the best version of myself.",
  "My story inspires others — and that makes my journey worthwhile.",
  "I choose to see possibility where others see obstacles.",
  "I am proud of how far I have come, and excited about where I am going.",
];

function getDailyAffirmation(): string {
  try {
    const custom = JSON.parse(localStorage.getItem("custom-affirmations") || "[]");
    const all = [...BUILT_IN_AFFIRMATIONS, ...custom.map((c: { text: string }) => c.text)];
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return all[dayOfYear % all.length];
  } catch {
    return BUILT_IN_AFFIRMATIONS[0];
  }
}

function hasReadTodayAffirmation(): boolean {
  try {
    const key = localStorage.getItem("affirmation-last-read");
    return key === new Date().toDateString();
  } catch { return false; }
}

function markAffirmationRead() {
  try { localStorage.setItem("affirmation-last-read", new Date().toDateString()); } catch {}
}

const sections = [
  { path: "/resume-tips", icon: FileText, title: "Resume Tips", desc: "Modernize your resume and reduce age bias", color: "#1B3A6B" },
  { path: "/interview-scripts", icon: MessageSquare, title: "Interview Scripts", desc: "Practice confident, age-positive answers", color: "#2A5298" },
  { path: "/cover-letter", icon: Mail, title: "Cover Letter Builder", desc: "Generate a professional cover letter instantly", color: "#1B3A6B" },
  { path: "/scam-checker", icon: ShieldAlert, title: "Scam Job Checker", desc: "Spot red flags before you apply", color: "#C9922A" },
  { path: "/job-resources", icon: Briefcase, title: "Age-Friendly Job Resources", desc: "Curated job boards for workers 50+", color: "#2A5298" },
  { path: "/affirmations", icon: Heart, title: "Daily Affirmations", desc: "Words of strength for your job search journey", color: "#C9922A" },
  { path: "/job-tracker", icon: ClipboardList, title: "Job Application Tracker", desc: "Track every application in one place", color: "#1B3A6B" },
  { path: "/salary-negotiation", icon: DollarSign, title: "Salary Negotiation", desc: "Scripts and strategies to ask for what you deserve", color: "#C9922A" },
  { path: "/success-stories", icon: Users, title: "Success Stories", desc: "Real inspiration from workers 50+ who made it happen", color: "#2A5298" },
  { path: "/bonus-scripts", icon: Crown, title: "Premium: Bonus Scripts", desc: "10 advanced interview scripts for the toughest questions", color: "#C9922A" },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [showRitual, setShowRitual] = useState(!hasReadTodayAffirmation());
  const [dailyAffirmation] = useState(getDailyAffirmation);

  const handleRitualDismiss = () => { markAffirmationRead(); setShowRitual(false); };
  const handleRitualNavigate = () => { markAffirmationRead(); setShowRitual(false); navigate("/affirmations"); };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleShare = useCallback(async () => {
    const shareData = {
      title: "50+ WorkReady — Job Toolkit for Adults 50+",
      text: "I found this free job preparation app designed specifically for adults 50 and older. It has resume tips, interview scripts, a cover letter builder, scam job checker, and more. Check it out!",
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast.success("App link copied to clipboard! Paste it anywhere to share.");
      }
    } catch {
      // User cancelled share — no error needed
    }
  }, []);

  return (
    <div className="section-page" style={{ background: "#FDF8F0" }}>
      {/* Hero Section */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(to right, rgba(27,58,107,0.92) 0%, rgba(27,58,107,0.55) 60%, rgba(27,58,107,0.2) 100%), url(${HERO_IMAGE}) center/cover no-repeat`,
          minHeight: "240px",
        }}
      >
        <div className="px-5 pt-12 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} fill="#C9922A" className="text-[#C9922A]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#E8B84B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Your Career Toolkit
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            50+ WorkReady
          </h1>
          <div className="w-12 h-1 rounded-full mb-3" style={{ background: "#C9922A" }} />
          <p className="text-lg font-semibold text-[#E8B84B] mb-1" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
            Your Experience Is Your Edge.
          </p>
          <p className="text-sm text-blue-100 leading-relaxed max-w-xs" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            A job preparation toolkit built specifically for adults 50 and older — because your best work may still be ahead of you.
          </p>
          {/* Share Button in Hero */}
          <button
            onClick={handleShare}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95"
            style={{ background: "rgba(255,255,255,0.18)", color: "white", border: "1.5px solid rgba(255,255,255,0.35)", fontFamily: "'Source Sans 3', sans-serif", backdropFilter: "blur(4px)" }}
          >
            <Share2 size={13} />
            Share This App
          </button>
        </div>
      </div>

      {/* Morning Ritual Banner */}
      {showRitual && (
        <div
          className="mx-4 mt-4 rounded-2xl overflow-hidden relative fade-up"
          style={{ background: "linear-gradient(135deg, #C9922A 0%, #E8B84B 100%)", boxShadow: "0 6px 20px rgba(201,146,42,0.3)" }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20" style={{ background: "white", transform: "translate(30%, -30%)" }} />
          <div className="px-4 py-4 relative z-10">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.25)" }}>
                  <Sun size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/80 uppercase tracking-widest" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Morning Ritual</p>
                  <p className="text-sm font-bold text-white" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{greeting}! Start your day with intention.</p>
                </div>
              </div>
              <button onClick={handleRitualDismiss} className="flex-shrink-0 mt-0.5"><X size={16} className="text-white/70" /></button>
            </div>
            <p className="text-sm text-white/90 leading-relaxed italic mb-3 pl-10" style={{ fontFamily: "'Playfair Display', serif" }}>
              "{dailyAffirmation}"
            </p>
            <button onClick={handleRitualNavigate} className="flex items-center gap-1.5 text-xs font-bold text-white pl-10 transition-opacity hover:opacity-80" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Read today's full affirmation <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      {!showRitual && (
        <div className="mx-4 mt-4 rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: "#EFF4FF", border: "1px solid #C5D5F0" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#1B3A6B" }}>
            <Star size={14} fill="#C9922A" className="text-[#C9922A]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Welcome! You belong here.</p>
            <p className="text-xs text-[#4A6090] mt-0.5 leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Decades of experience make you a stronger candidate. Use these tools to present yourself with confidence.
            </p>
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="px-4 mt-5">
        <h2 className="text-base font-bold text-[#1B3A6B] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Where would you like to start?
        </h2>
        <div className="flex flex-col gap-3">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <button
                key={section.path}
                onClick={() => navigate(section.path)}
                className={`tip-card text-left fade-up fade-up-delay-${i + 1} w-full`}
                style={{ borderLeftColor: section.color }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: section.color }}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#1B3A6B] text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{section.title}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5 leading-tight" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{section.desc}</p>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 3l5 5-5 5" stroke="#C9922A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Share CTA at bottom */}
        <button
          onClick={handleShare}
          className="w-full mt-5 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
          style={{ background: "linear-gradient(135deg, #2A5298 0%, #1B3A6B 100%)", color: "white", fontFamily: "'Source Sans 3', sans-serif", boxShadow: "0 4px 14px rgba(27,58,107,0.25)" }}
        >
          <Share2 size={16} />
          Share 50+ WorkReady with Someone You Know
        </button>
        <p className="text-center text-xs text-[#9CA3AF] mt-2 mb-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          Help another adult 50+ find the tools they deserve.
        </p>
      </div>

      <PageFooter />
    </div>
  );
}
