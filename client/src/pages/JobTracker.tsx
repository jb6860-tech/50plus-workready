/*
 * DESIGN: "Warm Authority" — Navy/gold card list, status badges, confetti on Offer,
 * Interview Prep Checklist per application, Copy Summary export
 */
import { useState, useEffect, useRef, useCallback } from "react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import {
  Plus, Trash2, Pencil, X, CheckCircle2, Clock, XCircle,
  Briefcase, Calendar, Building2, ChevronDown, ChevronUp,
  StickyNote, Copy, CheckSquare, Square, PartyPopper, ClipboardList
} from "lucide-react";
import { toast } from "sonner";

type Status = "Applied" | "Interview" | "Offer" | "Rejected" | "Saved";

interface Application {
  id: string;
  company: string;
  jobTitle: string;
  dateApplied: string;
  status: Status;
  notes: string;
  prepChecklist: Record<string, boolean>;
}

const PREP_ITEMS = [
  "Research the company (mission, values, recent news)",
  "Review the job description carefully",
  "Prepare answers to common interview questions",
  "Prepare 3 thoughtful questions to ask the interviewer",
  "Update and print your resume",
  "Plan your outfit and travel route",
  "Practice your introduction ('Tell me about yourself')",
  "Send a thank-you email after the interview",
];

const STATUS_CONFIG: Record<Status, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
  Saved:     { bg: "#EFF4FF", text: "#1B3A6B", border: "#C5D5F0", icon: <Briefcase size={12} />, label: "Saved" },
  Applied:   { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD", icon: <Clock size={12} />, label: "Applied" },
  Interview: { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", icon: <Calendar size={12} />, label: "Interview" },
  Offer:     { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0", icon: <CheckCircle2 size={12} />, label: "Offer!" },
  Rejected:  { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA", icon: <XCircle size={12} />, label: "Rejected" },
};

const STATUSES: Status[] = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

const EMPTY_FORM: Omit<Application, "id" | "prepChecklist"> = {
  company: "",
  jobTitle: "",
  dateApplied: new Date().toISOString().split("T")[0],
  status: "Applied",
  notes: "",
};

function loadApps(): Application[] {
  try {
    const saved = localStorage.getItem("job-applications-v2");
    if (saved) return JSON.parse(saved);
    // Migrate from old key
    const old = localStorage.getItem("job-applications");
    if (old) {
      const apps = JSON.parse(old).map((a: Application) => ({ ...a, prepChecklist: a.prepChecklist || {} }));
      localStorage.setItem("job-applications-v2", JSON.stringify(apps));
      return apps;
    }
    return [];
  } catch { return []; }
}

function saveApps(apps: Application[]) {
  try { localStorage.setItem("job-applications-v2", JSON.stringify(apps)); } catch {}
}

// ---- Confetti Canvas ----
function ConfettiCanvas({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#C9922A", "#E8B84B", "#1B3A6B", "#2A5298", "#FFFFFF", "#F0FDF4", "#BBF7D0"];
    const pieces: { x: number; y: number; vx: number; vy: number; color: string; size: number; angle: number; spin: number; shape: "rect" | "circle" }[] = [];

    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      });
    }

    let frame = 0;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.vy += 0.05;
      });
      frame++;
      if (frame < 160) {
        raf = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onDone();
      }
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

