/*
 * DESIGN: "Warm Authority" — Navy background, Gold active indicator, Source Sans 3 labels
 * Bottom nav is the primary navigation for mobile-first PWA — 7 items
 */
import { useLocation } from "wouter";
import { Home, FileText, MessageSquare, Mail, ShieldAlert, Briefcase, Heart } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/resume-tips", icon: FileText, label: "Resume" },
  { path: "/interview-scripts", icon: MessageSquare, label: "Interview" },
  { path: "/cover-letter", icon: Mail, label: "Cover Letter" },
  { path: "/scam-checker", icon: ShieldAlert, label: "Scam Check" },
  { path: "/job-resources", icon: Briefcase, label: "Resources" },
  { path: "/affirmations", icon: Heart, label: "Affirm" },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around px-0.5 py-1.5">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 px-0.5 py-1 min-w-0 flex-1 transition-all duration-200"
              aria-label={label}
            >
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
                  isActive ? "bg-[#C9922A] scale-110" : "bg-transparent"
                }`}
              >
                <Icon
                  size={16}
                  className={isActive ? "text-white" : "text-blue-200"}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span
                className={`text-[9px] font-medium leading-tight text-center transition-colors duration-200 ${
                  isActive ? "text-[#E8B84B]" : "text-blue-300"
                }`}
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
