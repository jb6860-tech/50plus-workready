/*
 * DESIGN: "Warm Authority" — Navy/gold card list, status badges with color coding
 * Full CRUD: add, edit, delete job applications — all persisted in localStorage
 */
import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import {
  Plus, Trash2, Pencil, X, CheckCircle2, Clock, XCircle,
  Briefcase, Calendar, Building2, ChevronDown, ChevronUp, StickyNote
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
}

const STATUS_CONFIG: Record<Status, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
  Saved:     { bg: "#EFF4FF", text: "#1B3A6B", border: "#C5D5F0", icon: <Briefcase size={12} />, label: "Saved" },
  Applied:   { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD", icon: <Clock size={12} />, label: "Applied" },
  Interview: { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", icon: <Calendar size={12} />, label: "Interview" },
  Offer:     { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0", icon: <CheckCircle2 size={12} />, label: "Offer!" },
  Rejected:  { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA", icon: <XCircle size={12} />, label: "Rejected" },
};

const STATUSES: Status[] = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

const EMPTY_FORM: Omit<Application, "id"> = {
  company: "",
  jobTitle: "",
  dateApplied: new Date().toISOString().split("T")[0],
  status: "Applied",
  notes: "",
};

function loadApps(): Application[] {
  try {
    const saved = localStorage.getItem("job-applications");
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveApps(apps: Application[]) {
  try { localStorage.setItem("job-applications", JSON.stringify(apps)); } catch {}
}

export default function JobTracker() {
  const [apps, setApps] = useState<Application[]>(loadApps);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Application, "id">>(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");

  useEffect(() => { saveApps(apps); }, [apps]);

  const handleChange = (field: keyof Omit<Application, "id">, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.company.trim() || !form.jobTitle.trim()) {
      toast.error("Please enter the company name and job title.");
      return;
    }
    if (editingId) {
      setApps(prev => prev.map(a => a.id === editingId ? { ...form, id: editingId } : a));
      toast.success("Application updated!");
    } else {
      const newApp: Application = { ...form, id: Date.now().toString() };
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
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const filtered = filterStatus === "All" ? apps : apps.filter(a => a.status === filterStatus);

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length;
    return acc;
  }, {} as Record<Status, number>);

  const inputClass = "w-full rounded-lg px-3 py-2.5 text-sm border outline-none transition-all duration-200 focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20";
  const inputStyle = { fontFamily: "'Source Sans 3', sans-serif", borderColor: "#D1D5DB", background: "white" };
  const labelClass = "block text-xs font-semibold text-[#1B3A6B] mb-1.5 uppercase tracking-wide";

  return (
    <div className="section-page">
      <PageHeader
        title="Job Application Tracker"
        subtitle="Stay organized and track every application in one place"
      />

      <div className="px-4 py-5">
        {/* Summary Stats */}
        {apps.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {(["Applied", "Interview", "Offer"] as Status[]).map(s => (
              <div key={s} className="rounded-xl p-3 text-center" style={{ background: STATUS_CONFIG[s].bg, border: `1.5px solid ${STATUS_CONFIG[s].border}` }}>
                <p className="text-xl font-bold" style={{ color: STATUS_CONFIG[s].text, fontFamily: "'Playfair Display', serif" }}>{counts[s]}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: STATUS_CONFIG[s].text, fontFamily: "'Source Sans 3', sans-serif" }}>{s}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mb-5 transition-all duration-200 active:scale-95"
            style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", fontFamily: "'Source Sans 3', sans-serif", boxShadow: "0 4px 14px rgba(27,58,107,0.3)" }}
          >
            <Plus size={18} />
            Add New Application
          </button>
        )}

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
                    <button
                      key={s}
                      onClick={() => handleChange("status", s)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                      style={{
                        background: form.status === s ? STATUS_CONFIG[s].text : STATUS_CONFIG[s].bg,
                        color: form.status === s ? "white" : STATUS_CONFIG[s].text,
                        border: `1.5px solid ${STATUS_CONFIG[s].border}`,
                        fontFamily: "'Source Sans 3', sans-serif",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Notes</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  style={{ ...inputStyle, minHeight: "70px" }}
                  placeholder="e.g., Recruiter name, interview date, follow-up needed..."
                  value={form.notes}
                  onChange={e => handleChange("notes", e.target.value)}
                />
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
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4 scrollbar-hide">
            {(["All", ...STATUSES] as (Status | "All")[]).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0"
                style={{
                  background: filterStatus === s ? "#1B3A6B" : "#F3F4F6",
                  color: filterStatus === s ? "white" : "#6B7280",
                  fontFamily: "'Source Sans 3', sans-serif",
                }}
              >
                {s} {s !== "All" && counts[s as Status] > 0 ? `(${counts[s as Status]})` : s === "All" ? `(${apps.length})` : ""}
              </button>
            ))}
          </div>
        )}

        {/* Application Cards */}
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <Briefcase size={40} className="text-[#D1D5DB] mx-auto mb-3" />
            <p className="font-semibold text-[#9CA3AF] text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {apps.length === 0 ? "No applications yet." : "No applications with this status."}
            </p>
            {apps.length === 0 && (
              <p className="text-xs text-[#9CA3AF] mt-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Tap "Add New Application" to start tracking.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filtered.map(app => {
            const cfg = STATUS_CONFIG[app.status];
            const isExpanded = expandedId === app.id;
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
                        <Building2 size={11} />
                        <span>{app.company}</span>
                        {app.dateApplied && (
                          <>
                            <span className="text-[#D1D5DB]">·</span>
                            <Calendar size={11} />
                            <span>{new Date(app.dateApplied + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => handleEdit(app)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#EFF4FF" }}>
                        <Pencil size={13} className="text-[#1B3A6B]" />
                      </button>
                      <button onClick={() => handleDelete(app.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#FEF2F2" }}>
                        <Trash2 size={13} className="text-[#DC2626]" />
                      </button>
                      <button onClick={() => setExpandedId(isExpanded ? null : app.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                        {isExpanded ? <ChevronUp size={13} className="text-[#6B7280]" /> : <ChevronDown size={13} className="text-[#6B7280]" />}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t" style={{ borderColor: "#F3F4F6" }}>
                    {/* Quick status update */}
                    <p className="text-xs font-semibold text-[#1B3A6B] uppercase tracking-wide mt-3 mb-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Update Status</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {STATUSES.map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(app.id, s)}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                          style={{
                            background: app.status === s ? STATUS_CONFIG[s].text : STATUS_CONFIG[s].bg,
                            color: app.status === s ? "white" : STATUS_CONFIG[s].text,
                            border: `1px solid ${STATUS_CONFIG[s].border}`,
                            fontFamily: "'Source Sans 3', sans-serif",
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {app.notes && (
                      <div className="rounded-lg px-3 py-2.5" style={{ background: "#FDF8F0", border: "1px solid #E8D9C0" }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <StickyNote size={12} className="text-[#C9922A]" />
                          <span className="text-xs font-semibold text-[#C9922A] uppercase tracking-wide" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Notes</span>
                        </div>
                        <p className="text-xs text-[#4A4A4A] leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{app.notes}</p>
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
