/*
 * DESIGN: "Warm Authority" — Multi-step resume builder with live preview and PDF download
 * Steps: 1) Contact Info  2) Professional Summary  3) Work Experience  4) Education  5) Skills & Preview
 */
import { useState, useRef } from "react";
import {
  User, Briefcase, GraduationCap, Star, Eye, Download, Plus, Trash2,
  ChevronLeft, ChevronRight, CheckCircle, Loader2, Phone, Mail, MapPin, Linkedin
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  linkedin: string;
}

interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  graduationYear: string;
  fieldOfStudy: string;
}

interface ResumeData {
  contact: ContactInfo;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
}

const EMPTY_RESUME: ResumeData = {
  contact: { fullName: "", email: "", phone: "", city: "", state: "", linkedin: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
};

const STEPS = [
  { id: 1, label: "Contact", icon: User },
  { id: 2, label: "Summary", icon: Star },
  { id: 3, label: "Experience", icon: Briefcase },
  { id: 4, label: "Education", icon: GraduationCap },
  { id: 5, label: "Preview", icon: Eye },
];

function uid() { return Math.random().toString(36).slice(2, 9); }

// ─── Step Components ──────────────────────────────────────────────────────────

function InputField({ label, value, onChange, placeholder, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1B3A6B] outline-none transition-all duration-200"
        style={{ border: "1.5px solid #E5E7EB", fontFamily: "'Source Sans 3', sans-serif", background: "white" }}
        onFocus={e => (e.target.style.borderColor = "#C9922A")}
        onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 4 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1B3A6B] outline-none resize-none transition-all duration-200"
        style={{ border: "1.5px solid #E5E7EB", fontFamily: "'Source Sans 3', sans-serif", background: "white" }}
        onFocus={e => (e.target.style.borderColor = "#C9922A")}
        onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
      />
    </div>
  );
}

function Step1Contact({ data, onChange }: { data: ContactInfo; onChange: (d: ContactInfo) => void }) {
  const set = (k: keyof ContactInfo) => (v: string) => onChange({ ...data, [k]: v });
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: "#EFF4FF", border: "1px solid #BFDBFE" }}>
        <User size={14} className="text-[#1B3A6B] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          <strong>Age-bias tip:</strong> Do not include your date of birth, graduation year, or a photo. Focus on your name, professional contact details, and LinkedIn URL.
        </p>
      </div>
      <InputField label="Full Name" value={data.fullName} onChange={set("fullName")} placeholder="e.g. Janice Williams" required />
      <InputField label="Email Address" value={data.email} onChange={set("email")} placeholder="e.g. janice@email.com" type="email" required />
      <InputField label="Phone Number" value={data.phone} onChange={set("phone")} placeholder="e.g. (555) 123-4567" type="tel" />
      <div className="grid grid-cols-2 gap-3">
        <InputField label="City" value={data.city} onChange={set("city")} placeholder="e.g. Atlanta" />
        <InputField label="State" value={data.state} onChange={set("state")} placeholder="e.g. GA" />
      </div>
      <InputField label="LinkedIn URL (optional)" value={data.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/yourname" />
    </div>
  );
}

function Step2Summary({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const EXAMPLES = [
    "Experienced administrative professional with 20+ years coordinating operations, managing schedules, and supporting executive teams. Known for exceptional organizational skills, discretion, and the ability to streamline processes that save time and reduce costs.",
    "Versatile virtual assistant and graphic designer with expertise in project coordination, client communications, and digital content creation. Proven ability to manage multiple priorities while delivering high-quality results on deadline.",
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: "#EFF4FF", border: "1px solid #BFDBFE" }}>
        <Star size={14} className="text-[#1B3A6B] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          <strong>Tip:</strong> Write 2–4 sentences. Lead with your strongest skill, mention your years of experience without specifying a number that reveals age, and end with what you bring to an employer.
        </p>
      </div>
      <TextAreaField
        label="Professional Summary"
        value={value}
        onChange={onChange}
        placeholder="Write a 2–4 sentence summary of your professional strengths, skills, and what you bring to an employer..."
        rows={5}
      />
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-[#6B7280]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Example summaries (tap to use):</p>
        {EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => onChange(ex)}
            className="text-left px-3 py-2.5 rounded-lg text-xs text-[#4A4A4A] leading-relaxed transition-all duration-200"
            style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontFamily: "'Source Sans 3', sans-serif" }}>
            "{ex.slice(0, 100)}..."
          </button>
        ))}
      </div>
    </div>
  );
}

