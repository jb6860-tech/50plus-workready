/*
 * DESIGN: "Warm Authority" — Networking hub with LinkedIn optimization tips and local events guide
 */
import { useState } from "react";
import { Linkedin, MapPin, Users, MessageSquare, Star, ExternalLink, ChevronDown, ChevronUp, Lightbulb, Calendar } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";

const LINKEDIN_SECTIONS = [
  {
    id: "headline",
    title: "Craft a Powerful Headline",
    icon: Star,
    color: "#0077B5",
    tips: [
      { tip: "Lead with your value, not your title", detail: "Instead of 'Retired Manager', write 'Operations Leader | 20+ Years Driving Efficiency | Open to New Challenges'. Your headline is your first impression." },
      { tip: "Include keywords recruiters search for", detail: "Research job postings you want and mirror their language. If they say 'Administrative Coordinator', use that phrase — not just 'Admin'." },
      { tip: "Add your availability signal", detail: "End with 'Open to New Opportunities' or 'Actively Seeking Part-Time/Remote Roles' so recruiters know you're available without guessing." },
      { tip: "Avoid age-revealing phrases", detail: "Skip phrases like 'Seasoned Professional' or 'Veteran' — they can trigger age bias. Focus on skills and results instead." },
    ]
  },
  {
    id: "photo",
    title: "Profile Photo Best Practices",
    icon: Users,
    color: "#C9922A",
    tips: [
      { tip: "Use a recent, professional headshot", detail: "A clear, well-lit photo with a neutral background. Smile naturally — approachability matters as much as professionalism." },
      { tip: "Dress for the industry you're targeting", detail: "Business casual works for most roles. If targeting creative fields, you can be more expressive. Match the culture of your target employers." },
      { tip: "Crop to head and shoulders", detail: "LinkedIn profile photos display as a small circle. Make sure your face fills most of the frame so it's recognizable even at thumbnail size." },
      { tip: "Update your photo every 2-3 years", detail: "An outdated photo creates a disconnect when you meet people in person. Keep it current so people recognize you at interviews and events." },
    ]
  },
  {
    id: "summary",
    title: "Write a Compelling About Section",
    icon: MessageSquare,
    color: "#1B3A6B",
    tips: [
      { tip: "Open with a strong first sentence", detail: "The first two lines show before 'see more'. Lead with your biggest value: 'I help small businesses run smoothly — 25 years of doing exactly that.'" },
      { tip: "Tell your story in first person", detail: "Write as you speak: 'I've spent my career...' not 'John is an experienced...' First person feels human and approachable." },
      { tip: "Highlight your top 3 achievements", detail: "Use specific numbers: 'Managed a $2M budget', 'Coordinated 50+ events annually', 'Reduced onboarding time by 40%'. Numbers build credibility." },
      { tip: "End with a clear call to action", detail: "Tell people what you want: 'I'm currently seeking part-time remote administrative roles. Feel free to connect or message me directly.'" },
    ]
  },
  {
    id: "experience",
    title: "Optimize Your Experience Section",
    icon: Star,
    color: "#2A5298",
    tips: [
      { tip: "Only list the last 10-15 years of work", detail: "Older experience can reveal your age and isn't usually relevant. Focus on your most recent and impactful roles." },
      { tip: "Remove graduation years from Education", detail: "Graduation years are one of the easiest ways for bias to creep in. List your degree and institution, but leave off the year." },
      { tip: "Use bullet points with action verbs", detail: "Start each bullet with a strong verb: Managed, Led, Designed, Coordinated, Implemented. Then add a result: 'Managed 12-person team, improving project delivery by 30%.'" },
      { tip: "Add skills and keywords to each role", detail: "Include tools, software, and methods you used in each position. This helps LinkedIn's algorithm surface your profile in recruiter searches." },
    ]
  },
  {
    id: "networking",
    title: "Active Networking Strategies",
    icon: Users,
    color: "#C9922A",
    tips: [
      { tip: "Send 5 personalized connection requests per week", detail: "Don't use the default message. Write: 'Hi [Name], I noticed we both worked in [field]. I'd love to connect and learn from your experience.' Personalization gets 3x more acceptances." },
      { tip: "Comment on posts before connecting", detail: "Leave a thoughtful comment on someone's post, then connect. They'll recognize your name and be far more likely to accept." },
      { tip: "Reach out to former colleagues", detail: "Former coworkers are your warmest network. A simple 'Hi [Name], I hope you're well! I'm exploring new opportunities and would love to reconnect' goes a long way." },
      { tip: "Join LinkedIn Groups in your field", detail: "Search for groups related to your industry or job function. Participate in discussions — it's a low-pressure way to get noticed by people who are hiring." },
    ]
  },
];

