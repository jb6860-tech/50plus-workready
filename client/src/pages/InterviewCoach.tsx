import { useState } from "react";
import { trpc } from "@/lib/trpc";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { toast } from "sonner";
import {
  Brain, Sparkles, Loader2, ChevronDown, ChevronUp,
  AlertTriangle, Zap, MessageSquare, Lightbulb, Star
} from "lucide-react";

type ExperienceLevel = "entry" | "mid" | "senior" | "executive";

const LEVELS: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: "entry", label: "Entry Level", desc: "0–3 years" },
  { value: "mid", label: "Mid Level", desc: "4–10 years" },
  { value: "senior", label: "Senior", desc: "10–20 years" },
  { value: "executive", label: "Executive", desc: "20+ years" },
];

type CoachResult = {
  questions: Array<{
    question: string;
    whyAsked: string;
    framework: string;
    powerPhrase: string;
    redFlag: string;
  }>;
  prepTip: string;
  ageReframe: string;
};

export default function InterviewCoach() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("senior");
  const [showResume, setShowResume] = useState(false);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const generate = trpc.interviewCoach.generate.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setOpenIndex(0);
      toast.success("Your interview prep is ready!");
      setTimeout(() => {
        document.getElementById("coach-results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    onError: (err) => toast.error("Generation failed: " + err.message),
  });

  const handleGenerate = () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 10) {
      toast.error("Please paste a job description (at least 10 characters).");
      return;
    }
    generate.mutate({ jobDescription, resumeText: resumeText || undefined, experienceLevel });
  };

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ background: "#f8f5f0", fontFamily: "'Source Sans 3', sans-serif" }}>
      <PageHeader title="AI Interview Coach" subtitle="Custom prep for every job you apply to" />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-5">

        {/* Hero */}
        <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #2a4a8a 100%)" }}>
          <div className="flex items-center gap-3 mb-2">
            <Brain size={24} color="#c9a84c" />
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>AI Interview Coach</h1>
          </div>
          <p className="text-sm opacity-90">
            Paste any job description and get 7 custom interview questions — with age-positive answer frameworks, power phrases, and red flags to avoid. Built specifically for adults 50+.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-base" style={{ color: "#1a2e5a", fontFamily: "'Playfair Display', serif" }}>
            Prepare for Your Interview
          </h2>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Your Experience Level</label>
            <div className="grid grid-cols-2 gap-2">
              {LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => setExperienceLevel(l.value)}
                  className="p-3 rounded-xl border-2 text-left transition-all"
                  style={{
                    borderColor: experienceLevel === l.value ? "#1a2e5a" : "#e5e7eb",
                    background: experienceLevel === l.value ? "#f0f4ff" : "white",
                  }}>
                  <div className="text-sm font-bold" style={{ color: "#1a2e5a" }}>{l.label}</div>
                  <div className="text-xs" style={{ color: "#9ca3af" }}>{l.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "#374151" }}>
              Job Description *
            </label>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here — the more detail you provide, the more tailored your interview prep will be..."
              rows={7}
              className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
              style={{ borderColor: "#e5e7eb", color: "#374151", fontSize: "15px", lineHeight: "1.6" }}
            />
            <p className="text-xs mt-1 text-right" style={{ color: "#9ca3af" }}>
              {jobDescription.length}/8000 characters
            </p>
          </div>

          {/* Optional Resume */}
          <div>
            <button
              onClick={() => setShowResume(!showResume)}
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: "#c9a84c" }}>
              {showResume ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showResume ? "Hide" : "Add"} Your Background (optional — personalizes the coaching)
            </button>
            {showResume && (
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste a summary of your background, key skills, or relevant experience..."
                rows={5}
                className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 mt-2"
                style={{ borderColor: "#e5e7eb", color: "#374151", fontSize: "15px" }}
              />
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={generate.isPending}
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-opacity"
            style={{ background: "#c9a84c", color: "#1a2e5a", opacity: generate.isPending ? 0.7 : 1 }}>
            {generate.isPending ? (
              <><Loader2 size={20} className="animate-spin" /> Preparing your coaching session...</>
            ) : (
              <><Sparkles size={20} /> Generate My Interview Prep</>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div id="coach-results" className="space-y-4">

            {/* Prep Tip + Age Reframe */}
            <div className="rounded-2xl p-5 space-y-3" style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #2a4a8a 100%)" }}>
              <div className="flex items-start gap-3">
                <Lightbulb size={20} color="#c9a84c" className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#c9a84c" }}>Preparation Tip</div>
                  <p className="text-sm text-white leading-relaxed">{result.prepTip}</p>
                </div>
              </div>
              <div className="border-t border-white/20 pt-3 flex items-start gap-3">
                <Star size={20} color="#c9a84c" className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#c9a84c" }}>Your Age-Positive Reframe</div>
                  <p className="text-sm text-white leading-relaxed italic">"{result.ageReframe}"</p>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b" style={{ borderColor: "#f0f0f0" }}>
                <h2 className="font-bold text-base" style={{ color: "#1a2e5a", fontFamily: "'Playfair Display', serif" }}>
                  Your 7 Custom Interview Questions
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Tap each question to reveal the full coaching</p>
              </div>

              {result.questions.map((q, i) => (
                <div key={i} className="border-b last:border-b-0" style={{ borderColor: "#f0f0f0" }}>
                  {/* Question Header */}
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full px-5 py-4 text-left flex items-start gap-3 transition-colors"
                    style={{ background: openIndex === i ? "#f8f5f0" : "white" }}>
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "#1a2e5a", minWidth: "28px" }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-snug" style={{ color: "#1a2e5a" }}>{q.question}</p>
                      {openIndex !== i && (
                        <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Tap to see coaching</p>
                      )}
                    </div>
                    {openIndex === i
                      ? <ChevronUp size={18} style={{ color: "#9ca3af", flexShrink: 0 }} />
                      : <ChevronDown size={18} style={{ color: "#9ca3af", flexShrink: 0 }} />
                    }
                  </button>

                  {/* Expanded Coaching */}
                  {openIndex === i && (
                    <div className="px-5 pb-5 space-y-3" style={{ background: "#f8f5f0" }}>

                      {/* Why Asked */}
                      <div className="rounded-xl p-3" style={{ background: "#eff4ff", border: "1px solid #c5d5f0" }}>
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare size={14} color="#1a2e5a" />
                          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#1a2e5a" }}>Why They Ask This</span>
                        </div>
                        <p className="text-sm" style={{ color: "#374151" }}>{q.whyAsked}</p>
                      </div>

                      {/* Answer Framework */}
                      <div className="rounded-xl p-3" style={{ background: "white", border: "1px solid #e5e7eb" }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Brain size={14} color="#1a2e5a" />
                          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#1a2e5a" }}>Your Answer Framework</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{q.framework}</p>
                      </div>

                      {/* Power Phrase */}
                      <div className="rounded-xl p-3" style={{ background: "#fffbeb", border: "1.5px solid #c9a84c" }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Zap size={14} color="#c9a84c" />
                          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#c9a84c" }}>Power Phrase to Use</span>
                        </div>
                        <p className="text-sm font-medium italic" style={{ color: "#374151" }}>"{q.powerPhrase}"</p>
                      </div>

                      {/* Red Flag */}
                      <div className="rounded-xl p-3" style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle size={14} color="#e11d48" />
                          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#e11d48" }}>Red Flag to Avoid</span>
                        </div>
                        <p className="text-sm" style={{ color: "#374151" }}>{q.redFlag}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Regenerate */}
            <button
              onClick={handleGenerate}
              disabled={generate.isPending}
              className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: "white", color: "#1a2e5a", border: "2px solid #1a2e5a" }}>
              {generate.isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Regenerate Questions
            </button>
          </div>
        )}
      </main>
      <PageFooter />
    </div>
  );
}
