/*
 * DESIGN: "Warm Authority" — Navy background, Gold active indicator, Source Sans 3 labels
 * Redesigned: 5 primary tabs + "More" slide-up drawer for all secondary features
 */
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Home, FileText, GraduationCap, User, MoreHorizontal,
  MessageSquare, Mail, ShieldAlert, Briefcase, Heart,
  ClipboardList, DollarSign, Users, Crown, Linkedin,
  Gift, Network, Shield, FilePen, Target, Tag, X
} from "lucide-react";

// 5 primary tabs always visible
const primaryNav = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/resume-builder", icon: FilePen, label: "Resume" },
  { path: "/interview-coach", icon: GraduationCap, label: "AI Coach" },
  { path: "/job-tracker", icon: ClipboardList, label: "Tracker" },
  { path: "/account", icon: User, label: "Account" },
];

// All other features in the More drawer
const moreItems = [
  { path: "/resume-tips", icon: FileText, label: "Resume Tips" },
  { path: "/interview-scripts", icon: MessageSquare, label: "Interview Scripts" },
  { path: "/cover-letter", icon: Mail, label: "Cover Letter" },
  { path: "/scam-checker", icon: ShieldAlert, label: "Scam Checker" },
  { path: "/job-resources", icon: Briefcase, label: "Job Resources" },
  { path: "/affirmations", icon: Heart, label: "Affirmations" },
  { path: "/salary-negotiation", icon: DollarSign, label: "Salary Tips" },
  { path: "/success-stories", icon: Users, label: "Success Stories" },
  { path: "/job-match", icon: Target, label: "Job Match" },
  { path: "/bonus-scripts", icon: Crown, label: "Premium Scripts" },
  { path: "/linkedin-guide", icon: Linkedin, label: "LinkedIn Guide" },
  { path: "/networking", icon: Network, label: "Networking Hub" },
  { path: "/referral", icon: Gift, label: "Referral Program" },
  { path: "/pricing", icon: Tag, label: "Pricing & Plans" },
  { path: "/admin", icon: Shield, label: "Admin Dashboard" },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const isMoreActive = moreItems.some((item) => item.path === location);

  return (
    <>
      {/* More Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* More Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          background: "linear-gradient(180deg, #1a2e5a 0%, #0f1e3d 100%)",
          borderRadius: "20px 20px 0 0",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 80px)",
          maxHeight: "75vh",
          overflowY: "auto",
        }}
      >
        {/* Drawer Handle */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
          <h3
            className="text-white font-semibold text-base"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            All Features
          </h3>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)" }}
            aria-label="Close menu"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Drawer Grid */}
        <div className="grid grid-cols-3 gap-2 p-4">
          {moreItems.map(({ path, icon: Icon, label }) => {
            const isActive = location === path;
            return (
              <button
                key={path}
                onClick={() => handleNavigate(path)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200"
                style={{
                  background: isActive
                    ? "rgba(201,168,76,0.25)"
                    : "rgba(255,255,255,0.06)",
                  border: isActive
                    ? "1px solid rgba(201,168,76,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: isActive
                      ? "#C9922A"
                      : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-white" : "text-blue-200"}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>
                <span
                  className="text-[10px] font-medium text-center leading-tight"
                  style={{
                    color: isActive ? "#E8B84B" : "rgba(255,255,255,0.7)",
                    fontFamily: "'Source Sans 3', sans-serif",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Bottom Nav Bar */}
      <nav className="bottom-nav">
        <div className="flex items-center justify-around px-1 py-1.5">
          {primaryNav.map(({ path, icon: Icon, label }) => {
            const isActive = location === path;
            return (
              <button
                key={path}
                onClick={() => handleNavigate(path)}
                className="flex flex-col items-center gap-0.5 px-1 py-1 min-w-0 flex-1 transition-all duration-200"
                aria-label={label}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
                    isActive ? "bg-[#C9922A] scale-110" : "bg-transparent"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-white" : "text-blue-200"}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium leading-tight text-center transition-colors duration-200 ${
                    isActive ? "text-[#E8B84B]" : "text-blue-300"
                  }`}
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {label}
                </span>
              </button>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="flex flex-col items-center gap-0.5 px-1 py-1 min-w-0 flex-1 transition-all duration-200"
            aria-label="More features"
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
                isMoreActive || drawerOpen ? "bg-[#C9922A] scale-110" : "bg-transparent"
              }`}
            >
              <MoreHorizontal
                size={18}
                className={isMoreActive || drawerOpen ? "text-white" : "text-blue-200"}
                strokeWidth={isMoreActive || drawerOpen ? 2.5 : 1.8}
              />
            </div>
            <span
              className={`text-[10px] font-medium leading-tight text-center transition-colors duration-200 ${
                isMoreActive || drawerOpen ? "text-[#E8B84B]" : "text-blue-300"
              }`}
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
