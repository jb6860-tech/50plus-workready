/*
 * DESIGN: "Warm Authority" — Form with navy labels, gold submit button
 * Generated letter fades in with copy/download functionality
 */
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { Copy, Download, RefreshCw, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";

interface FormData {
  name: string;
  jobTitle: string;
  company: string;
  skill1: string;
  skill2: string;
  skill3: string;
  achievement: string;
}

const emptyForm: FormData = {
  name: "",
  jobTitle: "",
  company: "",
  skill1: "",
  skill2: "",
  skill3: "",
  achievement: "",
};

function generateLetter(data: FormData): string {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `${today}

Hiring Manager
${data.company}

Dear Hiring Manager,

I am writing to express my sincere interest in the ${data.jobTitle} position at ${data.company}. With a proven track record of delivering results and a deep commitment to excellence, I am confident that my background and skills make me an outstanding candidate for this role.

Throughout my career, I have developed strong expertise in ${data.skill1}, ${data.skill2}, and ${data.skill3}. These competencies have allowed me to consistently contribute to organizational success and support the teams I have been privileged to work alongside.

One achievement I am particularly proud of: ${data.achievement}. This experience reinforced my ability to take initiative, solve problems, and deliver meaningful outcomes — qualities I look forward to bringing to ${data.company}.

I am energized by the opportunity to contribute to your team and am confident that my experience, professionalism, and dedication will be a valuable asset. I would welcome the chance to discuss how my background aligns with your needs.

Thank you sincerely for your time and consideration. I look forward to hearing from you.

Warm regards,

${data.name}`;
}

export default function CoverLetterBuilder() {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [letter, setLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    if (!form.name || !form.jobTitle || !form.company) {
      toast.error("Please fill in your name, job title, and company name.");
      return;
    }
    setLetter(generateLetter(form));
    setTimeout(() => {
      document.getElementById("letter-preview")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCopy = async () => {
    if (!letter) return;
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    toast.success("Cover letter copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!letter) return;
    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${form.company.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded!");
  };

  const inputClass = `w-full rounded-lg px-3 py-2.5 text-sm border outline-none transition-all duration-200 focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20`;
  const inputStyle = { fontFamily: "'Source Sans 3', sans-serif", borderColor: "#D1D5DB", background: "white" };
  const labelClass = `block text-xs font-semibold text-[#1B3A6B] mb-1.5 uppercase tracking-wide`;
  const labelStyle = { fontFamily: "'Source Sans 3', sans-serif" };

  return (
    <div className="section-page">
      <PageHeader
        title="Cover Letter Builder"
        subtitle="Fill in the fields below and generate a professional cover letter instantly"
      />

      <div className="px-4 py-5">
        {/* Intro */}
        <div
          className="rounded-xl px-4 py-3 mb-5 flex items-start gap-3"
          style={{ background: "#EFF4FF", border: "1px solid #C5D5F0" }}
        >
          <Mail size={20} className="text-[#1B3A6B] mt-0.5 flex-shrink-0" />
          <p
            className="text-sm text-[#1B3A6B] leading-relaxed"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            A strong cover letter is your first impression. Fill in your details and we'll create a polished, professional letter you can copy or download.
          </p>
        </div>

        {/* Form */}
        <div
          className="rounded-xl p-4 mb-5"
          style={{ background: "white", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(27,58,107,0.07)" }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass} style={labelStyle}>Your Full Name *</label>
              <input
                className={inputClass}
                style={inputStyle}
                placeholder="e.g., Janice Stewart"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Job Title You're Applying For *</label>
              <input
                className={inputClass}
                style={inputStyle}
                placeholder="e.g., Administrative Assistant"
                value={form.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Company Name *</label>
              <input
                className={inputClass}
                style={inputStyle}
                placeholder="e.g., Acme Corporation"
                value={form.company}
                onChange={(e) => handleChange("company", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Your Top 3 Skills</label>
              <div className="flex flex-col gap-2">
                <input
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Skill 1 (e.g., Office Management)"
                  value={form.skill1}
                  onChange={(e) => handleChange("skill1", e.target.value)}
                />
                <input
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Skill 2 (e.g., Scheduling & Coordination)"
                  value={form.skill2}
                  onChange={(e) => handleChange("skill2", e.target.value)}
                />
                <input
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Skill 3 (e.g., Customer Relations)"
                  value={form.skill3}
                  onChange={(e) => handleChange("skill3", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>One Personal Achievement</label>
              <textarea
                className={`${inputClass} resize-none`}
                style={{ ...inputStyle, minHeight: "80px" }}
                placeholder="e.g., Streamlined the onboarding process for 30+ new employees, reducing setup time by 40%"
                value={form.achievement}
                onChange={(e) => handleChange("achievement", e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full mt-4 py-3 rounded-xl font-bold text-white text-base transition-all duration-200 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)",
              fontFamily: "'Source Sans 3', sans-serif",
              boxShadow: "0 4px 14px rgba(27,58,107,0.3)",
            }}
          >
            Generate My Cover Letter
          </button>
        </div>

        {/* Generated Letter */}
        {letter && (
          <div id="letter-preview" className="fade-up">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={18} className="text-[#C9922A]" />
              <h3
                className="font-bold text-[#1B3A6B] text-base"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Your Cover Letter
              </h3>
            </div>

            <div
              className="rounded-xl p-4 mb-4"
              style={{
                background: "#FDF8F0",
                border: "1.5px solid #C9922A",
                boxShadow: "0 4px 16px rgba(201,146,42,0.1)",
              }}
            >
              <pre
                className="text-sm text-[#2D2D2D] leading-relaxed whitespace-pre-wrap"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                {letter}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95"
                style={{
                  background: copied ? "#d1fae5" : "#EFF4FF",
                  color: copied ? "#065f46" : "#1B3A6B",
                  border: "1.5px solid",
                  borderColor: copied ? "#6ee7b7" : "#C5D5F0",
                  fontFamily: "'Source Sans 3', sans-serif",
                }}
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Text"}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 active:scale-95"
                style={{
                  background: "#C9922A",
                  fontFamily: "'Source Sans 3', sans-serif",
                  boxShadow: "0 4px 12px rgba(201,146,42,0.3)",
                }}
              >
                <Download size={16} />
                Download
              </button>
            </div>

            <button
              onClick={() => { setLetter(null); setForm(emptyForm); }}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm text-[#6B7280] transition-all duration-200"
              style={{ background: "#F3F4F6", fontFamily: "'Source Sans 3', sans-serif" }}
            >
              <RefreshCw size={14} />
              Start Over
            </button>
          </div>
        )}
      </div>

      <PageFooter />
    </div>
  );
}