const LOCAL_EVENT_TYPES = [
  {
    type: "Job Fairs",
    icon: Briefcase,
    color: "#1B3A6B",
    description: "In-person events where multiple employers recruit simultaneously. Great for meeting hiring managers face-to-face.",
    howToFind: [
      "Search 'job fair near me' on Eventbrite.com",
      "Check your local library's events calendar",
      "Visit your city or county workforce development center",
      "Search AARP's local events page at aarp.org/events",
    ],
    tips: [
      "Bring 15–20 printed copies of your resume",
      "Dress professionally — first impressions are made in seconds",
      "Prepare a 30-second 'elevator pitch' about who you are",
      "Collect business cards and follow up within 24 hours",
    ]
  },
  {
    type: "Networking Meetups",
    icon: Users,
    color: "#C9922A",
    description: "Informal gatherings of professionals in a specific industry or interest area. Lower pressure than job fairs.",
    howToFind: [
      "Search Meetup.com for professional groups in your city",
      "Look for 'professionals over 50' or 'career transition' groups",
      "Check your local Chamber of Commerce events",
      "Search Facebook Events for local networking events",
    ],
    tips: [
      "Set a goal: meet 3 new people per event",
      "Ask questions and listen — people remember good listeners",
      "Follow up on LinkedIn within 48 hours of meeting someone",
      "Offer to help others — networking is a two-way street",
    ]
  },
  {
    type: "Community College Workshops",
    icon: Lightbulb,
    color: "#2A5298",
    description: "Free or low-cost workshops on resume writing, interviewing, and job search skills. Often specifically for adults 50+.",
    howToFind: [
      "Visit your nearest community college's continuing education page",
      "Search for 'workforce development' programs in your county",
      "Contact your state's Department of Labor for free programs",
      "Look for AARP Foundation's Back to Work 50+ program",
    ],
    tips: [
      "Many programs are free for job seekers — always ask",
      "These workshops also serve as networking opportunities",
      "Ask instructors for referrals — they often know employers",
      "Certificate programs can add credibility to your resume",
    ]
  },
  {
    type: "Industry Associations",
    icon: Star,
    color: "#1B3A6B",
    description: "Professional organizations in your field that host events, conferences, and member directories.",
    howToFind: [
      "Search '[your industry] association' + your city",
      "Ask former colleagues which associations they belong to",
      "Check LinkedIn for local chapter events in your field",
      "Many associations offer discounted membership for job seekers",
    ],
    tips: [
      "Volunteer for committees — it fast-tracks your visibility",
      "Attend the annual conference if budget allows",
      "Member directories are a goldmine for direct outreach",
      "Association newsletters often list job openings before public boards",
    ]
  },
];

// Need to import Briefcase separately
import { Briefcase } from "lucide-react";

