import PageFooter from "@/components/PageFooter";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Section {
  title: string;
  content: string[];
}

const sections: Section[] = [
  {
    title: "1. Information We Collect",
    content: [
      "Account Information: When you sign in, we collect your name and email address through Manus OAuth authentication.",
      "Resume Data: Information you enter in the Resume Builder (name, contact details, work history, education, skills) is stored securely in our database so you can save and return to your resume.",
      "Job Application Data: Job titles, company names, dates, statuses, and notes you enter in the Job Tracker are stored in your account.",
      "Success Stories: If you choose to submit a success story, the name and story text you provide are stored and may be displayed publicly within the app.",
      "Usage Data: We collect basic usage information (pages visited, features used) to improve the app experience. This data is anonymized and not linked to your identity.",
      "Device Information: Standard browser and device information (browser type, operating system, screen size) is collected automatically for compatibility purposes.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "To provide and personalize the app experience, including saving your resume drafts and job applications.",
      "To process premium subscription payments securely through Stripe.",
      "To send follow-up reminders you have scheduled in the Job Tracker (browser notifications only — we do not send SMS or marketing emails without your consent).",
      "To display community success stories you have chosen to share publicly.",
      "To improve the app by analyzing anonymized usage patterns.",
      "To respond to support requests or questions you send us.",
    ],
  },
  {
    title: "3. Payment Information",
    content: [
      "All payment processing is handled by Stripe, a PCI-DSS compliant payment processor.",
      "We never store your credit card number, CVV, or full payment details on our servers.",
      "We store only your Stripe Customer ID and Subscription ID to manage your premium access.",
      "You can manage or cancel your subscription at any time through the My Account section of the app.",
    ],
  },
  {
    title: "4. Data Sharing",
    content: [
      "We do not sell, rent, or trade your personal information to third parties.",
      "We share data only with the following service providers who help us operate the app:",
      "• Stripe — for payment processing (stripe.com/privacy)",
      "• Manus — for authentication and app hosting (manus.im)",
      "We may disclose information if required by law or to protect the rights and safety of our users.",
    ],
  },
  {
    title: "5. Data Storage and Security",
    content: [
      "Your data is stored on secure, encrypted servers.",
      "We use industry-standard HTTPS encryption for all data transmitted between your device and our servers.",
      "Access to your account data is protected by authentication — only you can access your saved resumes, job applications, and account information.",
      "We retain your data for as long as your account is active. You may request deletion of your account and data at any time by contacting us.",
    ],
  },
  {
    title: "6. AI-Powered Features",
    content: [
      "The app includes AI-powered features including Resume Feedback, Job Match Analysis, Cover Letter Generation, and Interview Coach.",
      "When you use these features, the text you provide (resume content, job descriptions) is sent to our AI service to generate responses.",
      "This data is used only to generate your requested output and is not stored or used to train AI models.",
      "Do not include sensitive personal information (Social Security numbers, financial account numbers, passwords) in AI feature inputs.",
    ],
  },
  {
    title: "7. Your Rights",
    content: [
      "Access: You may request a copy of the personal data we hold about you.",
      "Correction: You may update or correct your information at any time through the app.",
      "Deletion: You may request deletion of your account and all associated data.",
      "Portability: You may request your data in a portable format.",
      "Opt-out: You may disable browser notifications at any time through your device settings.",
      "To exercise any of these rights, contact us at the email address below.",
    ],
  },
  {
    title: "8. Children's Privacy",
    content: [
      "50+ WorkReady is designed for adults aged 18 and older.",
      "We do not knowingly collect personal information from anyone under the age of 18.",
      "If you believe a minor has provided us with personal information, please contact us immediately.",
    ],
  },
  {
    title: "9. Cookies and Tracking",
    content: [
      "We use a session cookie to keep you signed in to your account. This cookie is essential for the app to function and cannot be disabled.",
      "We use anonymized analytics to understand how the app is used. This does not identify you personally.",
      "We do not use advertising cookies or third-party tracking pixels.",
    ],
  },
  {
    title: "10. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time. When we do, we will update the 'Last Updated' date at the top of this page.",
      "For significant changes, we will notify you through the app.",
      "Your continued use of the app after changes are posted constitutes your acceptance of the updated policy.",
    ],
  },
  {
    title: "11. Contact Us",
    content: [
      "If you have questions, concerns, or requests regarding this Privacy Policy, please contact us at:",
      "App: 50+ WorkReady",
      "Website: https://workready50-7acqhxvw.manus.space",
      "We aim to respond to all privacy-related inquiries within 5 business days.",
    ],
  },
];

function PolicySection({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border border-[#1a2e5a]/20 rounded-xl overflow-hidden mb-3"
      style={{ background: "rgba(255,255,255,0.85)" }}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span
          className="font-semibold text-base"
          style={{ color: "#1a2e5a", fontFamily: "'Playfair Display', serif" }}
        >
          {section.title}
        </span>
        {open ? (
          <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: "#c9a84c" }} />
        ) : (
          <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: "#c9a84c" }} />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-2">
          {section.content.map((line, i) => (
            <p key={i} className="text-sm leading-relaxed" style={{ color: "#374151" }}>
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "linear-gradient(160deg, #f5f0e8 0%, #eef2f7 100%)" }}
    >
      {/* Header */}
      <div
        className="px-5 pt-10 pb-8 text-center"
        style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #2a4080 100%)" }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(201,168,76,0.2)", border: "2px solid #c9a84c" }}
        >
          <Shield className="w-7 h-7" style={{ color: "#c9a84c" }} />
        </div>
        <h1
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
          50+ WorkReady
        </p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
          Last Updated: April 3, 2026
        </p>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Intro */}
        <div
          className="rounded-2xl p-5 mb-6 border"
          style={{
            background: "rgba(255,255,255,0.9)",
            borderColor: "rgba(201,168,76,0.3)",
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
            At <strong>50+ WorkReady</strong>, your privacy matters deeply to us. This Privacy
            Policy explains what information we collect, how we use it, and the choices you have
            regarding your data. We are committed to being transparent and keeping your information
            safe.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: "#374151" }}>
            By using the 50+ WorkReady app, you agree to the practices described in this policy.
          </p>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <PolicySection key={section.title} section={section} />
        ))}

        {/* Summary box */}
        <div
          className="rounded-2xl p-5 mt-4 border"
          style={{
            background: "linear-gradient(135deg, rgba(26,46,90,0.05) 0%, rgba(201,168,76,0.08) 100%)",
            borderColor: "rgba(201,168,76,0.3)",
          }}
        >
          <h3
            className="font-bold text-base mb-2"
            style={{ color: "#1a2e5a", fontFamily: "'Playfair Display', serif" }}
          >
            Our Privacy Promise
          </h3>
          <ul className="space-y-1">
            {[
              "We never sell your personal data",
              "We never store your payment card details",
              "You can delete your account and data at any time",
              "AI features do not store or train on your content",
              "We use industry-standard encryption to protect your data",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "#374151" }}>
                <span style={{ color: "#c9a84c" }} className="mt-0.5 flex-shrink-0">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
