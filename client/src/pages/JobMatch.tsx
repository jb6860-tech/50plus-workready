import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { toast } from "sonner";
import {
  Target, Zap, AlertCircle, CheckCircle2, TrendingUp, FileText,
  MessageSquare, Lightbulb, Lock, Loader2, Copy, ChevronDown, ChevronUp
} from "lucide-react";

interface MatchResult {
  matchScore: number;
  summary: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengthAreas: string[];
  gapAreas: { gap: string; suggestion: string }[];
  tailoredBullets: string[];
  coverLetterHook: string;
  interviewPrepTips: string[];
}

export default function JobMatch() {
  const { isAuthenticated } = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    keywords: true, gaps: true, bullets: false, interview: false,
  });

  const analyze = trpc.jobMatch.analyze.useMutation({
    onSuccess: (data) => setResult(data as MatchResult),
    onError: (err) => toast.error("Analysis failed: " + err.message),
  });

  const toggleSection = (key: string) =>
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(label + " copied to clipboard!");
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "#16a34a";
    if (score >= 50) return "#d97706";
    return "#dc2626";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return "Strong Match";
    if (score >= 50) return "Moderate Match";
    return "Needs Work";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#f8f5f0", fontFamily: "'Source Sans 3', sans-serif" }}>
        <PageHeader title="AI Job Match" />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#1a2e5a" }}>
              <Lock size={28} color="white" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#1a2e5a", fontFamily: "'Playfair Display', serif" }}>
              Sign In to Use AI Job Match
            </h2>
            <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
              Paste your resume and a job description to get an instant AI-powered compatibility score and tailored improvement tips.
            </p>
            <a href={getLoginUrl()} className="inline-block px-6 py-3 rounded-xl text-white font-semibold"
              style={{ background: "#1a2e5a" }}>
              Sign In Free
            </a>
          </div>
        </main>
        <PageFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ background: "#f8f5f0", fontFamily: "'Source Sans 3', sans-serif" }}>
      <PageHeader title="AI Job Match" />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-5">

        {/* Hero */}
        <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #2a4a8a 100%)" }}>
          <div className="flex items-center gap-3 mb-2">
            <Target size={24} color="#c9a84c" />
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>AI Job Match Analyzer</h1>
          </div>
          <p className="text-sm opacity-90">
            Paste your resume and a job description. Our AI will score your compatibility, identify missing keywords, and give you tailored bullet points to land the interview.
          </p>
        </div>

        {/* Input Form */}
        {!result && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-semibold mb-2" style={{ color: "#1a2e5a" }}>
                Your Resume Text
              </label>
              <p className="text-xs mb-3" style={{ color: "#9ca3af" }}>
                Paste the text from your resume (copy from Word or PDF)
              </p>
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                rows={8}
                className="w-full rounded-xl border p-3 text-sm resize-none focus:outline-none focus:ring-2"
                style={{ borderColor: "#e5e7eb", color: "#374151", fontSize: "15px", lineHeight: "1.6" }}
              />
              <p className="text-xs mt-1 text-right" style={{ color: "#9ca3af" }}>
                {resumeText.length}/8000 characters
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-semibold mb-2" style={{ color: "#1a2e5a" }}>
                Job Description
              </label>
              <p className="text-xs mb-3" style={{ color: "#9ca3af" }}>
                Paste the full job posting you want to apply for
              </p>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={8}
                className="w-full rounded-xl border p-3 text-sm resize-none focus:outline-none focus:ring-2"
                style={{ borderColor: "#e5e7eb", color: "#374151", fontSize: "15px", lineHeight: "1.6" }}
              />
              <p className="text-xs mt-1 text-right" style={{ color: "#9ca3af" }}>
                {jobDescription.length}/8000 characters
              </p>
            </div>

            <button
              onClick={() => {
                if (resumeText.trim().length < 20) { toast.error("Please paste your resume text first."); return; }
                if (jobDescription.trim().length < 20) { toast.error("Please paste the job description first."); return; }
                analyze.mutate({ resumeText, jobDescription });
              }}
              disabled={analyze.isPending}
              className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-opacity"
              style={{ background: "#1a2e5a", opacity: analyze.isPending ? 0.7 : 1 }}
            >
              {analyze.isPending ? (
                <><Loader2 size={20} className="animate-spin" /> Analyzing your match...</>
              ) : (
                <><Target size={20} /> Analyze My Match</>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Score Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="relative inline-flex items-center justify-center mb-3">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke={getScoreColor(result.matchScore)} strokeWidth="10"
                    strokeDasharray={`${(result.matchScore / 100) * 314} 314`}
                    strokeLinecap="round" transform="rotate(-90 60 60)" />
                </svg>
                <div className="absolute text-center">
                  <div className="text-3xl font-bold" style={{ color: getScoreColor(result.matchScore) }}>
                    {result.matchScore}
                  </div>
                  <div className="text-xs font-semibold" style={{ color: "#6b7280" }}>/ 100</div>
                </div>
              </div>
              <div className="text-lg font-bold mb-2" style={{ color: "#1a2e5a", fontFamily: "'Playfair Display', serif" }}>
                {getScoreLabel(result.matchScore)}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#4b5563" }}>{result.summary}</p>
            </div>

            {/* Strength Areas */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: "#16a34a" }}>
                <CheckCircle2 size={18} /> Your Strengths ({result.strengthAreas.length})
              </h3>
              <div className="space-y-2">
                {result.strengthAreas.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm" style={{ color: "#374151" }}>
                    <span className="mt-0.5 text-green-500">✓</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <button className="w-full flex items-center justify-between font-bold mb-1"
                style={{ color: "#1a2e5a" }}
                onClick={() => toggleSection("keywords")}>
                <span className="flex items-center gap-2"><Zap size={18} color="#c9a84c" /> Keywords Analysis</span>
                {expandedSections.keywords ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.keywords && (
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: "#16a34a" }}>
                      ✓ Found in your resume ({result.matchedKeywords.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedKeywords.map((kw, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ background: "#dcfce7", color: "#15803d" }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: "#dc2626" }}>
                      ✗ Missing — add these ({result.missingKeywords.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.map((kw, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ background: "#fee2e2", color: "#dc2626" }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Gap Areas */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <button className="w-full flex items-center justify-between font-bold mb-1"
                style={{ color: "#1a2e5a" }}
                onClick={() => toggleSection("gaps")}>
                <span className="flex items-center gap-2"><AlertCircle size={18} color="#d97706" /> Gaps & How to Fix Them</span>
                {expandedSections.gaps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.gaps && (
                <div className="mt-3 space-y-3">
                  {result.gapAreas.map((g, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                      <p className="text-sm font-semibold mb-1" style={{ color: "#92400e" }}>⚠ {g.gap}</p>
                      <p className="text-sm" style={{ color: "#78350f" }}>💡 {g.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tailored Bullets */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <button className="w-full flex items-center justify-between font-bold mb-1"
                style={{ color: "#1a2e5a" }}
                onClick={() => toggleSection("bullets")}>
                <span className="flex items-center gap-2"><TrendingUp size={18} color="#1a2e5a" /> Tailored Resume Bullets</span>
                {expandedSections.bullets ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.bullets && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs mb-3" style={{ color: "#9ca3af" }}>
                    Use these rewritten bullets in your resume to match this job's language:
                  </p>
                  {result.tailoredBullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl"
                      style={{ background: "#f0f4ff", border: "1px solid #c7d2fe" }}>
                      <span className="text-sm flex-1" style={{ color: "#1e40af" }}>• {b}</span>
                      <button onClick={() => copyText(b, "Bullet")} className="shrink-0 text-blue-400 hover:text-blue-600">
                        <Copy size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Letter Hook */}
            <div className="rounded-2xl p-5 shadow-sm" style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #2a4a8a 100%)" }}>
              <h3 className="font-bold mb-2 flex items-center gap-2 text-white">
                <FileText size={18} color="#c9a84c" /> Your Cover Letter Opening Line
              </h3>
              <p className="text-sm text-white opacity-90 italic mb-3">"{result.coverLetterHook}"</p>
              <button
                onClick={() => copyText(result.coverLetterHook, "Opening line")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: "#c9a84c", color: "#1a2e5a" }}>
                <Copy size={14} /> Copy This Line
              </button>
            </div>

            {/* Interview Tips */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <button className="w-full flex items-center justify-between font-bold mb-1"
                style={{ color: "#1a2e5a" }}
                onClick={() => toggleSection("interview")}>
                <span className="flex items-center gap-2"><MessageSquare size={18} color="#7c3aed" /> Likely Interview Questions</span>
                {expandedSections.interview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.interview && (
                <div className="mt-3 space-y-3">
                  {result.interviewPrepTips.map((tip, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: "#faf5ff", border: "1px solid #e9d5ff" }}>
                      <p className="text-sm" style={{ color: "#6b21a8" }}>{i + 1}. {tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => { setResult(null); setResumeText(""); setJobDescription(""); }}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm border"
                style={{ borderColor: "#1a2e5a", color: "#1a2e5a", background: "white" }}>
                Analyze Another Job
              </button>
              <button
                onClick={() => copyText(
                  `Match Score: ${result.matchScore}/100\n\nSummary: ${result.summary}\n\nMissing Keywords: ${result.missingKeywords.join(", ")}\n\nCover Letter Hook: ${result.coverLetterHook}`,
                  "Match summary"
                )}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white"
                style={{ background: "#1a2e5a" }}>
                Copy Summary
              </button>
            </div>

            <div className="rounded-2xl p-4" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <div className="flex items-start gap-2">
                <Lightbulb size={16} color="#16a34a" className="mt-0.5 shrink-0" />
                <p className="text-xs" style={{ color: "#15803d" }}>
                  <strong>Pro Tip:</strong> Add the missing keywords naturally into your resume's summary and experience bullets. Even a 10-point score improvement can double your chances of passing ATS screening.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <PageFooter />
    </div>
  );
}
