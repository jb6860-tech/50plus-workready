import { useEffect } from "react";
import { useLocation } from "wouter";
import { Crown, CheckCircle, ArrowRight } from "lucide-react";
import PageFooter from "@/components/PageFooter";

export default function PremiumSuccess() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Auto-redirect to bonus scripts after 5 seconds
    const timer = setTimeout(() => navigate("/bonus-scripts"), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="section-page" style={{ background: "#FDF8F0", minHeight: "100vh" }}>
      <div className="flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)" }}>
          <Crown size={36} className="text-[#E8B84B]" />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <CheckCircle size={18} className="text-green-500" />
          <span className="text-sm font-bold text-green-600" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Payment Successful
          </span>
        </div>

        <h1 className="text-2xl font-bold text-[#1B3A6B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Welcome to Premium!
        </h1>
        <p className="text-sm text-[#6B7280] leading-relaxed mb-6 max-w-xs" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          You now have full access to all 10 Bonus Interview Scripts and all future premium content. Your investment in yourself starts right now.
        </p>

        {/* What's unlocked */}
        <div className="w-full rounded-2xl p-4 mb-6 text-left" style={{ background: "white", border: "1px solid #C5D5F0" }}>
          <p className="text-xs font-bold text-[#1B3A6B] uppercase tracking-widest mb-3" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            What's Now Unlocked
          </p>
          {[
            "10 advanced interview scripts for tough questions",
            "Expert coaching tips for each answer",
            "Scripts for age, salary, and career transition questions",
            "All future premium content — automatically included",
          ].map(item => (
            <div key={item} className="flex items-start gap-2 mb-2">
              <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#374151]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>{item}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/bonus-scripts")}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
          style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", fontFamily: "'Source Sans 3', sans-serif" }}
        >
          View My Bonus Scripts <ArrowRight size={16} />
        </button>

        <p className="text-xs text-[#9CA3AF] mt-3" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          Redirecting automatically in 5 seconds...
        </p>
      </div>
      <PageFooter />
    </div>
  );
}
