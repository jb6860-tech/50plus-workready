/*
 * DESIGN: "Warm Authority" — Story cards with navy/gold accents, quote styling,
 * user-submitted stories saved to the real database via tRPC, inspirational tone throughout
 */
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { Heart, Plus, X, Star, Quote, Users, ChevronDown, ChevronUp, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface BuiltInStory {
  id: string;
  name: string;
  age: string;
  role: string;
  company: string;
  story: string;
  tip: string;
  isUserSubmitted?: false;
}

const BUILT_IN_STORIES: BuiltInStory[] = [
  {
    id: "s1", name: "Margaret T.", age: "58", role: "Executive Assistant", company: "Healthcare Network",
    story: "After 12 years at the same company, I was laid off at 57. I was terrified. I hadn't updated my resume in over a decade and had no idea how LinkedIn worked. I spent three months feeling invisible — sending applications and hearing nothing back. Then I realized my resume was listing jobs from 1992. Once I modernized it, removed old dates, and rewrote my summary to focus on what I could do for an employer, the callbacks started coming. I landed a role within six weeks.",
    tip: "Your resume is a marketing document, not a history book. Show what you can do today.",
  },
  {
    id: "s2", name: "Robert J.", age: "62", role: "Project Manager", company: "Construction Firm",
    story: "I was told in two interviews that they were 'looking for someone who could grow with the company.' I knew what that meant. Instead of getting discouraged, I leaned into my experience as a differentiator. I started saying in interviews: 'I don't need to learn the basics — I bring 30 years of solving the exact problems you're facing.' My confidence changed everything. The third company I interviewed with hired me on the spot at a salary higher than I expected.",
    tip: "Don't apologize for your experience. Lead with it. Own it. It's your greatest asset.",
  },
  {
    id: "s3", name: "Linda P.", age: "55", role: "Bookkeeper", company: "Small Business Consulting",
    story: "I was ghosted so many times I started to think something was wrong with me. A friend suggested I look at my email address — I was still using one from the early 2000s with my birth year in it. Small thing, but I updated it, created a clean LinkedIn profile, and started applying through age-friendly job boards instead of just the big ones. I also stopped listing my graduation year. Within a month, I had three interviews. I accepted an offer that came with full benefits and remote flexibility.",
    tip: "Small details matter. A professional email, a clean LinkedIn, and the right job boards can change everything.",
  },
  {
    id: "s4", name: "James W.", age: "60", role: "IT Support Specialist", company: "University",
    story: "I was worried that my tech skills were outdated, so I spent two months taking free online courses — Microsoft certifications, Google IT support, basic cloud tools. I added them to my resume under a 'Recent Training' section. Employers loved it. It showed I was proactive and committed to staying current. One interviewer told me I was the only candidate who had bothered to update their skills. I got the job and a 15% salary increase over my previous role.",
    tip: "Free online certifications can refresh your resume and show employers you're forward-thinking.",
  },
  {
    id: "s5", name: "Dorothy H.", age: "64", role: "Customer Service Manager", company: "Retail Chain",
    story: "I almost gave up after eight months of searching. I was applying to everything and getting nowhere. Then I started networking — really networking. I reached out to former colleagues, attended two local business events, and joined an online group for professionals over 50. My next job came from a former coworker who mentioned my name to her manager. I never even applied. The lesson: the hidden job market is real, and your network is your most powerful tool.",
    tip: "Most jobs are never posted publicly. Tell everyone you know that you're looking. Your next opportunity is probably one conversation away.",
  },
  {
    id: "s6", name: "Carol M.", age: "59", role: "Virtual Assistant", company: "Freelance",
    story: "After being passed over for promotion twice — both times for someone younger — I decided to stop waiting for someone to value me and start building something of my own. I launched my VA business at 59 with nothing but a laptop, my skills, and a lot of determination. Within six months I had four steady clients. Within a year I was earning more than I ever had as an employee. The best part? I set my own hours, work from home, and never have to worry about age discrimination again.",
    tip: "Sometimes the best job is the one you create for yourself. Your skills are worth more than any employer has been willing to pay.",
  },
];

const EMPTY_FORM = { name: "", age: "", role: "", company: "", story: "", tip: "" };

function loadLikes(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem("story-likes") || "{}"); } catch { return {}; }
}
function saveLikes(likes: Record<string, boolean>) {
  try { localStorage.setItem("story-likes", JSON.stringify(likes)); } catch {}
}

