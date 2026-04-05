/*
 * DESIGN: "Warm Authority" — Resource cards with navy/gold, external link icons
 * Categorized sections: Job Boards, Support Organizations
 */
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { ExternalLink, Briefcase, Heart } from "lucide-react";

const jobBoards = [
  {
    name: "AARP Job Board",
    desc: "The leading job board specifically for workers 50+, with thousands of age-friendly employers.",
    url: "https://jobs.aarp.org",
    badge: "50+ Focused",
  },
  {
    name: "FlexJobs",
    desc: "Curated remote, flexible, and part-time job listings — all screened for legitimacy.",
    url: "https://www.flexjobs.com",
    badge: "Remote & Flexible",
  },
  {
    name: "RetirementJobs.com",
    desc: "Dedicated to connecting experienced workers with employers who value maturity and reliability.",
    url: "https://www.retirementjobs.com",
    badge: "50+ Focused",
  },
  {
    name: "Indeed",
    desc: "The world's largest job board. Use filters for 'part-time,' 'remote,' and 'no experience required.'",
    url: "https://www.indeed.com",
    badge: "General",
  },
  {
    name: "LinkedIn Jobs",
    desc: "Professional networking and job search. Set your profile to 'Open to Work' to attract recruiters.",
    url: "https://www.linkedin.com/jobs",
    badge: "Networking",
  },
  {
    name: "USAJobs.gov",
    desc: "Official federal government job listings. Many roles value experience and offer excellent benefits.",
    url: "https://www.usajobs.gov",
    badge: "Government",
  },
  {
    name: "Idealist",
    desc: "Nonprofit and mission-driven job listings — ideal if you want meaningful work with purpose.",
    url: "https://www.idealist.org",
    badge: "Nonprofit",
  },
  {
    name: "Workforce50.com",
    desc: "Job listings and career resources specifically designed for workers over 50.",
    url: "https://www.workforce50.com",
    badge: "50+ Focused",
  },
];

const organizations = [
  {
    name: "AARP",
    desc: "Advocacy, resources, and tools for Americans 50+, including job search support and employer pledges.",
    url: "https://www.aarp.org/work",
    badge: "Advocacy",
  },
  {
    name: "National Council on Aging",
    desc: "Programs and resources to help older adults find employment, including the Senior Community Service Employment Program (SCSEP).",
    url: "https://www.ncoa.org",
    badge: "Support",
  },
  {
    name: "Workforce50",
    desc: "Free job listings and career resources specifically for workers aged 50 and older seeking part-time or full-time work.",
    url: "https://www.workforce50.com",
    badge: "Free Resource",
  },
];

const badgeColors: Record<string, { bg: string; text: string }> = {
  "50+ Focused": { bg: "#EFF4FF", text: "#1B3A6B" },
  "Remote & Flexible": { bg: "#F0FDF4", text: "#166534" },
  "General": { bg: "#F9FAFB", text: "#374151" },
  "Networking": { bg: "#FDF4FF", text: "#6B21A8" },
  "Government": { bg: "#EFF4FF", text: "#1B3A6B" },
  "Nonprofit": { bg: "#FFF7ED", text: "#9A3412" },
  "Advocacy": { bg: "#FEF3C7", text: "#92400E" },
  "Support": { bg: "#F0FDF4", text: "#166534" },
  "Free Resource": { bg: "#ECFDF5", text: "#065F46" },
};

interface ResourceCardProps {
  name: string;
  desc: string;
  url: string;
  badge: string;
}

function ResourceCard({ name, desc, url, badge }: ResourceCardProps) {
  const colors = badgeColors[badge] || { bg: "#F3F4F6", text: "#374151" };
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="tip-card block no-underline transition-all duration-200 active:scale-98"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="font-bold text-[#1B3A6B] text-sm"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {name}
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: colors.bg, color: colors.text, fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {badge}
            </span>
          </div>
          <p
            className="text-xs text-[#4A4A4A] leading-relaxed"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {desc}
          </p>
          <p
            className="text-xs text-[#C9922A] mt-1.5 font-medium"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {url.replace("https://", "")}
          </p>
        </div>
        <ExternalLink size={16} className="text-[#C9922A] flex-shrink-0 mt-0.5" />
      </div>
    </a>
  );
}

export default function JobResources() {
  return (
    <div className="section-page">
      <PageHeader
        title="Age-Friendly Job Resources"
        subtitle="Trusted job boards and organizations that support experienced workers"
      />

      <div className="px-4 py-5">
        {/* Intro */}
        <div
          className="rounded-xl px-4 py-3 mb-5 flex items-start gap-3"
          style={{ background: "#EFF4FF", border: "1px solid #C5D5F0" }}
        >
          <Briefcase size={20} className="text-[#1B3A6B] mt-0.5 flex-shrink-0" />
          <p
            className="text-sm text-[#1B3A6B] leading-relaxed"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            These resources are specifically curated for adults 50+. All links are legitimate and regularly used by experienced job seekers.
          </p>
        </div>

        {/* Job Boards Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "#1B3A6B" }}
            >
              <Briefcase size={14} className="text-white" />
            </div>
            <h2
              className="text-base font-bold text-[#1B3A6B]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Job Boards
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {jobBoards.map((resource) => (
              <ResourceCard key={resource.name} {...resource} />
            ))}
          </div>
        </div>

        {/* Organizations Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "#C9922A" }}
            >
              <Heart size={14} className="text-white" />
            </div>
            <h2
              className="text-base font-bold text-[#1B3A6B]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Support Organizations
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {organizations.map((resource) => (
              <ResourceCard key={resource.name} {...resource} />
            ))}
          </div>
        </div>

        {/* Tip box */}
        <div
          className="rounded-xl px-4 py-3 mt-2"
          style={{ background: "#FFFBEB", border: "1px solid #F5D88A" }}
        >
          <p
            className="text-xs font-semibold text-[#C9922A] uppercase tracking-wide mb-1"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Pro Tip
          </p>
          <p
            className="text-sm text-[#7A5500] leading-relaxed"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Always research a company on LinkedIn and Google before applying. Look for real employee reviews on Glassdoor and verify the company address exists. Your time and trust are valuable.
          </p>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
