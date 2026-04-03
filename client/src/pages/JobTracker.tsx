/*
 * DESIGN: "Warm Authority" — Navy/gold card list, status badges, confetti on Offer,
 * Interview Prep Checklist, Copy Summary export, milestone badges, follow-up reminders
 */
import { useState, useEffect, useRef, useCallback } from "react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import {
  Plus, Trash2, Pencil, X, CheckCircle2, Clock, XCircle,
  Briefcase, Calendar, Building2, ChevronDown, ChevronUp,
  StickyNote, Copy, CheckSquare, Square, PartyPopper, ClipboardList,
  Bell, BellOff, Trophy, Star, Zap
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
  followUpDate?: string;
  followUpNote?: string;
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

// ---- Milestone definitions ----
interface Milestone {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  check: (apps: Application[]) => boolean;
}

const MILESTONES: Milestone[] = [
  {
    id: "first-app",
    label: "First Step Taken",
    description: "You added your first application. The journey begins!",
    icon: <Zap size={16} />,
    color: "#C9922A",
    check: apps => apps.length >= 1,
  },
  {
    id: "five-apps",
    label: "5 Applications Strong",
    description: "You've applied to 5 positions. Momentum is building!",
    icon: <Star size={16} />,
    color: "#2A5298",
    check: apps => apps.length >= 5,
  },
  {
    id: "ten-apps",
    label: "Double Digits",
    description: "10 applications in! Your persistence is your superpower.",
    icon: <Trophy size={16} />,
    color: "#C9922A",
    check: apps => apps.length >= 10,
  },
  {
    id: "first-interview",
    label: "First Interview!",
    description: "You landed an interview. Your resume is working!",
    icon: <CheckCircle2 size={16} />,
    color: "#166534",
    check: apps => apps.some(a => a.status === "Interview"),
  },
  {
    id: "first-offer",
    label: "Offer Received!",
    description: "You received a job offer. Your experience paid off!",
    icon: <PartyPopper size={16} />,
    color: "#166534",
    check: apps => apps.some(a => a.status === "Offer"),
  },
  {
    id: "prep-master",
    label: "Prep Master",
    description: "You completed the full interview prep checklist for an application!",
    icon: <CheckSquare size={16} />,
    color: "#1B3A6B",
    check: apps => apps.some(a => PREP_ITEMS.every(item => a.prepChecklist[item])),
  },
  {
    id: "resilient",
    label: "Resilient & Rising",
    description: "You kept going after a rejection. That's true strength.",
    icon: <Star size={16} />,
    color: "#C9922A",
    check: apps => apps.some(a => a.status === "Rejected") && apps.some(a => a.status === "Applied" || a.status === "Interview"),
  },
];

const EMPTY_FORM: Omit<Application, "id" | "prepChecklist"> = {
  company: "",
  jobTitle: "",
  dateApplied: new Date().toISOString().split("T")[0],
  status: "Applied",
  notes: "",
  followUpDate: "",
  followUpNote: "",
};

function loadApps(): Application[] {
  try {
    const saved = localStorage.getItem("job-applications-v2");
    if (saved) return JSON.parse(saved);
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

function loadSeenMilestones(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem("seen-milestones") || "[]")); } catch { return new Set(); }
}

function saveSeenMilestones(set: Set<string>) {
  try { localStorage.setItem("seen-milestones", JSON.stringify(Array.from(set))); } catch {}
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
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      shape: Math.random() > 0.5 ? "rect" : "circle" as "rect" | "circle",
    }));
    let frame = 0;
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.fillStyle = p.color;
        if (p.shape === "rect") { ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); }
        else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
        p.x += p.vx; p.y += p.vy; p.angle += p.spin; p.vy += 0.05;
      });
      frame++;
      if (frame < 160) { raf = requestAnimationFrame(draw); } else { ctx.clearRect(0, 0, canvas.width, canvas.height); onDone(); }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ width: "100vw", height: "100vh" }} />;
}