export default function NetworkingDashboard() {
  const [activeTab, setActiveTab] = useState<"linkedin" | "events">("linkedin");
  const [expandedSection, setExpandedSection] = useState<string | null>("headline");
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  return (
    <div className="section-page">
      <PageHeader title="Networking Hub" subtitle="Build connections that open doors — on LinkedIn and in your community" />

      {/* Tab Bar */}
      <div className="flex mx-4 mt-4 rounded-xl overflow-hidden" style={{ border: "1.5px solid #E5E7EB" }}>
        <button
          onClick={() => setActiveTab("linkedin")}
          className="flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200"
          style={{ fontFamily: "'Source Sans 3', sans-serif", background: activeTab === "linkedin" ? "#0077B5" : "white", color: activeTab === "linkedin" ? "white" : "#6B7280" }}
        >
          <Linkedin size={13} />
          LinkedIn Tips
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className="flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200"
          style={{ fontFamily: "'Source Sans 3', sans-serif", background: activeTab === "events" ? "#1B3A6B" : "white", color: activeTab === "events" ? "white" : "#6B7280" }}
        >
          <MapPin size={13} />
          Local Events
        </button>
      </div>

      <div className="px-4 py-4 flex flex-col gap-3">

        {/* LINKEDIN TAB */}
        {activeTab === "linkedin" && (
          <>
            {/* Hero */}
            <div className="rounded-2xl px-5 py-5 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0077B5 0%, #005885 100%)", boxShadow: "0 8px 24px rgba(0,119,181,0.25)" }}>
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Linkedin size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-base" style={{ fontFamily: "'Playfair Display', serif" }}>LinkedIn for Adults 50+</p>
                  <p className="text-xs text-blue-100 mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    5 sections · 20 actionable tips to attract age-friendly employers
                  </p>
                </div>
              </div>
            </div>

            {/* Sections */}
            {LINKEDIN_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isOpen = expandedSection === section.id;
              return (
                <div key={section.id} className="rounded-xl overflow-hidden fade-up" style={{ border: "1.5px solid #E5E7EB", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <button
                    onClick={() => setExpandedSection(isOpen ? null : section.id)}
                    className="w-full px-4 py-4 flex items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: section.color + "15" }}>
                      <Icon size={18} style={{ color: section.color }} />
                    </div>
                    <p className="flex-1 font-bold text-sm text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{section.title}</p>
                    {isOpen ? <ChevronUp size={16} className="text-[#9CA3AF] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#9CA3AF] flex-shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 flex flex-col gap-2">
                      {section.tips.map((item, i) => {
                        const tipKey = `${section.id}-${i}`;
                        const tipOpen = expandedTip === tipKey;
                        return (
                          <div key={i} className="rounded-lg overflow-hidden" style={{ border: "1px solid #F3F4F6", background: "#FAFAFA" }}>
                            <button
                              onClick={() => setExpandedTip(tipOpen ? null : tipKey)}
                              className="w-full px-3 py-3 flex items-center gap-2 text-left"
                            >
                              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: section.color, fontFamily: "'Source Sans 3', sans-serif" }}>{i + 1}</div>
                              <p className="flex-1 text-xs font-semibold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{item.tip}</p>
                              {tipOpen ? <ChevronUp size={13} className="text-[#9CA3AF] flex-shrink-0" /> : <ChevronDown size={13} className="text-[#9CA3AF] flex-shrink-0" />}
                            </button>
                            {tipOpen && (
                              <div className="px-3 pb-3">
                                <p className="text-xs text-[#4A4A4A] leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{item.detail}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Open LinkedIn CTA */}
            <a
              href="https://www.linkedin.com/in/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #0077B5 0%, #005885 100%)", fontFamily: "'Source Sans 3', sans-serif", boxShadow: "0 4px 14px rgba(0,119,181,0.3)" }}
            >
              <Linkedin size={16} />
              Open My LinkedIn Profile
              <ExternalLink size={13} />
            </a>
          </>
        )}

        {/* LOCAL EVENTS TAB */}
        {activeTab === "events" && (
          <>
            {/* Hero */}
            <div className="rounded-2xl px-5 py-5 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", boxShadow: "0 8px 24px rgba(27,58,107,0.2)" }}>
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <MapPin size={22} className="text-[#E8B84B]" />
                </div>
                <div>
                  <p className="font-bold text-white text-base" style={{ fontFamily: "'Playfair Display', serif" }}>Find Local Opportunities</p>
                  <p className="text-xs text-blue-100 mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                    4 types of events · Where to find them · How to make the most of each
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-xl px-4 py-4" style={{ background: "#FDF8F0", border: "1.5px solid #E8D9C0" }}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} className="text-[#C9922A]" />
                <p className="text-xs font-bold text-[#C9922A] uppercase tracking-wide" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Quick Event Finders</p>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { name: "Eventbrite — Job Fairs & Networking", url: "https://www.eventbrite.com/d/online/job-fair/" },
                  { name: "Meetup — Professional Groups Near You", url: "https://www.meetup.com/find/?keywords=networking&source=EVENTS" },
                  { name: "AARP Events — Adults 50+", url: "https://local.aarp.org/aarp-events/" },
                  { name: "LinkedIn Events — Local Networking", url: "https://www.linkedin.com/events/" },
                ].map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                    style={{ background: "white", border: "1px solid #E5E7EB" }}>
                    <ExternalLink size={12} className="text-[#C9922A] flex-shrink-0" />
                    <p className="text-xs font-semibold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{link.name}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* Event Types */}
            {LOCAL_EVENT_TYPES.map((event) => {
              const Icon = event.icon;
              const isOpen = expandedEvent === event.type;
              return (
                <div key={event.type} className="rounded-xl overflow-hidden fade-up" style={{ border: "1.5px solid #E5E7EB", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <button
                    onClick={() => setExpandedEvent(isOpen ? null : event.type)}
                    className="w-full px-4 py-4 flex items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: event.color + "15" }}>
                      <Icon size={18} style={{ color: event.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{event.type}</p>
                      <p className="text-xs text-[#6B7280] leading-snug mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{event.description}</p>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-[#9CA3AF] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#9CA3AF] flex-shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 flex flex-col gap-3">
                      <div className="rounded-lg px-3 py-3" style={{ background: "#EFF4FF" }}>
                        <p className="text-xs font-bold text-[#1B3A6B] mb-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Where to Find Them</p>
                        {event.howToFind.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 mb-1.5">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: event.color }} />
                            <p className="text-xs text-[#4A4A4A]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{item}</p>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-lg px-3 py-3" style={{ background: "#FDF8F0" }}>
                        <p className="text-xs font-bold text-[#C9922A] mb-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Pro Tips</p>
                        {event.tips.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 mb-1.5">
                            <Star size={10} fill="#C9922A" className="text-[#C9922A] mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-[#4A4A4A]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

      </div>
      <PageFooter />
    </div>
  );
}
