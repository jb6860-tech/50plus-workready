/*
 * DESIGN: "Warm Authority" — LinkedIn guide with navy/gold, section tabs,
 * expandable tips, premium paywall for non-subscribers
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Linkedin, Crown, Lock, ChevronDown, ChevronUp, Star, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const TABS = ["Profile Basics", "Headline & Summary", "Experience", "Skills & Network", "Job Search Tips"] as const;
type Tab = typeof TABS[number];

const GUIDE: Record<Tab, { title: string; tips: { heading: string; body: string; example?: string }[] }> = {
  "Profile Basics": {
    title: "Build a Strong Foundation",
    tips: [
      {
        heading: "Use a professional, current headshot",
        body: "Your photo is the first thing recruiters see. Use a clear, well-lit photo taken within the last 2–3 years. Smile naturally, wear professional attire, and use a plain or softly blurred background. Avoid group photos, vacation shots, or anything cropped from a larger image.",
        example: "Tip: A simple smartphone photo in good natural light near a window is perfectly professional.",
      },
      {
        heading: "Add a custom LinkedIn banner image",
        body: "The banner behind your profile photo is valuable real estate. Use a free tool like Canva to create a simple banner with your professional tagline, your city, or your industry. This immediately signals that you take your presence seriously.",
        example: "Example banner text: 'Experienced Administrative Professional | 20+ Years | Open to Opportunities'",
      },
      {
        heading: "Set your location to a major metro area",
        body: "If you live near a city, list the city rather than a suburb. Recruiters often search by metro area, and listing a smaller town can cause you to be filtered out of searches even when you're willing to commute.",
      },
      {
        heading: "Turn on 'Open to Work' (privately or publicly)",
        body: "LinkedIn allows you to signal you're open to opportunities. You can make this visible only to recruiters (not your current employer) or publicly. Go to your profile → 'Open to' → 'Finding a new job' and select your preferences.",
      },
    ],
  },
  "Headline & Summary": {
    title: "Your First Impression in Words",
    tips: [
      {
        heading: "Write a headline that sells, not just describes",
        body: "Your headline is visible in every search result and connection request. Don't just list your job title — include your value and what you're looking for.",
        example: "Instead of: 'Administrative Assistant'\nTry: 'Experienced Administrative Professional | Expert in Scheduling, Reporting & Office Operations | Open to Remote Roles'",
      },
      {
        heading: "Craft a summary that tells your story",
        body: "Your About section (summary) should open with a strong first sentence that captures who you are, then highlight your top 3 strengths, mention what you're looking for, and end with a call to action. Write in first person — it feels more human and approachable.",
        example: "Opening line example: 'With over 20 years of experience supporting executives and managing complex operations, I bring calm, precision, and professionalism to every role I take on.'",
      },
      {
        heading: "Include keywords recruiters search for",
        body: "LinkedIn's search algorithm uses keywords. Look at 3–5 job postings you'd love to apply for, note the repeated terms (e.g., 'calendar management,' 'data entry,' 'executive support'), and naturally weave them into your headline and summary.",
      },
      {
        heading: "Avoid listing graduation years or early career dates",
        body: "You don't need to include your graduation year in your summary. Focus on your skills and what you bring today, not when you started your career. This reduces age-related bias before a recruiter even reads your experience.",
      },
    ],
  },
  "Experience": {
    title: "Present Your Career Strategically",
    tips: [
      {
        heading: "Only list the last 10–15 years of experience",
        body: "You do not need to list every job you've ever had. Focus on the most recent and most relevant roles. Older positions can be summarized in one line or omitted entirely. This keeps your profile focused and reduces age bias.",
      },
      {
        heading: "Lead each role with accomplishments, not duties",
        body: "Instead of listing what your job required, describe what you achieved. Use numbers and outcomes wherever possible.",
        example: "Instead of: 'Responsible for scheduling and calendar management'\nTry: 'Managed complex calendars for 3 senior executives, reducing scheduling conflicts by 40% through proactive coordination'",
      },
      {
        heading: "Add a 'Recent Training' or 'Certifications' section",
        body: "If you've taken any recent courses — even free ones from Google, Coursera, or LinkedIn Learning — add them. This signals that you're current, proactive, and committed to growth. It directly counters the assumption that older workers are behind on technology.",
      },
      {
        heading: "Use the 'Featured' section to showcase your best work",
        body: "LinkedIn's Featured section lets you pin documents, links, or posts to the top of your profile. Consider adding a PDF of your resume, a link to a portfolio, or a post you wrote about your professional expertise.",
      },
    ],
  },
  "Skills & Network": {
    title: "Get Found and Get Endorsed",
    tips: [
      {
        heading: "Add at least 10 relevant skills",
        body: "LinkedIn allows up to 50 skills. Add skills that match the jobs you want — both technical (e.g., 'Microsoft Office,' 'QuickBooks') and soft (e.g., 'Team Leadership,' 'Problem Solving'). Skills improve your visibility in recruiter searches.",
      },
      {
        heading: "Ask for endorsements from former colleagues",
        body: "Reach out to 2–3 former colleagues or supervisors and ask them to endorse your top skills or write a recommendation. A short, genuine recommendation from a trusted colleague is one of the most powerful things on a LinkedIn profile.",
        example: "Sample message: 'Hi [Name], I hope you're well! I'm actively job searching and updating my LinkedIn profile. Would you be willing to write a brief recommendation or endorse a few of my skills? I'd be happy to do the same for you.'",
      },
      {
        heading: "Connect with at least 50 people in your industry",
        body: "LinkedIn's algorithm shows your profile more often when you have more connections. Aim for 50–100+ connections. Connect with former colleagues, classmates, neighbors, and people you meet at events. Each connection expands your visibility.",
      },
      {
        heading: "Follow companies you want to work for",
        body: "Follow the LinkedIn pages of 10–20 companies you'd love to work for. This keeps their job postings in your feed, and some companies can see when you follow them — which can signal interest to their recruiters.",
      },
    ],
  },
  "Job Search Tips": {
    title: "Use LinkedIn Actively to Find Opportunities",
    tips: [
      {
        heading: "Use LinkedIn's 'Easy Apply' strategically",
        body: "Easy Apply jobs let you apply with one click, but they also receive the most competition. For your top target companies, apply directly on their website and send a connection request to the hiring manager or recruiter on LinkedIn with a brief, personalized note.",
      },
      {
        heading: "Post or comment once a week to stay visible",
        body: "LinkedIn rewards active users with more visibility. You don't need to write long articles — simply commenting thoughtfully on someone else's post, sharing a job search tip, or posting a short reflection on your professional experience keeps your profile active in your network's feed.",
      },
      {
        heading: "Search for 'age-friendly employer' lists",
        body: "Search LinkedIn for companies that have been recognized as age-friendly employers. Organizations like AARP publish annual lists of companies committed to hiring and retaining workers 50+. Following these companies directly increases your chances of finding a welcoming workplace.",
      },
      {
        heading: "Set up job alerts for your target roles",
        body: "Go to LinkedIn Jobs, search for your target role and location, then click 'Set Alert.' You'll receive email notifications when new matching jobs are posted. Being among the first to apply — ideally within 24 hours of posting — significantly increases your response rate.",
        example: "Research shows that applications submitted within the first 24 hours of a posting are 2x more likely to receive a callback.",
      },
    ],
  },
};

export default function LinkedInGuide() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Profile Basics");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  const { data: premiumData, isLoading } = trpc.premium.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createCheckout = trpc.premium.createSubscriptionCheckout.useMutation({
    onSuccess: ({ url }) => { if (url) window.open(url, "_blank"); },
    onError: () => toast.error("Could not start checkout. Please try again."),
  });

  const isPremium = premiumData?.isPremium ?? false;
  const section = GUIDE[activeTab];

  // Paywall for non-premium users
  if (!isLoading && !isPremium) {
    return (
      <div className="section-page">
        <PageHeader title="LinkedIn Profile Guide" subtitle="Optimize your profile to attract age-friendly employers" />
        <div className="px-4 py-6">
          {/* Preview teaser */}
          <div className="rounded-xl overflow-hidden mb-5 fade-up" style={{ border: "1.5px solid #E5E7EB", background: "white" }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#EFF4FF" }}>
              <Linkedin size={16} className="text-[#0077B5]" />
              <p className="font-bold text-sm text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>What's inside this guide</p>
            </div>
            <div className="px-4 py-4 flex flex-col gap-2">
              {TABS.map(tab => (
                <div key={tab} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-[#C9922A] flex-shrink-0" />
                  <p className="text-sm text-[#4A4A4A]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    <strong>{tab}</strong> — {GUIDE[tab].title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Paywall card */}
          <div
            className="rounded-2xl px-5 py-6 text-center fade-up"
            style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", boxShadow: "0 8px 24px rgba(27,58,107,0.2)" }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Lock size={24} className="text-[#E8B84B]" />
            </div>
            <p className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Premium Content
            </p>
            <p className="text-sm text-blue-100 mb-4 leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              This LinkedIn optimization guide is available to Premium members. Upgrade to unlock all 5 sections with 20 actionable tips, real examples, and scripts written specifically for adults 50+.
            </p>
            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => createCheckout.mutate({ origin: window.location.origin })}
                    disabled={createCheckout.isPending}
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #C9922A 0%, #E8B84B 100%)", color: "white", fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    {createCheckout.isPending ? <Loader2 size={14} className="animate-spin" /> : <Crown size={14} />}
                    Upgrade to Premium — $7.99/mo
                  </button>
                  <button
                    onClick={() => navigate("/bonus-scripts")}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm text-white/80"
                    style={{ background: "rgba(255,255,255,0.1)", fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    Or get lifetime access for $29.99
                  </button>
                </>
              ) : (
                <a
                  href={getLoginUrl()}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #C9922A 0%, #E8B84B 100%)", color: "white", fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  <Crown size={14} />
                  Sign In to Upgrade
                </a>
              )}
            </div>
          </div>

          {/* Free tip preview */}
          <div className="mt-4 rounded-xl px-4 py-4 fade-up" style={{ background: "#FDF8F0", border: "1.5px solid #E8D9C0" }}>
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} fill="#C9922A" className="text-[#C9922A]" />
              <p className="text-xs font-bold text-[#C9922A] uppercase tracking-wide" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Free Tip Preview</p>
            </div>
            <p className="text-sm font-semibold text-[#1B3A6B] mb-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Write a headline that sells, not just describes
            </p>
            <p className="text-xs text-[#4A4A4A] leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Instead of just listing your job title, include your value and what you're looking for. Example: <em>"Experienced Administrative Professional | Expert in Scheduling & Reporting | Open to Remote Roles"</em>
            </p>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="section-page">
        <PageHeader title="LinkedIn Profile Guide" subtitle="Loading..." />
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-[#1B3A6B]" />
        </div>
      </div>
    );
  }

  return (
    <div className="section-page">
      <PageHeader
        title="LinkedIn Profile Guide"
        subtitle="20 expert tips to help adults 50+ attract age-friendly employers"
      />

      <div className="px-4 py-5">
        {/* Premium badge */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-full w-fit" style={{ background: "linear-gradient(135deg, #C9922A 0%, #E8B84B 100%)" }}>
          <Crown size={13} className="text-white" />
          <p className="text-xs font-bold text-white" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Premium Content Unlocked</p>
        </div>

        {/* LinkedIn intro banner */}
        <div className="rounded-2xl px-5 py-4 mb-5 fade-up" style={{ background: "linear-gradient(135deg, #0077B5 0%, #005885 100%)", boxShadow: "0 6px 20px rgba(0,119,181,0.25)" }}>
          <div className="flex items-center gap-3">
            <Linkedin size={28} className="text-white flex-shrink-0" />
            <div>
              <p className="font-bold text-white text-base leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                LinkedIn for Adults 50+
              </p>
              <p className="text-xs text-blue-100 mt-0.5 leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Over 87% of recruiters use LinkedIn. A strong profile can bypass age bias and put you directly in front of the right employers.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setExpandedIdx(0); }}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
              style={{
                background: activeTab === tab ? "#1B3A6B" : "#F3F4F6",
                color: activeTab === tab ? "white" : "#6B7280",
                fontFamily: "'Source Sans 3', sans-serif",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Section Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full" style={{ background: "#C9922A" }} />
          <p className="font-bold text-[#1B3A6B] text-base" style={{ fontFamily: "'Playfair Display', serif" }}>{section.title}</p>
        </div>

        {/* Tips */}
        <div className="flex flex-col gap-3">
          {section.tips.map((tip, idx) => {
            const isOpen = expandedIdx === idx;
            return (
              <div key={idx} className="rounded-xl overflow-hidden fade-up" style={{ border: isOpen ? "1.5px solid #C9922A" : "1.5px solid #E5E7EB", background: "white", boxShadow: isOpen ? "0 4px 16px rgba(201,146,42,0.1)" : "0 2px 8px rgba(0,0,0,0.05)" }}>
                <button
                  className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
                  onClick={() => setExpandedIdx(isOpen ? null : idx)}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{ background: isOpen ? "#C9922A" : "#1B3A6B", fontFamily: "'Source Sans 3', sans-serif" }}>
                    {idx + 1}
                  </div>
                  <p className="flex-1 font-semibold text-sm text-[#1B3A6B] leading-snug" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    {tip.heading}
                  </p>
                  {isOpen ? <ChevronUp size={16} className="text-[#C9922A] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#9CA3AF] flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-[#4A4A4A] leading-relaxed mb-3" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                      {tip.body}
                    </p>
                    {tip.example && (
                      <div className="rounded-lg px-3 py-2.5" style={{ background: "#FDF8F0", border: "1px solid #E8D9C0" }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Star size={11} fill="#C9922A" className="text-[#C9922A]" />
                          <p className="text-xs font-bold text-[#C9922A] uppercase tracking-wide" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Example</p>
                        </div>
                        <p className="text-xs text-[#4A4A4A] leading-relaxed whitespace-pre-line" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          {tip.example}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className="mt-5 flex items-center justify-center gap-1.5">
          {TABS.map(tab => (
            <div key={tab} className="h-1.5 rounded-full transition-all duration-300" style={{ width: activeTab === tab ? "24px" : "8px", background: activeTab === tab ? "#C9922A" : "#E5E7EB" }} />
          ))}
        </div>
        <p className="text-center text-xs text-[#9CA3AF] mt-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {TABS.indexOf(activeTab) + 1} of {TABS.length} sections
        </p>

        {/* Alert tip */}
        <div className="mt-4 rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: "#EFF4FF", border: "1px solid #C5D5F0" }}>
          <AlertCircle size={16} className="text-[#1B3A6B] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#1B3A6B] leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            <strong>Pro tip:</strong> Spend 30 minutes implementing just one section at a time. Consistent, incremental improvements to your LinkedIn profile are more effective than trying to overhaul everything at once.
          </p>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
