import { useState } from "react";
import { trpc } from "@/lib/trpc";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { Copy, Download, RefreshCw, CheckCircle2, Mail, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

type Tone = "professional" | "warm" | "confident";

const TONES: { value: Tone; label: string; desc: string; emoji: string }[] = [
  { value: "professional", label: "Professional", desc: "Formal & polished", emoji: "💼" },
  { value: "warm", label: "Warm", desc: "Friendly & human", emoji: "🤝" },
  { value: "confident", label: "Confident", desc: "Bold & assertive", emoji: "⚡" },
];

export default function CoverLetterBuilder() {
  const [form, setForm] = useState({
    name: "",
    jobTitle: "",
    company: "",
    skills: "",
    achievement: "",
    tone: "professional" as Tone,
    jobDescription: "",
  });
  const [showJobDesc, setShowJobDesc] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedLetter, setEditedLetter] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = trpc.coverLetter.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedLetter(data.letter);
      setEditedLetter(data.letter);
      setIsEditing(false);
      toast.success("Your cover letter is ready!");
      setTimeout(() => {
        document.getElementById("letter-preview")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    onError: (err) => toast.error("Generation failed: " + err.message),
  });

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleGenerate = () => {
    if (!form.name.trim()) { toast.error("Please enter your name."); return; }
    if (!form.jobTitle.trim()) { toast.error("Please enter the job title."); return; }
    if (!form.company.trim()) { toast.error("Please enter the company name."); return; }
    if (!form.skills.trim()) { toast.error("Please enter your top skills."); return; }
    if (!form.achievement.trim()) { toast.error("Please enter a key achievement."); return; }
    generate.mutate(form);
  };

  const displayLetter = isEditing ? editedLetter : generatedLetter;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayLetter);
    setCopied(true);
    toast.success("Cover letter copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([displayLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${form.company.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded!");
  };

  const inputStyle = {
    fontFamily: "'Source Sans 3', sans-serif",
    borderColor: "#D1D5DB",
    background: "white",
    color: "#374151",
    fontSize: "15px",
  };

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ background: "#f8f5f0", fontFamily: "'Source Sans 3', sans-serif" }}>
      <PageHeader title="Cover Letter Builder" subtitle="AI-powered, age-positive cover letters in seconds" />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-5">

        {/* Hero */}
        <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #2a4a8a 100%)" }}>
          <div className="flex items-center gap-3 mb-2">
            <Mail size={24} color="#c9a84c" />
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>AI Cover Letter Builder</h1>
          </div>
          <p className="text-sm opacity-90">
            Fill in a few details and our AI writes a compelling, age-positive cover letter tailored to your role — no templates, no generic text.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-base" style={{ color: "#1a2e5a", fontFamily: "'Playfair Display', serif" }}>
            Your Details
          </h2>

          {[
            { field: "name", label: "Your Full Name *", placeholder: "e.g. Janice Williams" },
            { field: "jobTitle", label: "Job Title You're Applying For *", placeholder: "e.g. Executive Assistant" },
            { field: "company", label: "Company Name *", placeholder: "e.g. Acme Corporation" },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#374151" }}>{label}</label>
              <input
                type="text"
                value={form[field as keyof typeof form]}
                onChange={e => set(field, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                style={inputStyle}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "#374151" }}>
              Your Top Skills *
            </label>
            <input
              type="text"
              value={form.skills}
              onChange={e => set("skills", e.target.value)}
              placeholder="e.g. Office Management, QuickBooks, Team Leadership"
              className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              style={inputStyle}
            />
            <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>Separate skills with commas</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "#374151" }}>
              One Key Achievement *
            </label>
            <textarea
              value={form.achievement}
              onChange={e => set("achievement", e.target.value)}
              placeholder="e.g. Reduced office supply costs by 30% by renegotiating vendor contracts"
              rows={3}
              className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
              style={inputStyle}
            />
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Letter Tone</label>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map(t => (
                <button
                  key={t.value}
                  onClick={() => set("tone", t.value)}
                  className="p-3 rounded-xl border-2 text-center transition-all"
                  style={{
                    borderColor: form.tone === t.value ? "#1a2e5a" : "#e5e7eb",
                    background: form.tone === t.value ? "#f0f4ff" : "white",
                  }}>
                  <div className="text-base mb-0.5">{t.emoji}</div>
                  <div className="text-xs font-bold" style={{ color: "#1a2e5a" }}>{t.label}</div>
                  <div className="text-xs" style={{ color: "#9ca3af" }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Job Description */}
          <div>
            <button
              onClick={() => setShowJobDesc(!showJobDesc)}
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: "#c9a84c" }}>
              {showJobDesc ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showJobDesc ? "Hide" : "Add"} Job Description (optional — greatly improves accuracy)
            </button>
            {showJobDesc && (
              <textarea
                value={form.jobDescription}
                onChange={e => set("jobDescription", e.target.value)}
                placeholder="Paste the job description here for a more tailored, keyword-rich letter..."
                rows={5}
                className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 mt-2"
                style={inputStyle}
              />
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={generate.isPending}
            className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-opacity"
            style={{ background: "#c9a84c", color: "#1a2e5a", opacity: generate.isPending ? 0.7 : 1 }}>
            {generate.isPending ? (
              <><Loader2 size={20} className="animate-spin" style={{ color: "#1a2e5a" }} /> Writing your letter...</>
            ) : (
              <><Sparkles size={20} style={{ color: "#1a2e5a" }} /> Generate with AI</>
            )}
          </button>
        </div>

        {/* Generated Letter */}
        {generatedLetter && (
          <div id="letter-preview" className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} color="#16a34a" />
                <h2 className="font-bold text-base" style={{ color: "#1a2e5a", fontFamily: "'Playfair Display', serif" }}>
                  Your Cover Letter
                </h2>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm font-semibold px-3 py-1 rounded-lg border"
                style={{ color: "#1a2e5a", borderColor: "#1a2e5a", background: isEditing ? "#f0f4ff" : "white" }}>
                {isEditing ? "Preview" : "✏️ Edit"}
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={editedLetter}
                onChange={e => setEditedLetter(e.target.value)}
                rows={18}
                className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                style={{ borderColor: "#e5e7eb", color: "#374151", fontSize: "15px", lineHeight: "1.7" }}
              />
            ) : (
              <div
                className="rounded-xl p-4 whitespace-pre-wrap text-sm leading-relaxed"
                style={{
                  background: "#FDF8F0",
                  border: "1.5px solid #C9922A",
                  color: "#2D2D2D",
                  fontSize: "15px",
                  lineHeight: "1.8",
                  fontFamily: "Georgia, serif",
                }}>
                {generatedLetter}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-1 py-3 rounded-xl text-sm font-semibold border transition-all"
                style={{
                  borderColor: copied ? "#6ee7b7" : "#1a2e5a",
                  color: copied ? "#065f46" : "#1a2e5a",
                  background: copied ? "#d1fae5" : "white",
                }}>
                {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-1 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: "#1a2e5a" }}>
                <Download size={15} /> Download
              </button>
              <button
                onClick={handleGenerate}
                disabled={generate.isPending}
                className="flex items-center justify-center gap-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: "#c9a84c", color: "#1a2e5a" }}>
                {generate.isPending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                Redo
              </button>
            </div>

            <div className="rounded-xl p-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <p className="text-xs" style={{ color: "#15803d" }}>
                <strong>Tip:</strong> Click "Edit" to personalize any section. Adding the job description before generating produces a significantly more tailored and keyword-rich letter.
              </p>
            </div>

            <button
              onClick={() => { setGeneratedLetter(""); setEditedLetter(""); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "#f3f4f6", color: "#6b7280" }}>
              <RefreshCw size={14} /> Start Over
            </button>
          </div>
        )}
      </main>
      <PageFooter />
    </div>
  );
}