function Step3Experience({ items, onChange }: { items: WorkExperience[]; onChange: (items: WorkExperience[]) => void }) {
  const addJob = () => onChange([...items, { id: uid(), jobTitle: "", company: "", startDate: "", endDate: "", current: false, bullets: [""] }]);
  const removeJob = (id: string) => onChange(items.filter(j => j.id !== id));
  const updateJob = (id: string, patch: Partial<WorkExperience>) => onChange(items.map(j => j.id === id ? { ...j, ...patch } : j));
  const addBullet = (id: string) => updateJob(id, { bullets: [...(items.find(j => j.id === id)?.bullets || []), ""] });
  const updateBullet = (id: string, bi: number, val: string) => {
    const job = items.find(j => j.id === id);
    if (!job) return;
    const bullets = [...job.bullets];
    bullets[bi] = val;
    updateJob(id, { bullets });
  };
  const removeBullet = (id: string, bi: number) => {
    const job = items.find(j => j.id === id);
    if (!job) return;
    updateJob(id, { bullets: job.bullets.filter((_, i) => i !== bi) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: "#EFF4FF", border: "1px solid #BFDBFE" }}>
        <Briefcase size={14} className="text-[#1B3A6B] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          <strong>Tip:</strong> Only include the last 10–15 years of experience. Use bullet points starting with action verbs (Managed, Led, Coordinated) and include a measurable result where possible.
        </p>
      </div>
      {items.length === 0 && (
        <div className="text-center py-6">
          <Briefcase size={28} className="text-[#D1D5DB] mx-auto mb-2" />
          <p className="text-sm text-[#9CA3AF]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>No experience added yet</p>
        </div>
      )}
      {items.map((job, idx) => (
        <div key={job.id} className="rounded-xl overflow-hidden" style={{ border: "1.5px solid #E5E7EB", background: "white" }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#F9FAFB" }}>
            <p className="text-xs font-bold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {job.jobTitle || `Position ${idx + 1}`}
            </p>
            <button onClick={() => removeJob(job.id)} className="p-1 rounded-full" style={{ background: "#FEE2E2" }}>
              <Trash2 size={12} className="text-red-500" />
            </button>
          </div>
          <div className="px-4 py-3 flex flex-col gap-3">
            <InputField label="Job Title" value={job.jobTitle} onChange={v => updateJob(job.id, { jobTitle: v })} placeholder="e.g. Administrative Coordinator" />
            <InputField label="Company / Organization" value={job.company} onChange={v => updateJob(job.id, { company: v })} placeholder="e.g. ABC Corporation" />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Start Date" value={job.startDate} onChange={v => updateJob(job.id, { startDate: v })} placeholder="e.g. Jan 2018" />
              <InputField label="End Date" value={job.endDate} onChange={v => updateJob(job.id, { endDate: v })} placeholder={job.current ? "Present" : "e.g. Mar 2024"} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={job.current} onChange={e => updateJob(job.id, { current: e.target.checked, endDate: e.target.checked ? "Present" : "" })} className="w-4 h-4 accent-[#C9922A]" />
              <span className="text-xs text-[#6B7280]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>I currently work here</span>
            </label>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Key Achievements & Responsibilities</p>
              {job.bullets.map((bullet, bi) => (
                <div key={bi} className="flex items-center gap-2">
                  <span className="text-[#C9922A] font-bold text-sm flex-shrink-0">•</span>
                  <input
                    value={bullet}
                    onChange={e => updateBullet(job.id, bi, e.target.value)}
                    placeholder="e.g. Managed scheduling for 5-person executive team, reducing conflicts by 30%"
                    className="flex-1 px-3 py-2 rounded-lg text-xs text-[#1B3A6B] outline-none"
                    style={{ border: "1.5px solid #E5E7EB", fontFamily: "'Source Sans 3', sans-serif", background: "white" }}
                    onFocus={e => (e.target.style.borderColor = "#C9922A")}
                    onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                  />
                  {job.bullets.length > 1 && (
                    <button onClick={() => removeBullet(job.id, bi)} className="flex-shrink-0">
                      <Trash2 size={12} className="text-[#D1D5DB]" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => addBullet(job.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#C9922A] mt-1"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                <Plus size={12} />Add bullet point
              </button>
            </div>
          </div>
        </div>
      ))}
      <button onClick={addJob}
        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200"
        style={{ border: "2px dashed #C9922A", color: "#C9922A", background: "#FDF8F0", fontFamily: "'Source Sans 3', sans-serif" }}>
        <Plus size={16} />Add Work Experience
      </button>
    </div>
  );
}

function Step4Education({ items, onChange }: { items: Education[]; onChange: (items: Education[]) => void }) {
  const addEdu = () => onChange([...items, { id: uid(), degree: "", institution: "", graduationYear: "", fieldOfStudy: "" }]);
  const removeEdu = (id: string) => onChange(items.filter(e => e.id !== id));
  const updateEdu = (id: string, patch: Partial<Education>) => onChange(items.map(e => e.id === id ? { ...e, ...patch } : e));

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: "#EFF4FF", border: "1px solid #BFDBFE" }}>
        <GraduationCap size={14} className="text-[#1B3A6B] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          <strong>Age-bias tip:</strong> Leave the graduation year blank or omit it entirely. Listing a year from the 1970s–1990s can trigger bias. Your degree and institution are what matter.
        </p>
      </div>
      {items.length === 0 && (
        <div className="text-center py-6">
          <GraduationCap size={28} className="text-[#D1D5DB] mx-auto mb-2" />
          <p className="text-sm text-[#9CA3AF]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>No education added yet</p>
        </div>
      )}
      {items.map((edu, idx) => (
        <div key={edu.id} className="rounded-xl overflow-hidden" style={{ border: "1.5px solid #E5E7EB", background: "white" }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#F9FAFB" }}>
            <p className="text-xs font-bold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {edu.degree || `Education ${idx + 1}`}
            </p>
            <button onClick={() => removeEdu(edu.id)} className="p-1 rounded-full" style={{ background: "#FEE2E2" }}>
              <Trash2 size={12} className="text-red-500" />
            </button>
          </div>
          <div className="px-4 py-3 flex flex-col gap-3">
            <InputField label="Degree / Certification" value={edu.degree} onChange={v => updateEdu(edu.id, { degree: v })} placeholder="e.g. Bachelor of Science, Associate Degree, Certificate" />
            <InputField label="Field of Study" value={edu.fieldOfStudy} onChange={v => updateEdu(edu.id, { fieldOfStudy: v })} placeholder="e.g. Business Administration" />
            <InputField label="Institution" value={edu.institution} onChange={v => updateEdu(edu.id, { institution: v })} placeholder="e.g. Georgia State University" />
            <InputField label="Graduation Year (optional — leave blank to hide)" value={edu.graduationYear} onChange={v => updateEdu(edu.id, { graduationYear: v })} placeholder="Leave blank to omit from resume" />
          </div>
        </div>
      ))}
      <button onClick={addEdu}
        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200"
        style={{ border: "2px dashed #C9922A", color: "#C9922A", background: "#FDF8F0", fontFamily: "'Source Sans 3', sans-serif" }}>
        <Plus size={16} />Add Education
      </button>
    </div>
  );
}

function Step5SkillsPreview({ skills, onSkillsChange, resume }: {
  skills: string[]; onSkillsChange: (s: string[]) => void; resume: ResumeData;
}) {
  const [newSkill, setNewSkill] = useState("");
  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onSkillsChange([...skills, trimmed]);
      setNewSkill("");
    }
  };
  const removeSkill = (s: string) => onSkillsChange(skills.filter(sk => sk !== s));

  const SUGGESTED = [
    "Microsoft Office", "Google Workspace", "QuickBooks", "Scheduling & Calendar Management",
    "Data Entry", "Customer Service", "Project Coordination", "Adobe Creative Suite",
    "Social Media Management", "Budget Management", "Team Leadership", "Virtual Assistance",
    "Canva", "Zoom / Teams", "CRM Software", "Report Writing",
  ];
  const unusedSuggestions = SUGGESTED.filter(s => !skills.includes(s));

  return (
    <div className="flex flex-col gap-4">
      {/* Skills Input */}
      <div className="rounded-xl px-4 py-4 flex flex-col gap-3" style={{ background: "white", border: "1.5px solid #E5E7EB" }}>
        <p className="text-sm font-bold text-[#1B3A6B]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Your Skills</p>
        <div className="flex gap-2">
          <input
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addSkill()}
            placeholder="Type a skill and press Add..."
            className="flex-1 px-3 py-2 rounded-lg text-xs text-[#1B3A6B] outline-none"
            style={{ border: "1.5px solid #E5E7EB", fontFamily: "'Source Sans 3', sans-serif" }}
          />
          <button onClick={addSkill} className="px-3 py-2 rounded-lg font-bold text-xs text-white flex-shrink-0"
            style={{ background: "#C9922A", fontFamily: "'Source Sans 3', sans-serif" }}>
            Add
          </button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <div key={skill} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: "#1B3A6B", color: "white", fontFamily: "'Source Sans 3', sans-serif" }}>
                {skill}
                <button onClick={() => removeSkill(skill)}><Trash2 size={10} /></button>
              </div>
            ))}
          </div>
        )}
        {unusedSuggestions.length > 0 && (
          <div>
            <p className="text-xs text-[#9CA3AF] mb-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Tap to add suggested skills:</p>
            <div className="flex flex-wrap gap-1.5">
              {unusedSuggestions.slice(0, 10).map(s => (
                <button key={s} onClick={() => onSkillsChange([...skills, s])}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                  style={{ background: "#F3F4F6", color: "#4B5563", border: "1px solid #E5E7EB", fontFamily: "'Source Sans 3', sans-serif" }}>
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resume Preview */}
      <ResumePreview resume={resume} />
    </div>
  );
}

// ─── Resume Preview Component ─────────────────────────────────────────────────

function ResumePreview({ resume }: { resume: ResumeData }) {
  const { contact, summary, experience, education, skills } = resume;
  return (
    <div id="resume-preview" className="rounded-xl overflow-hidden" style={{ background: "white", border: "1.5px solid #E5E7EB", fontFamily: "'Source Sans 3', sans-serif" }}>
      {/* Header */}
      <div className="px-6 py-5" style={{ background: "#1B3A6B" }}>
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          {contact.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {contact.email && (
            <span className="flex items-center gap-1 text-xs text-blue-200">
              <Mail size={10} />{contact.email}
            </span>
          )}
          {contact.phone && (
            <span className="flex items-center gap-1 text-xs text-blue-200">
              <Phone size={10} />{contact.phone}
            </span>
          )}
          {(contact.city || contact.state) && (
            <span className="flex items-center gap-1 text-xs text-blue-200">
              <MapPin size={10} />{[contact.city, contact.state].filter(Boolean).join(", ")}
            </span>
          )}
          {contact.linkedin && (
            <span className="flex items-center gap-1 text-xs text-blue-200">
              <Linkedin size={10} />{contact.linkedin}
            </span>
          )}
        </div>
      </div>

      <div className="px-6 py-4 flex flex-col gap-4">
        {/* Summary */}
        {summary && (
          <div>
            <h2 className="text-xs font-bold text-[#C9922A] uppercase tracking-widest mb-1.5" style={{ borderBottom: "1px solid #E8D9C0", paddingBottom: "4px" }}>
              Professional Summary
            </h2>
            <p className="text-xs text-[#4A4A4A] leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-[#C9922A] uppercase tracking-widest mb-2" style={{ borderBottom: "1px solid #E8D9C0", paddingBottom: "4px" }}>
              Professional Experience
            </h2>
            <div className="flex flex-col gap-3">
              {experience.map(job => (
                <div key={job.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-[#1B3A6B]">{job.jobTitle || "Job Title"}</p>
                      <p className="text-xs text-[#6B7280]">{job.company || "Company"}</p>
                    </div>
                    <p className="text-xs text-[#9CA3AF] flex-shrink-0 text-right">
                      {job.startDate}{job.startDate && (job.endDate || job.current) ? " – " : ""}{job.current ? "Present" : job.endDate}
                    </p>
                  </div>
                  {job.bullets.filter(b => b.trim()).length > 0 && (
                    <ul className="mt-1.5 flex flex-col gap-0.5">
                      {job.bullets.filter(b => b.trim()).map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-[#4A4A4A]">
                          <span className="text-[#C9922A] font-bold mt-0.5 flex-shrink-0">•</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-[#C9922A] uppercase tracking-widest mb-2" style={{ borderBottom: "1px solid #E8D9C0", paddingBottom: "4px" }}>
              Education
            </h2>
            <div className="flex flex-col gap-2">
              {education.map(edu => (
                <div key={edu.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-[#1B3A6B]">{edu.degree || "Degree"}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}</p>
                    <p className="text-xs text-[#6B7280]">{edu.institution || "Institution"}</p>
                  </div>
                  {edu.graduationYear && <p className="text-xs text-[#9CA3AF] flex-shrink-0">{edu.graduationYear}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-[#C9922A] uppercase tracking-widest mb-2" style={{ borderBottom: "1px solid #E8D9C0", paddingBottom: "4px" }}>
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map(skill => (
                <span key={skill} className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: "#EFF4FF", color: "#1B3A6B", border: "1px solid #BFDBFE" }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResumeBuilder() {
  const [step, setStep] = useState(1);
  const [resume, setResume] = useState<ResumeData>(EMPTY_RESUME);
  const [downloading, setDownloading] = useState(false);

  const setContact = (contact: ContactInfo) => setResume(r => ({ ...r, contact }));
  const setSummary = (summary: string) => setResume(r => ({ ...r, summary }));
  const setExperience = (experience: WorkExperience[]) => setResume(r => ({ ...r, experience }));
  const setEducation = (education: Education[]) => setResume(r => ({ ...r, education }));
  const setSkills = (skills: string[]) => setResume(r => ({ ...r, skills }));

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

      const { contact, summary, experience, education, skills } = resume;
      const pageW = 215.9;
      const margin = 18;
      const contentW = pageW - margin * 2;
      let y = 0;

      const addPage = () => { doc.addPage(); y = 18; };
      const checkY = (needed: number) => { if (y + needed > 270) addPage(); };

      // Header block
      doc.setFillColor(27, 58, 107);
      doc.rect(0, 0, pageW, 36, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text(contact.fullName || "Your Name", margin, 14);

      const contactParts: string[] = [];
      if (contact.email) contactParts.push(contact.email);
      if (contact.phone) contactParts.push(contact.phone);
      if (contact.city || contact.state) contactParts.push([contact.city, contact.state].filter(Boolean).join(", "));
      if (contact.linkedin) contactParts.push(contact.linkedin);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(180, 200, 230);
      doc.text(contactParts.join("   |   "), margin, 22);
      y = 44;

      const sectionTitle = (title: string) => {
        checkY(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(201, 146, 42);
        doc.text(title.toUpperCase(), margin, y);
        doc.setDrawColor(232, 217, 192);
        doc.line(margin, y + 1.5, margin + contentW, y + 1.5);
        y += 6;
      };

      const bodyText = (text: string, indent = 0, bold = false) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(9);
        doc.setTextColor(74, 74, 74);
        const lines = doc.splitTextToSize(text, contentW - indent);
        checkY(lines.length * 4.5);
        doc.text(lines, margin + indent, y);
        y += lines.length * 4.5;
      };

      // Summary
      if (summary) {
        sectionTitle("Professional Summary");
        bodyText(summary);
        y += 3;
      }

      // Experience
      if (experience.length > 0) {
        sectionTitle("Professional Experience");
        experience.forEach(job => {
          checkY(12);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(27, 58, 107);
          doc.text(job.jobTitle || "Job Title", margin, y);
          const dateStr = [job.startDate, job.current ? "Present" : job.endDate].filter(Boolean).join(" – ");
          if (dateStr) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            const dateW = doc.getTextWidth(dateStr);
            doc.text(dateStr, margin + contentW - dateW, y);
          }
          y += 4.5;
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8.5);
          doc.setTextColor(107, 114, 128);
          doc.text(job.company || "Company", margin, y);
          y += 5;
          job.bullets.filter(b => b.trim()).forEach(bullet => {
            checkY(5);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(74, 74, 74);
            doc.text("•", margin + 2, y);
            const lines = doc.splitTextToSize(bullet, contentW - 8);
            doc.text(lines, margin + 6, y);
            y += lines.length * 4.5;
          });
          y += 2;
        });
        y += 1;
      }

      // Education
      if (education.length > 0) {
        sectionTitle("Education");
        education.forEach(edu => {
          checkY(10);
          const degreeText = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(", ");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(27, 58, 107);
          doc.text(degreeText || "Degree", margin, y);
          if (edu.graduationYear) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            const yw = doc.getTextWidth(edu.graduationYear);
            doc.text(edu.graduationYear, margin + contentW - yw, y);
          }
          y += 4.5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(107, 114, 128);
          doc.text(edu.institution || "Institution", margin, y);
          y += 6;
        });
      }

      // Skills
      if (skills.length > 0) {
        sectionTitle("Skills");
        bodyText(skills.join("   •   "));
      }

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(200, 200, 200);
      doc.text("Built with 50+ WorkReady — Your Experience Is Your Edge.", margin, 275);

      const fileName = `${(contact.fullName || "Resume").replace(/\s+/g, "_")}_Resume.pdf`;
      doc.save(fileName);
      toast.success("Resume downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const currentStep = STEPS.find(s => s.id === step)!;
  const isFirst = step === 1;
  const isLast = step === 5;

  return (
    <div className="section-page">
      <PageHeader title="Resume Builder" subtitle="Build a professional, age-bias-free resume in minutes" />

      {/* Step Progress Bar */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex flex-col items-center gap-1 flex-1">
                <div className="flex items-center w-full">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mx-auto transition-all duration-300"
                    style={{
                      background: done ? "#C9922A" : active ? "#1B3A6B" : "#F3F4F6",
                      border: active ? "2px solid #C9922A" : "none",
                    }}
                  >
                    {done ? <CheckCircle size={14} className="text-white" /> : <Icon size={14} style={{ color: active ? "white" : "#9CA3AF" }} />}
                  </div>
                </div>
                <span className="text-[9px] font-semibold text-center leading-tight"
                  style={{ color: active ? "#1B3A6B" : done ? "#C9922A" : "#9CA3AF", fontFamily: "'Source Sans 3', sans-serif" }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full rounded-full h-1.5 mt-1" style={{ background: "#F3F4F6" }}>
          <div className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%`, background: "linear-gradient(90deg, #1B3A6B, #C9922A)" }} />
        </div>
      </div>

      {/* Step Content */}
      <div className="px-4 py-4">
        <div className="rounded-2xl px-4 py-4 mb-4" style={{ background: "white", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#1B3A6B" }}>
              <currentStep.icon size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1B3A6B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Step {step} of {STEPS.length}: {currentStep.label}
              </p>
            </div>
          </div>

          {step === 1 && <Step1Contact data={resume.contact} onChange={setContact} />}
          {step === 2 && <Step2Summary value={resume.summary} onChange={setSummary} />}
          {step === 3 && <Step3Experience items={resume.experience} onChange={setExperience} />}
          {step === 4 && <Step4Education items={resume.education} onChange={setEducation} />}
          {step === 5 && <Step5SkillsPreview skills={resume.skills} onSkillsChange={setSkills} resume={resume} />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {!isFirst && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ border: "1.5px solid #E5E7EB", color: "#6B7280", background: "white", fontFamily: "'Source Sans 3', sans-serif" }}
            >
              <ChevronLeft size={16} />Back
            </button>
          )}
          {!isLast ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white"
              style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Next<ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleDownloadPDF}
              disabled={downloading || !resume.contact.fullName}
              className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all duration-200"
              style={{
                background: downloading || !resume.contact.fullName
                  ? "#D1D5DB"
                  : "linear-gradient(135deg, #C9922A 0%, #E8B84B 100%)",
                fontFamily: "'Source Sans 3', sans-serif",
                boxShadow: downloading || !resume.contact.fullName ? "none" : "0 4px 14px rgba(201,146,42,0.35)"
              }}
            >
              {downloading ? <><Loader2 size={16} className="animate-spin" />Generating PDF...</> : <><Download size={16} />Download PDF</>}
            </button>
          )}
        </div>

        {isLast && !resume.contact.fullName && (
          <p className="text-xs text-center text-[#EF4444] mt-2" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Please go back to Step 1 and enter your full name before downloading.
          </p>
        )}
      </div>

      <PageFooter />
    </div>
  );
}