export default function SuccessStories() {
  const [likes, setLikes] = useState<Record<string, boolean>>(loadLikes);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState<"all" | "community">("all");

  // Load community stories from database
  const { data: dbStories = [], isLoading: storiesLoading, refetch } = trpc.stories.list.useQuery();

  // Submit story mutation (public — no login required)
  const submitStory = trpc.stories.submitPublic.useMutation({
    onSuccess: () => {
      setForm(EMPTY_FORM);
      setShowForm(false);
      setActiveTab("community");
      refetch();
      toast.success("Thank you for sharing your story! It will inspire others.");
    },
    onError: () => toast.error("Could not submit story. Please try again."),
  });

  const communityStories = dbStories.map(s => ({
    id: `db-${s.id}`,
    name: s.name,
    age: s.age || "",
    role: s.role,
    company: s.company || "",
    story: s.story,
    tip: s.tip || "",
    isUserSubmitted: true as const,
  }));

  const allStories = activeTab === "all"
    ? [...BUILT_IN_STORIES, ...communityStories]
    : communityStories;

  const handleLike = (id: string) => {
    const updated = { ...likes, [id]: !likes[id] };
    setLikes(updated);
    saveLikes(updated);
    if (!likes[id]) toast.success("Story marked as inspiring!");
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.story.trim() || !form.role.trim()) {
      toast.error("Please fill in your name, role, and story.");
      return;
    }
    submitStory.mutate({
      name: form.name, age: form.age || undefined, role: form.role,
      company: form.company || undefined, story: form.story, tip: form.tip || undefined,
    });
  };

  const inputClass = "w-full rounded-lg px-3 py-2.5 text-sm border outline-none transition-all duration-200 focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20";
  const inputStyle = { fontFamily: "'Source Sans 3', sans-serif", borderColor: "#D1D5DB", background: "white" };
  const labelClass = "block text-xs font-semibold text-[#1B3A6B] mb-1.5 uppercase tracking-wide";

  return (
    <div className="section-page">
      <PageHeader
        title="Success Stories"
        subtitle="Real people, real wins — proof that 50+ is just the beginning"
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
              <Users size={16} className="text-[#E8B84B]" />
              <span className="text-xs font-semibold text-[#E8B84B] uppercase tracking-widest" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Community</span>
            </div>
            <p className="text-lg font-bold text-white leading-snug mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              You are not alone in this journey.
            </p>
            <p className="text-sm text-blue-100 leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              These are real stories from adults 50+ who faced the same challenges — and came out stronger. Read, be inspired, and when you're ready, share your own.
            </p>
          </div>
        </div>

        {/* Tabs + Share Story Button */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1.5 flex-1">
            {([
              ["all", `All Stories (${BUILT_IN_STORIES.length + communityStories.length})`],
              ["community", `Community (${communityStories.length})`]
            ] as [typeof activeTab, string][]).map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                style={{ background: activeTab === tab ? "#1B3A6B" : "#F3F4F6", color: activeTab === tab ? "white" : "#6B7280", fontFamily: "'Source Sans 3', sans-serif" }}>
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200"
            style={{ background: "#C9922A", color: "white", fontFamily: "'Source Sans 3', sans-serif", boxShadow: "0 3px 10px rgba(201,146,42,0.3)" }}>
            <Plus size={13} /> Share
          </button>
        </div>

        {/* Submit Story Form */}
        {showForm && (
          <div className="rounded-xl p-4 mb-5 fade-up" style={{ background: "white", border: "1.5px solid #C9922A", boxShadow: "0 4px 16px rgba(201,146,42,0.12)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1B3A6B] text-base" style={{ fontFamily: "'Playfair Display', serif" }}>Share Your Story</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-[#9CA3AF]" /></button>
            </div>
            <p className="text-xs text-[#6B7280] mb-4 leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Your story could be exactly what someone else needs to hear today. No login required — share as much or as little as you're comfortable with.
            </p>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>First Name *</label>
                  <input className={inputClass} style={inputStyle} placeholder="e.g., Margaret" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Age</label>
                  <input className={inputClass} style={inputStyle} placeholder="e.g., 58" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Job Role / Title *</label>
                <input className={inputClass} style={inputStyle} placeholder="e.g., Administrative Assistant" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Company or Industry</label>
                <input className={inputClass} style={inputStyle} placeholder="e.g., Healthcare, Freelance, Retail..." value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Your Story *</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  style={{ ...inputStyle, minHeight: "100px" }}
                  placeholder="What challenge did you face? What did you do? What happened?"
                  value={form.story}
                  onChange={e => setForm(f => ({ ...f, story: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Your Best Tip for Others</label>
                <input className={inputClass} style={inputStyle} placeholder="e.g., Don't give up — the right opportunity is out there." value={form.tip} onChange={e => setForm(f => ({ ...f, tip: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-[#6B7280]" style={{ background: "#F3F4F6", fontFamily: "'Source Sans 3', sans-serif" }}>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitStory.isPending}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "#C9922A", fontFamily: "'Source Sans 3', sans-serif" }}
              >
                {submitStory.isPending ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : <><Send size={14} /> Submit Story</>}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {storiesLoading && activeTab === "community" && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-[#1B3A6B]" />
          </div>
        )}

        {/* Empty Community State */}
        {!storiesLoading && activeTab === "community" && communityStories.length === 0 && (
          <div className="text-center py-10">
            <Users size={40} className="text-[#D1D5DB] mx-auto mb-3" />
            <p className="font-semibold text-[#9CA3AF] text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>No community stories yet.</p>
            <p className="text-xs text-[#9CA3AF] mt-1 mb-4" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Be the first to share your journey and inspire others.</p>
            <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-white" style={{ background: "#C9922A", fontFamily: "'Source Sans 3', sans-serif" }}>
              Share Your Story
            </button>
          </div>
        )}

        {/* Story Cards */}
        <div className="flex flex-col gap-4">
          {allStories.map((story, idx) => {
            const isExpanded = expandedId === story.id;
            const isLiked = !!likes[story.id];
            const colors = ["#1B3A6B", "#2A5298", "#C9922A"];
            const accentColor = colors[idx % colors.length];

            return (
              <div key={story.id} className="rounded-xl overflow-hidden fade-up" style={{ background: "white", border: "1.5px solid #E5E7EB", boxShadow: "0 3px 12px rgba(0,0,0,0.07)" }}>
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-base" style={{ background: accentColor, fontFamily: "'Playfair Display', serif" }}>
                      {story.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-[#1B3A6B] text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{story.name}</p>
                        {story.age && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#EFF4FF", color: "#1B3A6B", fontFamily: "'Source Sans 3', sans-serif" }}>
                            Age {story.age}
                          </span>
                        )}
                        {story.isUserSubmitted && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#FDF8F0", color: "#C9922A", border: "1px solid #E8D9C0", fontFamily: "'Source Sans 3', sans-serif" }}>
                            Community
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B7280] mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                        {story.role}{story.company ? ` · ${story.company}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-2">
                    <Quote size={14} className="flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                    <p className="text-sm text-[#2D2D2D] leading-relaxed italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {isExpanded ? story.story : story.story.substring(0, 120) + (story.story.length > 120 ? "..." : "")}
                    </p>
                  </div>

                  {isExpanded && story.tip && (
                    <div className="mt-3 rounded-lg px-3 py-2.5 flex items-start gap-2" style={{ background: "#FDF8F0", border: "1px solid #E8D9C0" }}>
                      <Star size={13} fill="#C9922A" className="text-[#C9922A] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-[#C9922A] uppercase tracking-wide mb-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Their Best Tip</p>
                        <p className="text-xs text-[#4A4A4A] leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{story.tip}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : story.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold transition-all duration-200"
                      style={{ color: accentColor, fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      {isExpanded ? <><ChevronUp size={13} /> Read less</> : <><ChevronDown size={13} /> Read full story</>}
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={() => handleLike(story.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                      style={{ background: isLiked ? "#FEF2F2" : "#F9FAFB", color: isLiked ? "#DC2626" : "#9CA3AF", fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      <Heart size={12} fill={isLiked ? "#DC2626" : "none"} />
                      {isLiked ? "Inspiring!" : "Inspiring"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 rounded-xl px-5 py-5 text-center" style={{ background: "linear-gradient(135deg, #FDF8F0 0%, #FFF9EC 100%)", border: "1.5px solid #E8D9C0" }}>
          <p className="font-bold text-[#1B3A6B] text-base mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Your story matters.</p>
          <p className="text-xs text-[#6B7280] mb-4 leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Someone out there is exactly where you were before your breakthrough. Share your journey and give them hope.
          </p>
          <button
            onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #C9922A 0%, #E8B84B 100%)", fontFamily: "'Source Sans 3', sans-serif", boxShadow: "0 4px 12px rgba(201,146,42,0.3)" }}>
            Share My Story
          </button>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
