/*
 * DESIGN: "Warm Authority" — Checklist with animated checkboxes, risk level badge
 * Red/amber/green risk indicators, navy/gold color scheme
 */
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { ShieldAlert, ShieldCheck, AlertTriangle, XCircle, RotateCcw } from "lucide-react";

const redFlags = [
  {
    id: 1,
    label: "Salary sounds too good to be true",
    detail: "Scam jobs often promise $50–$100/hr for simple tasks. Legitimate jobs list realistic market-rate pay.",
  },
  {
    id: 2,
    label: "Asked for personal banking or financial info",
    detail: "No legitimate employer needs your bank account, routing number, or Social Security number before you are hired.",
  },
  {
    id: 3,
    label: "No company address or physical location listed",
    detail: "Real companies have verifiable addresses. Search the company name on Google Maps and LinkedIn.",
  },
  {
    id: 4,
    label: "Vague or generic job description",
    detail: "Descriptions like 'work from home, set your own hours, no experience needed' with no specific duties are major red flags.",
  },
  {
    id: 5,
    label: "You were contacted out of nowhere (unsolicited)",
    detail: "If a 'recruiter' messaged you on WhatsApp, text, or social media without you applying, be very cautious.",
  },
  {
    id: 6,
    label: "Asked to buy equipment or pay upfront fees",
    detail: "Legitimate employers never ask you to pay for equipment, training, or background checks before starting.",
  },
  {
    id: 7,
    label: "Interview was only via text or chat — never a real call",
    detail: "Scammers avoid video or phone calls. A real employer will want to speak with you directly.",
  },
  {
    id: 8,
    label: "Company has no online presence or reviews",
    detail: "Search the company on Google, LinkedIn, and Glassdoor. If nothing comes up, that is a serious warning sign.",
  },
  {
    id: 9,
    label: "Email address uses Gmail, Yahoo, or Hotmail",
    detail: "Legitimate companies use their own domain (e.g., @company.com). A recruiter at 'hr.jobs2024@gmail.com' is suspicious.",
  },
  {
    id: 10,
    label: "Pressure to accept immediately or 'act fast'",
    detail: "Scammers create urgency to prevent you from doing research. Real employers give you time to consider an offer.",
  },
  {
    id: 11,
    label: "Job posting has spelling errors or poor grammar",
    detail: "Professional companies proofread their postings. Multiple errors signal an unprofessional or fraudulent listing.",
  },
  {
    id: 12,
    label: "Asked to cash a check and send money back",
    detail: "This is one of the most common scams. The check will bounce and you will lose the money you sent.",
  },
];

function getRiskLevel(count: number): { level: string; color: string; icon: React.ReactNode; advice: string } {
  if (count === 0) {
    return {
      level: "Low Risk",
      color: "risk-low",
      icon: <ShieldCheck size={20} />,
      advice: "No red flags detected. This job posting appears legitimate. Still do your own research — verify the company on LinkedIn and Google before applying.",
    };
  } else if (count <= 2) {
    return {
      level: "Low Risk",
      color: "risk-low",
      icon: <ShieldCheck size={20} />,
      advice: "1–2 flags may be minor. Research the company thoroughly before proceeding. Look them up on LinkedIn, Glassdoor, and Google.",
    };
  } else if (count <= 5) {
    return {
      level: "Medium Risk",
      color: "risk-medium",
      icon: <AlertTriangle size={20} />,
      advice: "Several red flags present. Proceed with caution. Do not provide personal information until you have verified the company is legitimate. Consider calling the company directly.",
    };
  } else {
    return {
      level: "High Risk — Likely a Scam",
      color: "risk-high",
      icon: <XCircle size={20} />,
      advice: "Multiple red flags detected. This posting shows strong signs of being a scam. Do NOT apply, share personal information, or send any money. Report it to the FTC at reportfraud.ftc.gov.",
    };
  }
}

export default function ScamChecker() {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [showResult, setShowResult] = useState(false);

  const toggle = (id: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setShowResult(false);
  };

  const handleCheck = () => setShowResult(true);
  const handleReset = () => { setChecked(new Set()); setShowResult(false); };

  const risk = getRiskLevel(checked.size);

  return (
    <div className="section-page">
      <PageHeader
        title="Scam Job Checker"
        subtitle="Check off any red flags you spotted in a job posting to see your risk level"
      />

      <div className="px-4 py-5">
        {/* Intro */}
        <div
          className="rounded-xl px-4 py-3 mb-5 flex items-start gap-3"
          style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}
        >
          <ShieldAlert size={20} className="text-[#C9922A] mt-0.5 flex-shrink-0" />
          <p
            className="text-sm text-[#7C4700] leading-relaxed"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <strong>Protect yourself.</strong> Job scams targeting older adults are on the rise. Check off every red flag you see in a job posting, then tap "Check My Risk Level."
          </p>
        </div>

        {/* Checklist */}
        <div className="flex flex-col gap-2 mb-5">
          {redFlags.map((flag) => {
            const isChecked = checked.has(flag.id);
            return (
              <button
                key={flag.id}
                onClick={() => toggle(flag.id)}
                className="w-full text-left rounded-xl px-4 py-3 flex items-start gap-3 transition-all duration-200"
                style={{
                  background: isChecked ? "#FEF2F2" : "white",
                  border: isChecked ? "1.5px solid #FCA5A5" : "1.5px solid #E5E7EB",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
                  style={{
                    background: isChecked ? "#DC2626" : "white",
                    border: isChecked ? "none" : "2px solid #D1D5DB",
                  }}
                >
                  {isChecked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold leading-snug ${isChecked ? "text-[#DC2626]" : "text-[#1B3A6B]"}`}
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    {flag.label}
                  </p>
                  <p
                    className="text-xs text-[#6B7280] mt-0.5 leading-relaxed"
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    {flag.detail}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Counter */}
        <div className="text-center mb-4">
          <span
            className="text-sm font-semibold text-[#6B7280]"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {checked.size} of {redFlags.length} red flags checked
          </span>
        </div>

        {/* Check Button */}
        <button
          onClick={handleCheck}
          className="w-full py-3 rounded-xl font-bold text-white text-base transition-all duration-200 active:scale-95 mb-3"
          style={{
            background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)",
            fontFamily: "'Source Sans 3', sans-serif",
            boxShadow: "0 4px 14px rgba(27,58,107,0.3)",
          }}
        >
          Check My Risk Level
        </button>

        {/* Result */}
        {showResult && (
          <div
            className={`rounded-xl px-4 py-4 mb-4 fade-up ${risk.color}`}
            style={{ border: "1.5px solid currentColor" }}
          >
            <div className="flex items-center gap-2 mb-2">
              {risk.icon}
              <span
                className="font-bold text-base"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {risk.level}
              </span>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {risk.advice}
            </p>
            {checked.size >= 6 && (
              <a
                href="https://reportfraud.ftc.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-xs font-semibold underline"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                Report this scam at reportfraud.ftc.gov →
              </a>
            )}
          </div>
        )}

        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm text-[#6B7280] transition-all duration-200"
          style={{ background: "#F3F4F6", fontFamily: "'Source Sans 3', sans-serif" }}
        >
          <RotateCcw size={14} />
          Reset Checklist
        </button>
      </div>

      <PageFooter />
    </div>
  );
}
