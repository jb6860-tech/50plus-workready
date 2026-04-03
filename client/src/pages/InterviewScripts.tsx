/*
 * DESIGN: "Warm Authority" — Accordion-style expandable interview Q&A
 * Navy/gold color scheme, interview photo header
 */
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";

const INTERVIEW_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663372772610/7aCQhXVwYTmP85sKfYqKej/interview-banner-QK8eQVVM7CpBLK3n9KdrtQ.webp";

const questions = [
  {
    q: "Tell me about yourself.",
    tip: "Keep it professional and forward-focused. Highlight your value, not your history.",
    script: `"I'm a seasoned professional with over [X] years of experience in [your field]. Throughout my career, I've developed strong skills in [2–3 key skills], and I've consistently delivered results in fast-paced environments. What excites me most about this role is the opportunity to bring that depth of experience to your team — I'm energized by new challenges and I'm at a point in my career where I can contribute meaningfully from day one."`,
  },
  {
    q: "Why is there a gap in your employment?",
    tip: "Be honest but brief. Redirect to what you've been doing productively.",
    script: `"I took some time to [care for a family member / pursue freelance work / update my skills / reflect on my next direction]. During that time, I [completed an online course / volunteered / worked on independent projects]. I'm now fully ready and genuinely excited to bring my skills back to a full-time role."`,
  },
  {
    q: "Are you comfortable working with younger colleagues or a younger manager?",
    tip: "Answer with confidence and genuine enthusiasm — this is a chance to show your collaborative spirit.",
    script: `"Absolutely. I've always believed that great teams are built on diverse perspectives, and that includes age. I genuinely enjoy learning from colleagues at every stage of their careers — they bring fresh ideas and energy that I find inspiring. And I bring the benefit of experience, which I'm happy to share without being prescriptive about it. I think that's a powerful combination."`,
  },
  {
    q: "How do you keep up with technology and new tools?",
    tip: "Name specific tools you use. Show curiosity and adaptability.",
    script: `"I make it a point to stay current. I regularly use [Microsoft 365, Google Workspace, Canva, Zoom, etc.] and I've recently explored [AI tools / a new software platform]. When I encounter a new tool, I lean into it — I watch tutorials, practice, and ask questions. I've found that my experience actually helps me learn new technology faster because I understand the underlying workflows."`,
  },
  {
    q: "Where do you see yourself in 5 years?",
    tip: "Be honest and grounded. Employers appreciate stability and commitment.",
    script: `"I'm at a stage in my career where I'm looking for a role where I can make a genuine, lasting contribution. In five years, I'd love to be seen as a trusted, go-to resource on this team — someone who has helped improve processes, supported colleagues, and grown alongside the organization. I'm not chasing titles; I'm chasing impact."`,
  },
  {
    q: "Why do you want to work here?",
    tip: "Do your research. Mention something specific about the company.",
    script: `"I was drawn to [Company Name] because of [something specific — their mission, reputation, a recent project, their values]. Your commitment to [X] resonates with the way I've always approached my work. I want to be part of a team that takes its work seriously and treats people with respect — and everything I've seen about your organization suggests that's exactly the culture here."`,
  },
  {
    q: "What is your greatest weakness?",
    tip: "Choose a real but manageable weakness. Show self-awareness and growth.",
    script: `"I've sometimes been a perfectionist — I hold myself to very high standards, which occasionally meant I spent more time on a task than necessary. Over the years, I've learned to balance quality with efficiency by setting clear time boundaries for myself and asking for feedback earlier in the process rather than waiting until something is 'perfect.' It's made me a more effective collaborator."`,
  },
  {
    q: "Why should we hire you over other candidates?",
    tip: "This is your moment. Be direct, confident, and specific.",
    script: `"Because I bring something that takes years to build — a combination of deep expertise, professional maturity, and genuine reliability. I don't need extensive hand-holding, I don't create drama, and I show up every day committed to doing excellent work. I've navigated complex situations, managed competing priorities, and built strong working relationships throughout my career. You're not just getting a skilled employee — you're getting someone who is invested in your organization's success."`,
  },
];

export default function InterviewScripts() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="section-page">
      <PageHeader
        title="Interview Confidence Scripts"
        subtitle="Practice these age-positive answers to walk in ready and confident"
        imageSrc={INTERVIEW_IMAGE}
      />

      <div className="px-4 py-5">
        {/* Intro callout */}
        <div
          className="rounded-xl px-4 py-3 mb-5 flex items-start gap-3"
          style={{ background: "#FFFBEB", border: "1px solid #F5D88A" }}
        >
          <Lightbulb size={20} className="text-[#C9922A] mt-0.5 flex-shrink-0" />
          <p
            className="text-sm text-[#7A5500] leading-relaxed"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <strong>Tip:</strong> Read each script aloud 2–3 times before your interview. Familiarity builds confidence — you don't need to memorize it word-for-word, just internalize the spirit.
          </p>
        </div>

        {/* Accordion Questions */}
        <div className="flex flex-col gap-3">
          {questions.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{
                  border: isOpen ? "1.5px solid #C9922A" : "1.5px solid #E5E7EB",
                  background: "white",
                  boxShadow: isOpen ? "0 4px 16px rgba(201,146,42,0.12)" : "0 1px 4px rgba(0,0,0,0.06)",
                  transition: "all 0.2s ease",
                }}
              >
                <button
                  className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                      style={{ background: isOpen ? "#C9922A" : "#1B3A6B", fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      {i + 1}
                    </div>
                    <span
                      className="font-semibold text-sm text-[#1B3A6B] leading-snug"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      {item.q}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={18} className="text-[#C9922A] flex-shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-[#9CA3AF] flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4">
                    <div
                      className="rounded-lg px-3 py-2 mb-3 flex items-start gap-2"
                      style={{ background: "#EFF4FF" }}
                    >
                      <Lightbulb size={14} className="text-[#2A5298] mt-0.5 flex-shrink-0" />
                      <p
                        className="text-xs text-[#2A5298] leading-relaxed"
                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        <strong>Strategy:</strong> {item.tip}
                      </p>
                    </div>
                    <div
                      className="rounded-lg px-4 py-3"
                      style={{ background: "#FDF8F0", border: "1px solid #E8D9C0" }}
                    >
                      <p
                        className="text-xs font-semibold text-[#C9922A] uppercase tracking-wide mb-2"
                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        Sample Script
                      </p>
                      <p
                        className="text-sm text-[#2D2D2D] leading-relaxed italic"
                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        {item.script}
                      </p>
                    </div>
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
