/*
 * DESIGN: "Warm Authority" — Hero with navy/cream gradient, Playfair Display headline,
 * gold accent, 6 quick-access cards with staggered fade-up animation
 */
import { useLocation } from "wouter";
import { FileText, MessageSquare, Mail, ShieldAlert, Briefcase, Star, Heart } from "lucide-react";
import PageFooter from "@/components/PageFooter";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663372772610/7aCQhXVwYTmP85sKfYqKej/hero-banner-DWYyjSeupqiTNoNsnQcrDH.webp";

const sections = [
  {
    path: "/resume-tips",
    icon: FileText,
    title: "Resume Tips",
    desc: "Modernize your resume and reduce age bias",
    color: "#1B3A6B",
  },
  {
    path: "/interview-scripts",
    icon: MessageSquare,
    title: "Interview Scripts",
    desc: "Practice confident, age-positive answers",
    color: "#2A5298",
  },
  {
    path: "/cover-letter",
    icon: Mail,
    title: "Cover Letter Builder",
    desc: "Generate a professional cover letter instantly",
    color: "#1B3A6B",
  },
  {
    path: "/scam-checker",
    icon: ShieldAlert,
    title: "Scam Job Checker",
    desc: "Spot red flags before you apply",
    color: "#C9922A",
  },
  {
    path: "/job-resources",
    icon: Briefcase,
    title: "Age-Friendly Job Resources",
    desc: "Age-friendly job boards and organizations",
    color: "#2A5298",
  },
  {
    path: "/affirmations",
    icon: Heart,
    title: "Daily Affirmations",
    desc: "Words of strength for your job search journey",
    color: "#C9922A",
  },
];

export default function Home() {
  const [, navigate] = useLocation();

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
            <span
              className="text-xs font-semibold tracking-widest uppercase text-[#E8B84B]"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Your Career Toolkit
            </span>
          </div>
          <h1
            className="text-3xl font-bold text-white leading-tight mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            50+ WorkReady
          </h1>
          <div className="w-12 h-1 rounded-full mb-3" style={{ background: "#C9922A" }} />
          <p
            className="text-lg font-semibold text-[#E8B84B] mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
          >
            Your Experience Is Your Edge.
          </p>
          <p
            className="text-sm text-blue-100 leading-relaxed max-w-xs"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            A job preparation toolkit built specifically for adults 50 and older — because your best work may still be ahead of you.
          </p>
        </div>
      </div>

      {/* Welcome Banner */}
      <div
        className="mx-4 mt-4 rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ background: "#EFF4FF", border: "1px solid #C5D5F0" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "#1B3A6B" }}
        >
          <Star size={14} fill="#C9922A" className="text-[#C9922A]" />
        </div>
        <div>
          <p
            className="text-sm font-semibold text-[#1B3A6B]"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Welcome! You belong here.
          </p>
          <p
            className="text-xs text-[#4A6090] mt-0.5 leading-relaxed"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Decades of experience make you a stronger candidate. Use these tools to present yourself with confidence.
          </p>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="px-4 mt-5">
        <h2
          className="text-base font-bold text-[#1B3A6B] mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
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
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: section.color }}
                  >
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="font-bold text-[#1B3A6B] text-sm"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      {section.title}
                    </p>
                    <p
                      className="text-xs text-[#6B7280] mt-0.5 leading-tight"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      {section.desc}
                    </p>
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
      </div>

      <PageFooter />
    </div>
  );
}