// ---- Celebration Modal ----
function CelebrationModal({ company, jobTitle, onClose }: { company: string; jobTitle: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div
        className="rounded-2xl px-6 py-7 text-center max-w-xs w-full relative fade-up"
        style={{ background: "white", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #C9922A 0%, #E8B84B 100%)" }}
        >
          <PartyPopper size={28} className="text-white" />
        </div>
        <h2
          className="text-2xl font-bold text-[#1B3A6B] mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Congratulations!
        </h2>
        <p
          className="text-sm text-[#4A4A4A] leading-relaxed mb-1"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          You received an offer for
        </p>
        <p
          className="text-base font-bold text-[#C9922A] mb-1"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {jobTitle}
        </p>
        <p
          className="text-sm text-[#6B7280] mb-5"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          at {company}
        </p>
        <p
          className="text-xs text-[#9CA3AF] italic mb-5"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          "Your experience is your edge — and today it paid off."
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-white text-sm"
          style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", fontFamily: "'Source Sans 3', sans-serif" }}
        >
          Thank You! 🎉
        </button>
      </div>
    </div>
  );
}

export default function JobTracker() {
  const [apps, setApps] = useState<Application[]>(loadApps);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Application, "id" | "prepChecklist">>(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedTab, setExpandedTab] = useState<Record<string, "details" | "prep">>({}); 
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [celebration, setCelebration] = useState<{ company: string; jobTitle: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => { saveApps(apps); }, [apps]);

  const handleChange = (field: keyof Omit<Application, "id" | "prepChecklist">, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.company.trim() || !form.jobTitle.trim()) {
      toast.error("Please enter the company name and job title.");
      return;
    }
    if (editingId) {
      setApps(prev => prev.map(a => a.id === editingId ? { ...a, ...form } : a));
      toast.success("Application updated!");
    } else {
      const newApp: Application = { ...form, id: Date.now().toString(), prepChecklist: {} };
      setApps(prev => [newApp, ...prev]);
      toast.success("Application added!");
    }
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (app: Application) => {
    setForm({ company: app.company, jobTitle: app.jobTitle, dateApplied: app.dateApplied, status: app.status, notes: app.notes });
    setEditingId(app.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    setApps(prev => prev.filter(a => a.id !== id));
    toast.success("Application removed.");
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditingId(null);
  };

  const updateStatus = (id: string, status: Status) => {
    const app = apps.find(a => a.id === id);
    if (app && app.status !== "Offer" && status === "Offer") {
      setCelebration({ company: app.company, jobTitle: app.jobTitle });
      setShowConfetti(true);
    }
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const togglePrepItem = (appId: string, item: string) => {
    setApps(prev => prev.map(a => {
      if (a.id !== appId) return a;
      const updated = { ...a.prepChecklist, [item]: !a.prepChecklist[item] };
      return { ...a, prepChecklist: updated };
    }));
  };

  const handleCopySummary = useCallback(async () => {
    if (apps.length === 0) {
      toast.error("No applications to copy yet.");
      return;
    }
    const lines: string[] = [
      "📋 MY JOB APPLICATION SUMMARY",
      `Generated: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
      `Total Applications: ${apps.length}`,
      "",
    ];

    STATUSES.forEach(s => {
      const group = apps.filter(a => a.status === s);
      if (group.length === 0) return;
      lines.push(`── ${s.toUpperCase()} (${group.length}) ──`);
      group.forEach(a => {
        lines.push(`• ${a.jobTitle} @ ${a.company}`);
        if (a.dateApplied) lines.push(`  Applied: ${new Date(a.dateApplied + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`);
        if (a.notes) lines.push(`  Notes: ${a.notes}`);
      });
      lines.push("");
    });

    lines.push("Built for the experienced. Designed for the future.");
    lines.push("— 50+ WorkReady App");

    const text = lines.join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Job Applications", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Summary copied to clipboard! Paste it anywhere.");
      }
    } catch {
      toast.error("Could not copy. Please try again.");
    }
  }, [apps]);

  const filtered = filterStatus === "All" ? apps : apps.filter(a => a.status === filterStatus);
  const counts = STATUSES.reduce((acc, s) => { acc[s] = apps.filter(a => a.status === s).length; return acc; }, {} as Record<Status, number>);

  const inputClass = "w-full rounded-lg px-3 py-2.5 text-sm border outline-none transition-all duration-200 focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20";
  const inputStyle = { fontFamily: "'Source Sans 3', sans-serif", borderColor: "#D1D5DB", background: "white" };
  const labelClass = "block text-xs font-semibold text-[#1B3A6B] mb-1.5 uppercase tracking-wide";

  return (
    <div className="section-page">
      {/* Confetti */}
      {showConfetti && <ConfettiCanvas onDone={() => setShowConfetti(false)} />}

      {/* Celebration Modal */}
      {celebration && (
        <CelebrationModal
          company={celebration.company}
          jobTitle={celebration.jobTitle}
          onClose={() => setCelebration(null)}
        />
      )}

      <PageHeader
        title="Job Application Tracker"
        subtitle="Stay organized and track every application in one place"
      />

      <div className="px-4 py-5">
        {/* Summary Stats */}
        {apps.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(["Applied", "Interview", "Offer"] as Status[]).map(s => (
              <div key={s} className="rounded-xl p-3 text-center" style={{ background: STATUS_CONFIG[s].bg, border: `1.5px solid ${STATUS_CONFIG[s].border}` }}>
                <p className="text-xl font-bold" style={{ color: STATUS_CONFIG[s].text, fontFamily: "'Playfair Display', serif" }}>{counts[s]}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: STATUS_CONFIG[s].text, fontFamily: "'Source Sans 3', sans-serif" }}>{s}</p>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex gap-2 mb-5">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
              style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", fontFamily: "'Source Sans 3', sans-serif", boxShadow: "0 4px 14px rgba(27,58,107,0.3)" }}
            >
              <Plus size={18} /> Add Application
            </button>
          )}
          {apps.length > 0 && !showForm && (
            <button
              onClick={handleCopySummary}
              className="py-3 px-4 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-200"
              style={{ background: "#EFF4FF", color: "#1B3A6B", border: "1.5px solid #C5D5F0", fontFamily: "'Source Sans 3', sans-serif" }}
            >
              <Copy size={15} /> Copy Summary
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-xl p-4 mb-5 fade-up" style={{ background: "white", border: "1.5px solid #C9922A", boxShadow: "0 4px 16px rgba(201,146,42,0.12)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1B3A6B] text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                {editingId ? "Edit Application" : "New Application"}
              </h3>
              <button onClick={handleCancel}><X size={18} className="text-[#9CA3AF]" /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Company Name *</label>
                <input className={inputClass} style={inputStyle} placeholder="e.g., Acme Corporation" value={form.company} onChange={e => handleChange("company", e.target.value)} />
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Job Title *</label>
                <input className={inputClass} style={inputStyle} placeholder="e.g., Administrative Assistant" value={form.jobTitle} onChange={e => handleChange("jobTitle", e.target.value)} />
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Date Applied</label>
                <input type="date" className={inputClass} style={inputStyle} value={form.dateApplied} onChange={e => handleChange("dateApplied", e.target.value)} />
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => handleChange("status", s)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                      style={{ background: form.status === s ? STATUS_CONFIG[s].text : STATUS_CONFIG[s].bg, color: form.status === s ? "white" : STATUS_CONFIG[s].text, border: `1.5px solid ${STATUS_CONFIG[s].border}`, fontFamily: "'Source Sans 3', sans-serif" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Notes</label>
                <textarea className={`${inputClass} resize-none`} style={{ ...inputStyle, minHeight: "70px" }} placeholder="e.g., Recruiter name, interview date, follow-up needed..." value={form.notes} onChange={e => handleChange("notes", e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleCancel} className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-[#6B7280]" style={{ background: "#F3F4F6", fontFamily: "'Source Sans 3', sans-serif" }}>Cancel</button>
              <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white" style={{ background: "#C9922A", fontFamily: "'Source Sans 3', sans-serif", boxShadow: "0 4px 12px rgba(201,146,42,0.3)" }}>
                {editingId ? "Save Changes" : "Add Application"}
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {apps.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4">
            {(["All", ...STATUSES] as (Status | "All")[]).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0"
                style={{ background: filterStatus === s ? "#1B3A6B" : "#F3F4F6", color: filterStatus === s ? "white" : "#6B7280", fontFamily: "'Source Sans 3', sans-serif" }}>
                {s}{s === "All" ? ` (${apps.length})` : counts[s as Status] > 0 ? ` (${counts[s as Status]})` : ""}
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <ClipboardList size={40} className="text-[#D1D5DB] mx-auto mb-3" />
            <p className="font-semibold text-[#9CA3AF] text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {apps.length === 0 ? "No applications yet." : "No applications with this status."}
            </p>
            {apps.length === 0 && <p className="text-xs text-[#9CA3AF] mt-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Tap "Add Application" to start tracking.</p>}
          </div>
        )}

        {/* Application Cards */}
        <div className="flex flex-col gap-3">
          {filtered.map(app => {
            const cfg = STATUS_CONFIG[app.status];
            const isExpanded = expandedId === app.id;
            const currentTab = expandedTab[app.id] || "details";
            const prepDone = PREP_ITEMS.filter(item => app.prepChecklist[item]).length;

            return (
              <div key={app.id} className="rounded-xl overflow-hidden" style={{ background: "white", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-[#1B3A6B] text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{app.jobTitle}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1" style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, fontFamily: "'Source Sans 3', sans-serif" }}>
                          {cfg.icon}{cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7280]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                        <Building2 size={11} /><span>{app.company}</span>
                        {app.dateApplied && (<><span className="text-[#D1D5DB]">·</span><Calendar size={11} /><span>{new Date(app.dateApplied + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></>)}
                        {prepDone > 0 && (<><span className="text-[#D1D5DB]">·</span><CheckSquare size={11} className="text-[#C9922A]" /><span className="text-[#C9922A] font-semibold">{prepDone}/{PREP_ITEMS.length} prep</span></>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => handleEdit(app)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#EFF4FF" }}><Pencil size={13} className="text-[#1B3A6B]" /></button>
                      <button onClick={() => handleDelete(app.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#FEF2F2" }}><Trash2 size={13} className="text-[#DC2626]" /></button>
                      <button onClick={() => setExpandedId(isExpanded ? null : app.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                        {isExpanded ? <ChevronUp size={13} className="text-[#6B7280]" /> : <ChevronDown size={13} className="text-[#6B7280]" />}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t" style={{ borderColor: "#F3F4F6" }}>
                    {/* Inner Tabs */}
                    <div className="flex border-b" style={{ borderColor: "#F3F4F6" }}>
                      {(["details", "prep"] as const).map(tab => (
                        <button key={tab} onClick={() => setExpandedTab(prev => ({ ...prev, [app.id]: tab }))}
                          className="flex-1 py-2.5 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
                          style={{ background: currentTab === tab ? "#EFF4FF" : "white", color: currentTab === tab ? "#1B3A6B" : "#9CA3AF", borderBottom: currentTab === tab ? "2px solid #1B3A6B" : "2px solid transparent", fontFamily: "'Source Sans 3', sans-serif" }}>
                          {tab === "details" ? <><StickyNote size={12} /> Details</> : <><CheckSquare size={12} /> Interview Prep {prepDone > 0 && `(${prepDone}/${PREP_ITEMS.length})`}</>}
                        </button>
                      ))}
                    </div>

                    {/* Details Tab */}
                    {currentTab === "details" && (
                      <div className="px-4 py-3">
                        <p className="text-xs font-semibold text-[#1B3A6B] uppercase tracking-wide mb-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Update Status</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {STATUSES.map(s => (
                            <button key={s} onClick={() => updateStatus(app.id, s)}
                              className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                              style={{ background: app.status === s ? STATUS_CONFIG[s].text : STATUS_CONFIG[s].bg, color: app.status === s ? "white" : STATUS_CONFIG[s].text, border: `1px solid ${STATUS_CONFIG[s].border}`, fontFamily: "'Source Sans 3', sans-serif" }}>
                              {s}
                            </button>
                          ))}
                        </div>
                        {app.notes ? (
                          <div className="rounded-lg px-3 py-2.5" style={{ background: "#FDF8F0", border: "1px solid #E8D9C0" }}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <StickyNote size={12} className="text-[#C9922A]" />
                              <span className="text-xs font-semibold text-[#C9922A] uppercase tracking-wide" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Notes</span>
                            </div>
                            <p className="text-xs text-[#4A4A4A] leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{app.notes}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-[#9CA3AF] italic" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>No notes added. Tap the edit button to add notes.</p>
                        )}
                      </div>
                    )}

                    {/* Interview Prep Tab */}
                    {currentTab === "prep" && (
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold text-[#1B3A6B] uppercase tracking-wide" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Interview Prep Checklist</p>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: prepDone === PREP_ITEMS.length ? "#F0FDF4" : "#EFF4FF", color: prepDone === PREP_ITEMS.length ? "#166534" : "#1B3A6B", fontFamily: "'Source Sans 3', sans-serif" }}>
                            {prepDone}/{PREP_ITEMS.length} done
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-1.5 rounded-full mb-3" style={{ background: "#E5E7EB" }}>
                          <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${(prepDone / PREP_ITEMS.length) * 100}%`, background: prepDone === PREP_ITEMS.length ? "#16A34A" : "#C9922A" }} />
                        </div>
                        <div className="flex flex-col gap-2">
                          {PREP_ITEMS.map(item => {
                            const checked = !!app.prepChecklist[item];
                            return (
                              <button key={item} onClick={() => togglePrepItem(app.id, item)}
                                className="flex items-start gap-2.5 text-left transition-all duration-200 py-1"
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  {checked
                                    ? <CheckSquare size={16} className="text-[#C9922A]" />
                                    : <Square size={16} className="text-[#D1D5DB]" />}
                                </div>
                                <span className="text-sm leading-relaxed" style={{ color: checked ? "#9CA3AF" : "#2D2D2D", textDecoration: checked ? "line-through" : "none", fontFamily: "'Source Sans 3', sans-serif" }}>
                                  {item}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {prepDone === PREP_ITEMS.length && (
                          <div className="mt-3 rounded-lg px-3 py-2.5 text-center" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                            <p className="text-xs font-bold text-[#166534]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                              ✓ You're fully prepared for this interview!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
