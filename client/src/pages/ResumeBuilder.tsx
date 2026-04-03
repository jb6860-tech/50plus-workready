/*
 * DESIGN: "Warm Authority" — Resume Builder with Save & Resume Later, 3 templates, AI feedback
 * Multi-step form: Contact → Summary → Experience → Education → Skills → Preview
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Save, Download, Sparkles, CheckCircle, AlertTriangle, Info, Loader2, LayoutTemplate, Star, Zap, Target, Shield } from "lucide-react";
import PageFooter from "@/components/PageFooter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkExp {
  company: string;
  title: string;
  startYear: string;
  endYear: string;
  bullets: string[];
}

interface Education {
  school: string;
  degree: string;
  field: string;
  year: string;
}

interface ResumeData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  linkedin: string;
  summary: string;
  experience: WorkExp[];
  education: Education[];
  skills: string[];
}

type Template = "classic" | "modern" | "compact";

const EMPTY_EXP: WorkExp = { company: "", title: "", startYear: "", endYear: "", bullets: [""] };
const EMPTY_EDU: Education = { school: "", degree: "", field: "", year: "" };

const INITIAL_DATA: ResumeData = {
  firstName: "", lastName: "", email: "", phone: "", city: "", state: "", linkedin: "",
  summary: "",
  experience: [{ ...EMPTY_EXP }],
  education: [{ ...EMPTY_EDU }],
  skills: [],
};

const SUGGESTED_SKILLS = [
  "Microsoft Office", "Google Workspace", "Project Management", "Team Leadership",
  "Customer Service", "Data Analysis", "Budget Management", "Strategic Planning",
  "Communication", "Problem Solving", "Training & Development", "Process Improvement",
  "CRM Software", "QuickBooks", "Salesforce", "Zoom / Teams", "Time Management", "Mentoring",
];

const SUMMARY_EXAMPLES = [
  "Results-driven professional with 20+ years of experience in administrative operations, team leadership, and process improvement. Known for building strong client relationships and delivering projects on time and within budget.",
  "Dedicated HR professional with extensive experience in talent acquisition, employee relations, and organizational development. Committed to fostering inclusive workplaces and developing high-performing teams.",
  "Versatile operations manager with a track record of streamlining workflows, reducing costs, and leading cross-functional teams. Adept at translating complex challenges into practical, scalable solutions.",
];

const STEPS = ["Contact", "Summary", "Experience", "Education", "Skills", "Preview"];

// ─── Template Renderers ───────────────────────────────────────────────────────

function ClassicTemplate({ data }: { data: ResumeData }) {
  const name = [data.firstName, data.lastName].filter(Boolean).join(" ") || "Your Name";
  const location = [data.city, data.state].filter(Boolean).join(", ");
  return (
    <div id="resume-preview" style={{ fontFamily: "'Times New Roman', serif", fontSize: "11pt", color: "#1a1a1a", background: "#fff", padding: "32px 36px", maxWidth: "680px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", borderBottom: "2px solid #1B3A6B", paddingBottom: "12px", marginBottom: "16px" }}>
        <div style={{ fontSize: "22pt", fontWeight: "bold", color: "#1B3A6B" }}>{name}</div>
        <div style={{ fontSize: "10pt", color: "#555", marginTop: "4px" }}>
          {[data.email, data.phone, location, data.linkedin].filter(Boolean).join(" · ")}
        </div>
      </div>
      {data.summary && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "12pt", fontWeight: "bold", color: "#1B3A6B", borderBottom: "1px solid #C9922A", paddingBottom: "2px", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Professional Summary</div>
          <div style={{ lineHeight: "1.5" }}>{data.summary}</div>
        </div>
      )}
      {data.experience.some(e => e.company || e.title) && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "12pt", fontWeight: "bold", color: "#1B3A6B", borderBottom: "1px solid #C9922A", paddingBottom: "2px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Professional Experience</div>
          {data.experience.filter(e => e.company || e.title).map((exp, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: "bold" }}>{exp.title || "Position"}</div>
                <div style={{ color: "#555", fontSize: "10pt" }}>{[exp.startYear, exp.endYear].filter(Boolean).join(" – ")}</div>
              </div>
              <div style={{ fontStyle: "italic", color: "#444", marginBottom: "4px" }}>{exp.company}</div>
              <ul style={{ margin: "0", paddingLeft: "18px" }}>
                {exp.bullets.filter(Boolean).map((b, j) => <li key={j} style={{ marginBottom: "2px" }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      {data.education.some(e => e.school || e.degree) && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "12pt", fontWeight: "bold", color: "#1B3A6B", borderBottom: "1px solid #C9922A", paddingBottom: "2px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Education</div>
          {data.education.filter(e => e.school || e.degree).map((edu, i) => (
            <div key={i} style={{ marginBottom: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: "bold" }}>{[edu.degree, edu.field].filter(Boolean).join(" in ")}</div>
                <div style={{ color: "#555", fontSize: "10pt" }}>{edu.year}</div>
              </div>
              <div style={{ fontStyle: "italic", color: "#444" }}>{edu.school}</div>
            </div>
          ))}
        </div>
      )}
      {data.skills.length > 0 && (
        <div>
          <div style={{ fontSize: "12pt", fontWeight: "bold", color: "#1B3A6B", borderBottom: "1px solid #C9922A", paddingBottom: "2px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Core Competencies</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {data.skills.map((s, i) => <span key={i} style={{ background: "#f0f4ff", border: "1px solid #1B3A6B", borderRadius: "3px", padding: "2px 8px", fontSize: "10pt" }}>{s}</span>)}
          </div>
        </div>
      )}
      <div style={{ marginTop: "24px", borderTop: "1px solid #eee", paddingTop: "8px", textAlign: "center", fontSize: "9pt", color: "#aaa" }}>Built for the experienced. Designed for the future. · 50+ WorkReady</div>
    </div>
  );
}

function ModernTemplate({ data }: { data: ResumeData }) {
  const name = [data.firstName, data.lastName].filter(Boolean).join(" ") || "Your Name";
  const location = [data.city, data.state].filter(Boolean).join(", ");
  return (
    <div id="resume-preview" style={{ fontFamily: "'Arial', sans-serif", fontSize: "10.5pt", color: "#1a1a1a", background: "#fff", maxWidth: "680px", margin: "0 auto", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: "220px", minWidth: "220px", background: "#1B3A6B", color: "#fff", padding: "28px 18px", flexShrink: 0 }}>
        <div style={{ fontSize: "18pt", fontWeight: "bold", lineHeight: "1.2", marginBottom: "4px" }}>{name}</div>
        <div style={{ width: "40px", height: "3px", background: "#C9922A", marginBottom: "16px" }}></div>
        <div style={{ fontSize: "9pt", marginBottom: "16px", lineHeight: "1.6" }}>
          {data.email && <div>✉ {data.email}</div>}
          {data.phone && <div>📞 {data.phone}</div>}
          {location && <div>📍 {location}</div>}
          {data.linkedin && <div>🔗 {data.linkedin}</div>}
        </div>
        {data.skills.length > 0 && (
          <>
            <div style={{ fontSize: "10pt", fontWeight: "bold", color: "#C9922A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Skills</div>
            {data.skills.map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.12)", borderRadius: "3px", padding: "3px 8px", marginBottom: "4px", fontSize: "9pt" }}>{s}</div>
            ))}
          </>
        )}
        {data.education.some(e => e.school || e.degree) && (
          <div style={{ marginTop: "16px" }}>
            <div style={{ fontSize: "10pt", fontWeight: "bold", color: "#C9922A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Education</div>
            {data.education.filter(e => e.school || e.degree).map((edu, i) => (
              <div key={i} style={{ marginBottom: "8px", fontSize: "9pt" }}>
                <div style={{ fontWeight: "bold" }}>{[edu.degree, edu.field].filter(Boolean).join(" in ")}</div>
                <div style={{ color: "#ccc" }}>{edu.school}</div>
                {edu.year && <div style={{ color: "#aaa" }}>{edu.year}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: "28px 24px" }}>
        {data.summary && (
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "11pt", fontWeight: "bold", color: "#1B3A6B", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Profile</div>
            <div style={{ lineHeight: "1.6", color: "#333" }}>{data.summary}</div>
          </div>
        )}
        {data.experience.some(e => e.company || e.title) && (
          <div>
            <div style={{ fontSize: "11pt", fontWeight: "bold", color: "#1B3A6B", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Experience</div>
            {data.experience.filter(e => e.company || e.title).map((exp, i) => (
              <div key={i} style={{ marginBottom: "14px", paddingLeft: "12px", borderLeft: "3px solid #C9922A" }}>
                <div style={{ fontWeight: "bold", fontSize: "11pt" }}>{exp.title || "Position"}</div>
                <div style={{ color: "#1B3A6B", fontSize: "10pt", marginBottom: "2px" }}>{exp.company} {exp.startYear && <span style={{ color: "#888" }}>· {[exp.startYear, exp.endYear].filter(Boolean).join(" – ")}</span>}</div>
                <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px" }}>
                  {exp.bullets.filter(Boolean).map((b, j) => <li key={j} style={{ marginBottom: "2px", color: "#333" }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: "24px", borderTop: "1px solid #eee", paddingTop: "8px", textAlign: "center", fontSize: "8pt", color: "#bbb" }}>Built for the experienced. Designed for the future. · 50+ WorkReady</div>
      </div>
    </div>
  );
}

function CompactTemplate({ data }: { data: ResumeData }) {
  const name = [data.firstName, data.lastName].filter(Boolean).join(" ") || "Your Name";
  const location = [data.city, data.state].filter(Boolean).join(", ");
  return (
    <div id="resume-preview" style={{ fontFamily: "'Calibri', 'Arial', sans-serif", fontSize: "10pt", color: "#1a1a1a", background: "#fff", padding: "24px 28px", maxWidth: "680px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "10px" }}>
        <div>
          <div style={{ fontSize: "20pt", fontWeight: "bold", color: "#1B3A6B" }}>{name}</div>
          <div style={{ fontSize: "9pt", color: "#666" }}>{[data.email, data.phone, location].filter(Boolean).join(" | ")}</div>
        </div>
        {data.linkedin && <div style={{ fontSize: "9pt", color: "#0077B5" }}>{data.linkedin}</div>}
      </div>
      <div style={{ height: "2px", background: "linear-gradient(to right, #1B3A6B, #C9922A)", marginBottom: "10px" }}></div>
      {data.summary && <div style={{ marginBottom: "10px", fontSize: "9.5pt", lineHeight: "1.5", color: "#333" }}>{data.summary}</div>}
      {data.skills.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <span style={{ fontWeight: "bold", color: "#1B3A6B", fontSize: "9.5pt" }}>Skills: </span>
          <span style={{ fontSize: "9.5pt" }}>{data.skills.join(" · ")}</span>
        </div>
      )}
      {data.experience.some(e => e.company || e.title) && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontWeight: "bold", color: "#1B3A6B", fontSize: "10pt", marginBottom: "6px", borderBottom: "1px solid #C9922A", paddingBottom: "2px" }}>EXPERIENCE</div>
          {data.experience.filter(e => e.company || e.title).map((exp, i) => (
            <div key={i} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold" }}>{exp.title}</span>
                <span style={{ fontSize: "9pt", color: "#666" }}>{[exp.startYear, exp.endYear].filter(Boolean).join("–")}</span>
              </div>
              <div style={{ fontSize: "9.5pt", color: "#444", marginBottom: "2px" }}>{exp.company}</div>
              {exp.bullets.filter(Boolean).map((b, j) => <div key={j} style={{ fontSize: "9pt", paddingLeft: "10px" }}>• {b}</div>)}
            </div>
          ))}
        </div>
      )}
      {data.education.some(e => e.school || e.degree) && (
        <div>
          <div style={{ fontWeight: "bold", color: "#1B3A6B", fontSize: "10pt", marginBottom: "6px", borderBottom: "1px solid #C9922A", paddingBottom: "2px" }}>EDUCATION</div>
          {data.education.filter(e => e.school || e.degree).map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <div><span style={{ fontWeight: "bold" }}>{[edu.degree, edu.field].filter(Boolean).join(" in ")}</span> · {edu.school}</div>
              <div style={{ fontSize: "9pt", color: "#666" }}>{edu.year}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: "16px", borderTop: "1px solid #eee", paddingTop: "6px", textAlign: "center", fontSize: "8pt", color: "#bbb" }}>Built for the experienced. Designed for the future. · 50+ WorkReady</div>
    </div>
  );
}

// ─── AI Feedback Panel ────────────────────────────────────────────────────────

interface AIFeedback {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: { title: string; detail: string; priority: "high" | "medium" | "low" }[];
  ageBiasFlags: string[];
  atsKeywords: string[];
  quickWins: string[];
}

function AIFeedbackPanel({ feedback }: { feedback: AIFeedback }) {
  const scoreColor = feedback.overallScore >= 75 ? "#22c55e" : feedback.overallScore >= 50 ? "#f59e0b" : "#ef4444";
  const priorityColor = (p: string) => p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#22c55e";

  return (
    <div style={{ background: "#f8f9ff", border: "1px solid #e0e7ff", borderRadius: "12px", padding: "20px", marginTop: "16px" }}>
      {/* Score */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", border: `4px solid ${scoreColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "20pt", fontWeight: "bold", color: scoreColor }}>{feedback.overallScore}</span>
        </div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "14pt", color: "#1B3A6B" }}>Resume Score</div>
          <div style={{ color: "#555", fontSize: "10pt", lineHeight: "1.5" }}>{feedback.summary}</div>
        </div>
      </div>

      {/* Quick Wins */}
      {feedback.quickWins.length > 0 && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", padding: "12px", marginBottom: "12px" }}>
          <div style={{ fontWeight: "bold", color: "#C9922A", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Zap size={14} /> Quick Wins — Do These First
          </div>
          {feedback.quickWins.map((w, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "4px", fontSize: "10pt" }}>
              <span style={{ color: "#C9922A", fontWeight: "bold" }}>{i + 1}.</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontWeight: "bold", color: "#16a34a", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle size={14} /> Strengths
          </div>
          {feedback.strengths.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "4px", fontSize: "10pt" }}>
              <span style={{ color: "#16a34a" }}>✓</span><span>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Improvements */}
      {feedback.improvements.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontWeight: "bold", color: "#1B3A6B", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Target size={14} /> Suggested Improvements
          </div>
          {feedback.improvements.map((imp, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "10px", marginBottom: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontWeight: "bold", fontSize: "10pt" }}>{imp.title}</span>
                <span style={{ fontSize: "8pt", background: priorityColor(imp.priority), color: "#fff", borderRadius: "4px", padding: "1px 6px" }}>{imp.priority.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: "9.5pt", color: "#555" }}>{imp.detail}</div>
            </div>
          ))}
        </div>
      )}

      {/* Age Bias Flags */}
      {feedback.ageBiasFlags.length > 0 && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px", marginBottom: "12px" }}>
          <div style={{ fontWeight: "bold", color: "#dc2626", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Shield size={14} /> Age Bias Flags
          </div>
          {feedback.ageBiasFlags.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "4px", fontSize: "10pt" }}>
              <span style={{ color: "#dc2626" }}>⚠</span><span>{f}</span>
            </div>
          ))}
        </div>
      )}

      {/* ATS Keywords */}
      {feedback.atsKeywords.length > 0 && (
        <div>
          <div style={{ fontWeight: "bold", color: "#1B3A6B", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Info size={14} /> ATS Keywords to Add
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {feedback.atsKeywords.map((k, i) => (
              <span key={i} style={{ background: "#e0e7ff", color: "#1B3A6B", borderRadius: "4px", padding: "3px 10px", fontSize: "9.5pt" }}>{k}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResumeBuilder() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ResumeData>(INITIAL_DATA);
  const [template, setTemplate] = useState<Template>("classic");
  const [aiTab, setAiTab] = useState<"form" | "feedback">("form");
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // tRPC hooks
  const { data: savedDraft } = trpc.resume.load.useQuery(undefined, { enabled: isAuthenticated });
  const saveMutation = trpc.resume.save.useMutation();
  const analyzeMutation = trpc.resume.analyze.useMutation();

  // Load saved draft on mount
  useEffect(() => {
    if (savedDraft?.data) {
      try {
        const parsed = JSON.parse(savedDraft.data) as ResumeData;
        setData(parsed);
        setTemplate((savedDraft.template as Template) || "classic");
        toast.success("Your saved resume has been loaded!", { duration: 3000 });
      } catch { /* ignore parse errors */ }
    }
  }, [savedDraft]);

  // Auto-save when data changes (debounced 3s)
  const triggerAutoSave = useCallback((newData: ResumeData, newTemplate: Template) => {
    if (!isAuthenticated) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveStatus("saving");
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await saveMutation.mutateAsync({ data: JSON.stringify(newData), template: newTemplate });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch { setSaveStatus("idle"); }
    }, 3000);
  }, [isAuthenticated, saveMutation]);

  const updateData = (patch: Partial<ResumeData>) => {
    const next = { ...data, ...patch };
    setData(next);
    triggerAutoSave(next, template);
  };

  const updateTemplate = (t: Template) => {
    setTemplate(t);
    triggerAutoSave(data, t);
  };

  // Manual save
  const handleManualSave = async () => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    setSaveStatus("saving");
    try {
      await saveMutation.mutateAsync({ data: JSON.stringify(data), template });
      setSaveStatus("saved");
      toast.success("Resume saved! You can return anytime to continue.");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch { setSaveStatus("idle"); toast.error("Save failed. Please try again."); }
  };

  // AI Analyze
  const handleAnalyze = async () => {
    const lines: string[] = [];
    const name = [data.firstName, data.lastName].filter(Boolean).join(" ");
    if (name) lines.push(`Name: ${name}`);
    if (data.summary) lines.push(`Summary: ${data.summary}`);
    data.experience.filter(e => e.company || e.title).forEach(e => {
      lines.push(`\nRole: ${e.title} at ${e.company} (${e.startYear}–${e.endYear})`);
      e.bullets.filter(Boolean).forEach(b => lines.push(`- ${b}`));
    });
    data.education.filter(e => e.school).forEach(e => {
      lines.push(`Education: ${e.degree} ${e.field} from ${e.school}`);
    });
    if (data.skills.length) lines.push(`Skills: ${data.skills.join(", ")}`);
    const resumeText = lines.join("\n");
    if (resumeText.length < 50) { toast.error("Please fill in more resume details before analyzing."); return; }
    try {
      const result = await analyzeMutation.mutateAsync({ resumeText });
      setAiFeedback(result as AIFeedback);
      setAiTab("feedback");
    } catch { toast.error("AI analysis failed. Please try again."); }
  };

  // PDF Download
  const handleDownload = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");
    const el = document.getElementById("resume-preview");
    if (!el) return;
    toast.info("Generating your PDF...");
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      const name = [data.firstName, data.lastName].filter(Boolean).join("_") || "Resume";
      pdf.save(`${name}_Resume.pdf`);
    } catch { toast.error("PDF generation failed. Please try again."); }
  };

  // ─── Step Renderers ──────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px",
    fontSize: "15px", background: "#fff", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = { display: "block", fontWeight: "600", color: "#1B3A6B", marginBottom: "4px", fontSize: "14px" };

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#92400e" }}>
            <strong>Age-Bias Tip:</strong> Use a professional email address. Avoid email providers that signal age (e.g., AOL, Hotmail). Gmail is preferred by most recruiters.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[["firstName", "First Name"], ["lastName", "Last Name"], ["email", "Email Address"], ["phone", "Phone Number"], ["city", "City"], ["state", "State"]].map(([field, label]) => (
              <div key={field}>
                <label style={labelStyle}>{label}</label>
                <input style={inputStyle} value={(data as any)[field]} onChange={e => updateData({ [field]: e.target.value })} placeholder={label} />
              </div>
            ))}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>LinkedIn URL (optional)</label>
              <input style={inputStyle} value={data.linkedin} onChange={e => updateData({ linkedin: e.target.value })} placeholder="linkedin.com/in/yourname" />
            </div>
          </div>
        </div>
      );
      case 1: return (
        <div>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#92400e" }}>
            <strong>Age-Bias Tip:</strong> Focus on the last 10–15 years of experience. Avoid phrases like "30+ years of experience" — instead, say "extensive experience" or "proven track record."
          </div>
          <label style={labelStyle}>Professional Summary</label>
          <textarea
            style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
            value={data.summary}
            onChange={e => updateData({ summary: e.target.value })}
            placeholder="Write 2–3 sentences highlighting your expertise, key skills, and value you bring..."
          />
          <div style={{ marginTop: "12px" }}>
            <div style={{ fontWeight: "600", color: "#555", fontSize: "13px", marginBottom: "8px" }}>Tap an example to use it:</div>
            {SUMMARY_EXAMPLES.map((ex, i) => (
              <div key={i} onClick={() => updateData({ summary: ex })}
                style={{ background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: "8px", padding: "10px 12px", marginBottom: "8px", cursor: "pointer", fontSize: "13px", lineHeight: "1.5" }}>
                {ex}
              </div>
            ))}
          </div>
        </div>
      );
      case 2: return (
        <div>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#92400e" }}>
            <strong>Age-Bias Tip:</strong> Only list the last 10–15 years of experience. Use strong action verbs: "Led," "Achieved," "Implemented," "Reduced," "Grew." Quantify results wherever possible.
          </div>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px", marginBottom: "12px", background: "#fafafa" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ fontWeight: "bold", color: "#1B3A6B" }}>Position {i + 1}</div>
                {data.experience.length > 1 && (
                  <button onClick={() => updateData({ experience: data.experience.filter((_, j) => j !== i) })}
                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "13px" }}>Remove</button>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div><label style={labelStyle}>Job Title</label><input style={inputStyle} value={exp.title} onChange={e => { const ex = [...data.experience]; ex[i] = { ...ex[i], title: e.target.value }; updateData({ experience: ex }); }} placeholder="Office Manager" /></div>
                <div><label style={labelStyle}>Company</label><input style={inputStyle} value={exp.company} onChange={e => { const ex = [...data.experience]; ex[i] = { ...ex[i], company: e.target.value }; updateData({ experience: ex }); }} placeholder="ABC Corporation" /></div>
                <div><label style={labelStyle}>Start Year</label><input style={inputStyle} value={exp.startYear} onChange={e => { const ex = [...data.experience]; ex[i] = { ...ex[i], startYear: e.target.value }; updateData({ experience: ex }); }} placeholder="2018" /></div>
                <div><label style={labelStyle}>End Year</label><input style={inputStyle} value={exp.endYear} onChange={e => { const ex = [...data.experience]; ex[i] = { ...ex[i], endYear: e.target.value }; updateData({ experience: ex }); }} placeholder="Present" /></div>
              </div>
              <label style={labelStyle}>Key Achievements (one per line)</label>
              {exp.bullets.map((b, j) => (
                <div key={j} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                  <input style={{ ...inputStyle, flex: 1 }} value={b} onChange={e => { const ex = [...data.experience]; ex[i].bullets[j] = e.target.value; updateData({ experience: ex }); }} placeholder="Led a team of 8 to reduce processing time by 30%" />
                  {exp.bullets.length > 1 && <button onClick={() => { const ex = [...data.experience]; ex[i].bullets = ex[i].bullets.filter((_, k) => k !== j); updateData({ experience: ex }); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>✕</button>}
                </div>
              ))}
              <button onClick={() => { const ex = [...data.experience]; ex[i].bullets.push(""); updateData({ experience: ex }); }}
                style={{ background: "none", border: "1px dashed #1B3A6B", color: "#1B3A6B", borderRadius: "6px", padding: "4px 12px", cursor: "pointer", fontSize: "13px", marginTop: "4px" }}>+ Add Bullet</button>
            </div>
          ))}
          <button onClick={() => updateData({ experience: [...data.experience, { ...EMPTY_EXP }] })}
            style={{ width: "100%", padding: "10px", border: "2px dashed #C9922A", background: "none", color: "#C9922A", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>+ Add Another Position</button>
        </div>
      );
      case 3: return (
        <div>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#92400e" }}>
            <strong>Age-Bias Tip:</strong> Omit graduation years entirely. Simply list your degree, field, and school. This is standard practice and prevents age estimation.
          </div>
          {data.education.map((edu, i) => (
            <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px", marginBottom: "12px", background: "#fafafa" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ fontWeight: "bold", color: "#1B3A6B" }}>Education {i + 1}</div>
                {data.education.length > 1 && <button onClick={() => updateData({ education: data.education.filter((_, j) => j !== i) })} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "13px" }}>Remove</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>School / University</label><input style={inputStyle} value={edu.school} onChange={e => { const ed = [...data.education]; ed[i] = { ...ed[i], school: e.target.value }; updateData({ education: ed }); }} placeholder="State University" /></div>
                <div><label style={labelStyle}>Degree</label><input style={inputStyle} value={edu.degree} onChange={e => { const ed = [...data.education]; ed[i] = { ...ed[i], degree: e.target.value }; updateData({ education: ed }); }} placeholder="Bachelor of Science" /></div>
                <div><label style={labelStyle}>Field of Study</label><input style={inputStyle} value={edu.field} onChange={e => { const ed = [...data.education]; ed[i] = { ...ed[i], field: e.target.value }; updateData({ education: ed }); }} placeholder="Business Administration" /></div>
                <div><label style={labelStyle}>Year (optional)</label><input style={inputStyle} value={edu.year} onChange={e => { const ed = [...data.education]; ed[i] = { ...ed[i], year: e.target.value }; updateData({ education: ed }); }} placeholder="Leave blank to hide" /></div>
              </div>
            </div>
          ))}
          <button onClick={() => updateData({ education: [...data.education, { ...EMPTY_EDU }] })}
            style={{ width: "100%", padding: "10px", border: "2px dashed #C9922A", background: "none", color: "#C9922A", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>+ Add Another Education</button>
        </div>
      );
      case 4: return (
        <div>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#92400e" }}>
            <strong>Age-Bias Tip:</strong> Include modern tools and software. Listing current technology skills signals adaptability and counters age bias. Aim for 8–12 skills.
          </div>
          <label style={labelStyle}>Your Skills ({data.skills.length} selected)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
            {SUGGESTED_SKILLS.map(s => (
              <button key={s} onClick={() => {
                const next = data.skills.includes(s) ? data.skills.filter(x => x !== s) : [...data.skills, s];
                updateData({ skills: next });
              }} style={{ padding: "6px 14px", borderRadius: "20px", border: data.skills.includes(s) ? "2px solid #1B3A6B" : "1px solid #d1d5db", background: data.skills.includes(s) ? "#1B3A6B" : "#fff", color: data.skills.includes(s) ? "#fff" : "#333", cursor: "pointer", fontSize: "13px" }}>
                {s}
              </button>
            ))}
          </div>
          <label style={labelStyle}>Add a custom skill</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input id="custom-skill-input" style={{ ...inputStyle, flex: 1 }} placeholder="e.g., Salesforce, Lean Six Sigma..." onKeyDown={e => {
              if (e.key === "Enter") {
                const val = (e.target as HTMLInputElement).value.trim();
                if (val && !data.skills.includes(val)) { updateData({ skills: [...data.skills, val] }); (e.target as HTMLInputElement).value = ""; }
              }
            }} />
            <button onClick={() => {
              const el = document.getElementById("custom-skill-input") as HTMLInputElement;
              const val = el?.value.trim();
              if (val && !data.skills.includes(val)) { updateData({ skills: [...data.skills, val] }); el.value = ""; }
            }} style={{ padding: "10px 16px", background: "#C9922A", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Add</button>
          </div>
          {data.skills.length > 0 && (
            <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {data.skills.map(s => (
                <span key={s} style={{ background: "#1B3A6B", color: "#fff", borderRadius: "16px", padding: "4px 12px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                  {s}
                  <button onClick={() => updateData({ skills: data.skills.filter(x => x !== s) })} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "0", fontSize: "14px", lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      );
      case 5: return (
        <div>
          {/* Template Selector */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontWeight: "bold", color: "#1B3A6B", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <LayoutTemplate size={16} /> Choose Your Template
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {(["classic", "modern", "compact"] as Template[]).map(t => (
                <button key={t} onClick={() => updateTemplate(t)}
                  style={{ flex: 1, padding: "10px 8px", border: template === t ? "2px solid #1B3A6B" : "1px solid #d1d5db", borderRadius: "8px", background: template === t ? "#1B3A6B" : "#fff", color: template === t ? "#fff" : "#333", cursor: "pointer", fontWeight: "600", fontSize: "13px", textTransform: "capitalize" }}>
                  {t === "classic" ? "📄 Classic" : t === "modern" ? "🎨 Modern" : "📋 Compact"}
                </button>
              ))}
            </div>
          </div>

          {/* AI Tabs */}
          <div style={{ display: "flex", borderBottom: "2px solid #e5e7eb", marginBottom: "12px" }}>
            <button onClick={() => setAiTab("form")} style={{ flex: 1, padding: "10px", background: "none", border: "none", cursor: "pointer", fontWeight: aiTab === "form" ? "bold" : "normal", color: aiTab === "form" ? "#1B3A6B" : "#666", borderBottom: aiTab === "form" ? "2px solid #1B3A6B" : "none", marginBottom: "-2px" }}>
              Preview
            </button>
            <button onClick={() => setAiTab("feedback")} style={{ flex: 1, padding: "10px", background: "none", border: "none", cursor: "pointer", fontWeight: aiTab === "feedback" ? "bold" : "normal", color: aiTab === "feedback" ? "#1B3A6B" : "#666", borderBottom: aiTab === "feedback" ? "2px solid #1B3A6B" : "none", marginBottom: "-2px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <Sparkles size={14} /> AI Feedback {aiFeedback && <span style={{ background: "#22c55e", color: "#fff", borderRadius: "10px", padding: "1px 7px", fontSize: "11px" }}>{aiFeedback.overallScore}</span>}
            </button>
          </div>

          {aiTab === "form" ? (
            <div style={{ overflowX: "auto" }}>
              {template === "classic" && <ClassicTemplate data={data} />}
              {template === "modern" && <ModernTemplate data={data} />}
              {template === "compact" && <CompactTemplate data={data} />}
            </div>
          ) : (
            <div>
              <button onClick={handleAnalyze} disabled={analyzeMutation.isPending}
                style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #1B3A6B, #2A5298)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
                {analyzeMutation.isPending ? <><Loader2 size={18} className="animate-spin" /> Analyzing your resume...</> : <><Sparkles size={18} /> Analyze My Resume with AI</>}
              </button>
              {aiFeedback && <AIFeedbackPanel feedback={aiFeedback} />}
              {!aiFeedback && !analyzeMutation.isPending && (
                <div style={{ textAlign: "center", color: "#888", padding: "32px 16px", fontSize: "14px" }}>
                  <Sparkles size={32} style={{ margin: "0 auto 8px", color: "#C9922A" }} />
                  <div>Click "Analyze My Resume" to get personalized AI feedback on your resume — including age-bias flags, ATS keywords, and quick wins.</div>
                </div>
              )}
            </div>
          )}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", paddingBottom: "120px" }}>
      {/* Header */}
      <div style={{ background: "#1B3A6B", color: "#fff", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "15px" }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>Resume Builder</div>
          <div style={{ fontSize: "12px", color: "#C9922A" }}>Step {step + 1} of {STEPS.length}: {STEPS[step]}</div>
        </div>
        <button onClick={handleManualSave} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", borderRadius: "8px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px" }}>
          {saveStatus === "saving" ? <Loader2 size={14} className="animate-spin" /> : saveStatus === "saved" ? <CheckCircle size={14} /> : <Save size={14} />}
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save"}
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{ background: "#e5e7eb", height: "4px" }}>
        <div style={{ background: "#C9922A", height: "100%", width: `${((step + 1) / STEPS.length) * 100}%`, transition: "width 0.3s ease" }} />
      </div>

      {/* Auth Notice */}
      {!isAuthenticated && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", margin: "12px 16px", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#92400e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span><strong>Sign in</strong> to save your resume and return later.</span>
          <button onClick={() => window.location.href = getLoginUrl()} style={{ background: "#C9922A", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Sign In</button>
        </div>
      )}

      {/* Step Content */}
      <div style={{ padding: "16px" }}>
        <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          {renderStep()}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ position: "fixed", bottom: "72px", left: 0, right: 0, background: "#fff", borderTop: "1px solid #e5e7eb", padding: "12px 16px", display: "flex", gap: "10px", zIndex: 50 }}>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            style={{ flex: 1, padding: "12px", border: "2px solid #1B3A6B", background: "#fff", color: "#1B3A6B", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <ArrowLeft size={16} /> Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)}
            style={{ flex: 1, padding: "12px", background: "#1B3A6B", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button onClick={handleDownload}
            style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #C9922A, #e6a830)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Download size={16} /> Download PDF
          </button>
        )}
      </div>

      <PageFooter />
    </div>
  );
}
