/*
 * DESIGN: "Warm Authority" — Gold-bordered tip cards, navy header with resume image
 * Large readable fonts (16px+), staggered fade-up animation
 */
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { CheckCircle2 } from "lucide-react";

const RESUME_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663372772610/7aCQhXVwYTmP85sKfYqKej/resume-tips-banner-ks7WK2NfBPXawLsJ2Mnhgq.webp";

const tips = [
  {
    number: "01",
    title: "Limit Your Work History to 10–15 Years",
    body: "Employers focus on recent experience. List only the last 10–15 years of work history. Older roles can be summarized briefly or omitted entirely — this keeps your resume concise and avoids revealing your age through dates.",
  },
  {
    number: "02",
    title: "Remove Your Graduation Year",
    body: "Graduation dates are one of the fastest ways employers estimate age. Simply list your degree and institution without the year. If asked, you can address it in the interview where your confidence will speak louder.",
  },
  {
    number: "03",
    title: "Use a Modern, Clean Format",
    body: "Avoid outdated resume styles with objectives, references, or two-column layouts. Use a clean single-column format with clear section headers, consistent fonts (like Calibri or Arial), and plenty of white space. PDF format is preferred.",
  },
  {
    number: "04",
    title: "Lead with a Strong Professional Summary",
    body: "Replace an 'Objective' statement with a 2–3 sentence Professional Summary that highlights your value. Example: 'Detail-oriented administrative professional with 20+ years of experience in office coordination, vendor management, and team support. Skilled in Microsoft Office, scheduling, and process improvement.'",
  },
  {
    number: "05",
    title: "Highlight Transferable Skills",
    body: "Focus on skills that are relevant today: communication, project management, problem-solving, digital tools, and leadership. Frame your experience in terms of results — use numbers when possible (e.g., 'Managed a $50K office supply budget' or 'Onboarded 30+ new employees annually').",
  },
  {
    number: "06",
    title: "Update Your Tech Skills Section",
    body: "Include modern tools you know: Microsoft 365, Google Workspace, Zoom, Slack, Canva, or any industry-specific software. If you've used AI tools like ChatGPT or Midjourney, list them — it signals adaptability and forward-thinking.",
  },
  {
    number: "07",
    title: "Use a Professional Email Address",
    body: "Your email should look professional. Avoid addresses that include birth years (e.g., jsmith1960@...). Use a simple format like firstname.lastname@gmail.com. Also ensure your LinkedIn URL is included and your profile photo is current.",
  },
  {
    number: "08",
    title: "Tailor Each Resume to the Job",
    body: "Read the job description carefully and mirror its language in your resume. Applicant Tracking Systems (ATS) scan for keywords before a human ever sees your resume. Customize your Professional Summary and Skills section for each application.",
  },
];

export default function ResumeTips() {
  return (
    <div className="section-page">
      <PageHeader
        title="Resume Tips"
        subtitle="Practical strategies to modernize your resume and reduce age bias"
        imageSrc={RESUME_IMAGE}
      />

      <div className="px-4 py-5">
        {/* Intro callout */}
        <div
          className="rounded-xl px-4 py-3 mb-5 flex items-start gap-3"
          style={{ background: "#EFF4FF", border: "1px solid #C5D5F0" }}
        >
          <CheckCircle2 size={20} className="text-[#1B3A6B] mt-0.5 flex-shrink-0" />
          <p
            className="text-sm text-[#1B3A6B] leading-relaxed"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <strong>Your experience is an asset.</strong> These tips help you present it in the most compelling, modern way — without hiding who you are.
          </p>
        </div>

        {/* Tip Cards */}
        <div className="flex flex-col gap-4">
          {tips.map((tip, i) => (
            <div
              key={tip.number}
              className={`tip-card fade-up fade-up-delay-${Math.min(i + 1, 6)}`}
            >
              <div className="flex items-start gap-3">
                <div className="nav-badge text-sm">{tip.number}</div>
                <div className="min-w-0">
                  <h3
                    className="font-bold text-[#1B3A6B] text-base leading-snug mb-1.5"
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    {tip.title}
                  </h3>
                  <p
                    className="text-sm text-[#4A4A4A] leading-relaxed"
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    {tip.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