// ---- Celebration Modal ----
function CelebrationModal({ company, jobTitle, onClose }: { company: string; jobTitle: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="rounded-2xl px-6 py-7 text-center max-w-xs w-full relative fade-up" style={{ background: "white", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #C9922A 0%, #E8B84B 100%)" }}>
          <PartyPopper size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#1B3A6B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Congratulations!</h2>
        <p className="text-sm text-[#4A4A4A] leading-relaxed mb-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>You received an offer for</p>
        <p className="text-base font-bold text-[#C9922A] mb-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{jobTitle}</p>
        <p className="text-sm text-[#6B7280] mb-5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>at {company}</p>
        <p className="text-xs text-[#9CA3AF] italic mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>"Your experience is your edge — and today it paid off."</p>
        <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-white text-sm" style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", fontFamily: "'Source Sans 3', sans-serif" }}>
          Thank You! 🎉
        </button>
      </div>
    </div>
  );
}

// ---- Milestone Toast ----
function MilestoneBanner({ milestone, onClose }: { milestone: Milestone; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 fade-up">
      <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", boxShadow: "0 8px 24px rgba(27,58,107,0.35)" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: milestone.color }}>
          <span className="text-white">{milestone.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#E8B84B] uppercase tracking-wide" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Achievement Unlocked!</p>
          <p className="text-sm font-bold text-white" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{milestone.label}</p>
          <p className="text-xs text-blue-200 leading-tight" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{milestone.description}</p>
        </div>
        <button onClick={onClose}><X size={16} className="text-white/60" /></button>
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
  const [expandedTab, setExpandedTab] = useState<Record<string, "details" | "prep" | "reminder">>({});
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [celebration, setCelebration] = useState<{ company: string; jobTitle: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [seenMilestones, setSeenMilestones] = useState<Set<string>>(loadSeenMilestones);
  const [showMilestones, setShowMilestones] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");

  useEffect(() => { saveApps(apps); }, [apps]);

  // Check notification permission on mount
  useEffect(() => {
    if ("Notification" in window) setNotifPermission(Notification.permission);
  }, []);

  // Check for new milestones whenever apps change
  useEffect(() => {
    for (const milestone of MILESTONES) {
      if (!seenMilestones.has(milestone.id) && milestone.check(apps)) {
        const updated = new Set(seenMilestones).add(milestone.id);
        setSeenMilestones(updated);
        saveSeenMilestones(updated);
        setActiveMilestone(milestone);
        break;
      }
    }
  }, [apps]);

  // Check for due follow-up reminders on mount
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    apps.forEach(app => {
      if (app.followUpDate && app.followUpDate <= today) {
        toast.info(`Follow-up reminder: ${app.jobTitle} at ${app.company}`, {
          description: app.followUpNote || "Time to follow up on this application!",
          duration: 8000,
        });
      }
    });
  }, []);

  const requestNotifPermission = async () => {
    if (!("Notification" in window)) { toast.error("Your browser doesn't support notifications."); return; }
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    if (result === "granted") toast.success("Reminders enabled! You'll be notified on follow-up dates.");
    else toast.error("Notification permission denied. Reminders will show as in-app alerts instead.");
  };

  const scheduleReminder = (app: Application) => {
    if (!app.followUpDate) return;
    const followDate = new Date(app.followUpDate + "T09:00:00");
    const now = new Date();
    if (followDate <= now) {
      toast.info(`This follow-up date has already passed. Update it to a future date.`);
      return;
    }
    if (notifPermission === "granted") {
      const delay = followDate.getTime() - now.getTime();
      setTimeout(() => {
        new Notification("50+ WorkReady: Follow-Up Reminder", {
          body: `Time to follow up on ${app.jobTitle} at ${app.company}. ${app.followUpNote || ""}`,
          icon: "/icons/icon-192.png",
        });
      }, delay);
      toast.success(`Reminder set for ${new Date(app.followUpDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}!`);
    } else {
      toast.success(`Follow-up date saved for ${new Date(app.followUpDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}. Open the app on that day for your reminder.`);
    }
  };

  const handleChange = (field: keyof Omit<Application, "id" | "prepChecklist">, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.company.trim() || !form.jobTitle.trim()) { toast.error("Please enter the company name and job title."); return; }
    if (editingId) {
      setApps(prev => prev.map(a => a.id === editingId ? { ...a, ...form } : a));
      toast.success("Application updated!");
    } else {
      const newApp: Application = { ...form, id: Date.now().toString(), prepChecklist: {} };
      setApps(prev => [newApp, ...prev]);
      toast.success("Application added!");
    }
    setForm(EMPTY_FORM); setShowForm(false); setEditingId(null);
  };

  const handleEdit = (app: Application) => {
    setForm({ company: app.company, jobTitle: app.jobTitle, dateApplied: app.dateApplied, status: app.status, notes: app.notes, followUpDate: app.followUpDate || "", followUpNote: app.followUpNote || "" });
    setEditingId(app.id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => { setApps(prev => prev.filter(a => a.id !== id)); toast.success("Application removed."); };

  const handleCancel = () => { setForm(EMPTY_FORM); setShowForm(false); setEditingId(null); };

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
      return { ...a, prepChecklist: { ...a.prepChecklist, [item]: !a.prepChecklist[item] } };
    }));
  };

  const saveFollowUp = (appId: string, date: string, note: string) => {
    setApps(prev => prev.map(a => a.id === appId ? { ...a, followUpDate: date, followUpNote: note } : a));
    const app = apps.find(a => a.id === appId);
    if (app) scheduleReminder({ ...app, followUpDate: date, followUpNote: note });
  };

  const handleCopySummary = useCallback(async () => {
    if (apps.length === 0) { toast.error("No applications to copy yet."); return; }
    const lines: string[] = ["📋 MY JOB APPLICATION SUMMARY", `Generated: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`, `Total Applications: ${apps.length}`, ""];
    STATUSES.forEach(s => {
      const group = apps.filter(a => a.status === s);
      if (group.length === 0) return;
      lines.push(`── ${s.toUpperCase()} (${group.length}) ──`);
      group.forEach(a => {
        lines.push(`• ${a.jobTitle} @ ${a.company}`);
        if (a.dateApplied) lines.push(`  Applied: ${new Date(a.dateApplied + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`);
        if (a.followUpDate) lines.push(`  Follow-up: ${new Date(a.followUpDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`);
        if (a.notes) lines.push(`  Notes: ${a.notes}`);
      });
      lines.push("");
    });
    lines.push("Built for the experienced. Designed for the future."); lines.push("— 50+ WorkReady App");
    const text = lines.join("\n");
    try {
      if (navigator.share) { await navigator.share({ title: "My Job Applications", text }); }
      else { await navigator.clipboard.writeText(text); toast.success("Summary copied to clipboard! Paste it anywhere."); }
    } catch { toast.error("Could not copy. Please try again."); }
  }, [apps]);

  const filtered = filterStatus === "All" ? apps : apps.filter(a => a.status === filterStatus);
  const counts = STATUSES.reduce((acc, s) => { acc[s] = apps.filter(a => a.status === s).length; return acc; }, {} as Record<Status, number>);
  const earnedMilestones = MILESTONES.filter(m => m.check(apps));

  const inputClass = "w-full rounded-lg px-3 py-2.5 text-sm border outline-none transition-all duration-200 focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20";
  const inputStyle = { fontFamily: "'Source Sans 3', sans-serif", borderColor: "#D1D5DB", background: "white" };
  const labelClass = "block text-xs font-semibold text-[#1B3A6B] mb-1.5 uppercase tracking-wide";

  return (
    <div className="section-page">
      {showConfetti && <ConfettiCanvas onDone={() => setShowConfetti(false)} />}
      {celebration && <CelebrationModal company={celebration.company} jobTitle={celebration.jobTitle} onClose={() => setCelebration(null)} />}
      {activeMilestone && <MilestoneBanner milestone={activeMilestone} onClose={() => setActiveMilestone(null)} />}

      <PageHeader title="Job Application Tracker" subtitle="Stay organized and track every application in one place" />

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

        {/* Milestone Badges Row */}
        {earnedMilestones.length > 0 && (
          <div className="mb-4">
            <button onClick={() => setShowMilestones(!showMilestones)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #FDF8F0 0%, #FFF9EC 100%)", border: "1.5px solid #E8D9C0" }}>
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-[#C9922A]" />
                <span className="text-sm font-bold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  Achievements ({earnedMilestones.length}/{MILESTONES.length})
                </span>
              </div>
              {showMilestones ? <ChevronUp size={14} className="text-[#C9922A]" /> : <ChevronDown size={14} className="text-[#C9922A]" />}
            </button>
            {showMilestones && (
              <div className="mt-2 flex flex-col gap-2 fade-up">
                {MILESTONES.map(m => {
                  const earned = m.check(apps);
                  return (
                    <div key={m.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: earned ? "white" : "#F9FAFB", border: `1.5px solid ${earned ? "#E8D9C0" : "#E5E7EB"}`, opacity: earned ? 1 : 0.5 }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: earned ? m.color : "#E5E7EB" }}>
                        <span style={{ color: earned ? "white" : "#9CA3AF" }}>{m.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{m.label}</p>
                        <p className="text-xs text-[#6B7280] leading-tight" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{m.description}</p>
                      </div>
                      {earned && <CheckCircle2 size={16} className="text-[#C9922A] flex-shrink-0 ml-auto" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex gap-2 mb-5">
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
              style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", fontFamily: "'Source Sans 3', sans-serif", boxShadow: "0 4px 14px rgba(27,58,107,0.3)" }}>
              <Plus size={18} /> Add Application
            </button>
          )}
          {apps.length > 0 && !showForm && (
            <button onClick={handleCopySummary}
              className="py-3 px-4 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-200"
              style={{ background: "#EFF4FF", color: "#1B3A6B", border: "1.5px solid #C5D5F0", fontFamily: "'Source Sans 3', sans-serif" }}>
              <Copy size={15} /> Copy
            </button>
          )}
          {notifPermission !== "granted" && apps.length > 0 && !showForm && (
            <button onClick={requestNotifPermission}
              className="py-3 px-3 rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-all duration-200"
              style={{ background: "#FFFBEB", color: "#92400E", border: "1.5px solid #FDE68A", fontFamily: "'Source Sans 3', sans-serif" }}>
              <Bell size={15} />
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-xl p-4 mb-5 fade-up" style={{ background: "white", border: "1.5px solid #C9922A", boxShadow: "0 4px 16px rgba(201,146,42,0.12)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1B3A6B] text-base" style={{ fontFamily: "'Playfair Display', serif" }}>{editingId ? "Edit Application" : "New Application"}</h3>
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
                <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Follow-Up Reminder Date</label>
                <input type="date" className={inputClass} style={inputStyle} value={form.followUpDate || ""} onChange={e => handleChange("followUpDate", e.target.value)} />
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Follow-Up Note (optional)</label>
                <input className={inputClass} style={inputStyle} placeholder="e.g., Email recruiter, check job portal..." value={form.followUpNote || ""} onChange={e => handleChange("followUpNote", e.target.value)} />
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
            const today = new Date().toISOString().split("T")[0];
            const followUpDue = app.followUpDate && app.followUpDate <= today;

            return (
              <div key={app.id} className="rounded-xl overflow-hidden" style={{ background: "white", border: `1.5px solid ${followUpDue ? "#FDE68A" : "#E5E7EB"}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-[#1B3A6B] text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{app.jobTitle}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1" style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, fontFamily: "'Source Sans 3', sans-serif" }}>
                          {cfg.icon}{cfg.label}
                        </span>
                        {followUpDue && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1" style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A", fontFamily: "'Source Sans 3', sans-serif" }}>
                            <Bell size={10} /> Follow Up
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7280] flex-wrap" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                        <Building2 size={11} /><span>{app.company}</span>
                        {app.dateApplied && (<><span className="text-[#D1D5DB]">·</span><Calendar size={11} /><span>{new Date(app.dateApplied + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></>)}
                        {prepDone > 0 && (<><span className="text-[#D1D5DB]">·</span><CheckSquare size={11} className="text-[#C9922A]" /><span className="text-[#C9922A] font-semibold">{prepDone}/{PREP_ITEMS.length}</span></>)}
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
                    <div className="flex border-b overflow-x-auto" style={{ borderColor: "#F3F4F6" }}>
                      {(["details", "prep", "reminder"] as const).map(tab => (
                        <button key={tab} onClick={() => setExpandedTab(prev => ({ ...prev, [app.id]: tab }))}
                          className="flex-1 py-2.5 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1 whitespace-nowrap px-2"
                          style={{ background: currentTab === tab ? "#EFF4FF" : "white", color: currentTab === tab ? "#1B3A6B" : "#9CA3AF", borderBottom: currentTab === tab ? "2px solid #1B3A6B" : "2px solid transparent", fontFamily: "'Source Sans 3', sans-serif" }}>
                          {tab === "details" && <><StickyNote size={11} /> Details</>}
                          {tab === "prep" && <><CheckSquare size={11} /> Prep {prepDone > 0 && `(${prepDone}/${PREP_ITEMS.length})`}</>}
                          {tab === "reminder" && <><Bell size={11} /> {app.followUpDate ? "Reminder ✓" : "Reminder"}</>}
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
                            {prepDone}/{PREP_ITEMS.length}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full mb-3" style={{ background: "#E5E7EB" }}>
                          <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${(prepDone / PREP_ITEMS.length) * 100}%`, background: prepDone === PREP_ITEMS.length ? "#16A34A" : "#C9922A" }} />
                        </div>
                        <div className="flex flex-col gap-2">
                          {PREP_ITEMS.map(item => {
                            const checked = !!app.prepChecklist[item];
                            return (
                              <button key={item} onClick={() => togglePrepItem(app.id, item)} className="flex items-start gap-2.5 text-left transition-all duration-200 py-1">
                                <div className="flex-shrink-0 mt-0.5">
                                  {checked ? <CheckSquare size={16} className="text-[#C9922A]" /> : <Square size={16} className="text-[#D1D5DB]" />}
                                </div>
                                <span className="text-sm leading-relaxed" style={{ color: checked ? "#9CA3AF" : "#2D2D2D", textDecoration: checked ? "line-through" : "none", fontFamily: "'Source Sans 3', sans-serif" }}>{item}</span>
                              </button>
                            );
                          })}
                        </div>
                        {prepDone === PREP_ITEMS.length && (
                          <div className="mt-3 rounded-lg px-3 py-2.5 text-center" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                            <p className="text-xs font-bold text-[#166534]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>✓ You're fully prepared for this interview!</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reminder Tab */}
                    {currentTab === "reminder" && (
                      <ReminderTab app={app} onSave={saveFollowUp} notifPermission={notifPermission} onRequestPermission={requestNotifPermission} />
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

// ---- Reminder Tab Component ----
function ReminderTab({ app, onSave, notifPermission, onRequestPermission }: {
  app: Application;
  onSave: (id: string, date: string, note: string) => void;
  notifPermission: NotificationPermission;
  onRequestPermission: () => void;
}) {
  const [date, setDate] = useState(app.followUpDate || "");
  const [note, setNote] = useState(app.followUpNote || "");
  const inputClass = "w-full rounded-lg px-3 py-2.5 text-sm border outline-none transition-all duration-200 focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20";
  const inputStyle = { fontFamily: "'Source Sans 3', sans-serif", borderColor: "#D1D5DB", background: "white" };
  const labelClass = "block text-xs font-semibold text-[#1B3A6B] mb-1.5 uppercase tracking-wide";

  return (
    <div className="px-4 py-3">
      <p className="text-xs font-semibold text-[#1B3A6B] uppercase tracking-wide mb-3" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Schedule Follow-Up Reminder</p>

      {notifPermission !== "granted" && (
        <div className="rounded-lg px-3 py-2.5 mb-3 flex items-start gap-2" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <Bell size={14} className="text-[#92400E] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-[#92400E] leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Enable notifications to receive a reminder on your follow-up date.
            </p>
            <button onClick={onRequestPermission} className="text-xs font-bold text-[#92400E] underline mt-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Enable Notifications
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div>
          <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Follow-Up Date</label>
          <input type="date" className={inputClass} style={inputStyle} value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Reminder Note (optional)</label>
          <input className={inputClass} style={inputStyle} placeholder="e.g., Email recruiter, check application portal..." value={note} onChange={e => setNote(e.target.value)} />
        </div>
        <button
          onClick={() => { if (!date) { toast.error("Please select a follow-up date."); return; } onSave(app.id, date, note); }}
          className="w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", fontFamily: "'Source Sans 3', sans-serif" }}>
          <Bell size={15} /> Set Reminder
        </button>
        {app.followUpDate && (
          <div className="rounded-lg px-3 py-2.5 flex items-start gap-2" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            <CheckCircle2 size={14} className="text-[#166534] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#166534] leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              Reminder set for {new Date(app.followUpDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.
              {app.followUpNote && ` Note: ${app.followUpNote}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
