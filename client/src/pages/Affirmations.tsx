/*
 * DESIGN: "Warm Authority" — Warm cream/gold hero card for daily affirmation,
 * scrollable list of all affirmations with navy/gold styling
 */
import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { Heart, RefreshCw, Share2, Star } from "lucide-react";
import { toast } from "sonner";

const affirmations = [
  "My decades of experience are a powerful advantage — not a liability.",
  "I bring wisdom, reliability, and depth that cannot be taught in a classroom.",
  "Every setback I have faced has made me more resilient and resourceful.",
  "I am worthy of a fulfilling, well-paying role that values what I bring.",
  "My age is a testament to my dedication, not a barrier to my future.",
  "I have navigated challenges before, and I will navigate this one too.",
  "The right employer will recognize my value — and I will find them.",
  "I am not starting over. I am starting from experience.",
  "My skills, instincts, and professionalism are assets in any workplace.",
  "I deserve to be treated with respect in every interview and workplace.",
  "I am adaptable, curious, and fully capable of learning new things.",
  "My career story is not finished — the best chapters may still be ahead.",
  "I bring calm, perspective, and maturity that younger teams benefit from.",
  "I will not let one rejection define my worth or dim my confidence.",
  "I am building something meaningful, and I am exactly the right person to build it.",
  "Every 'no' is redirecting me toward the right 'yes.'",
  "I show up prepared, professional, and proud of who I am.",
  "My lived experience is a gift I bring to every room I enter.",
  "I am not too old — I am exactly the right age for the right opportunity.",
  "I believe in my ability to create the career and life I deserve.",
  "I am courageous enough to try, strong enough to persist, and wise enough to succeed.",
  "The world needs people like me — experienced, grounded, and genuinely committed.",
  "I release the fear of judgment and step forward with confidence.",
  "I am a whole, capable, and valuable person — in work and in life.",
  "Today I take one step forward, and that is enough.",
  "I trust the process. My breakthrough is coming.",
  "I am not competing with anyone. I am becoming the best version of myself.",
  "My story inspires others — and that makes my journey worthwhile.",
  "I choose to see possibility where others see obstacles.",
  "I am proud of how far I have come, and excited about where I am going.",
];

function getDailyAffirmation(): { text: string; index: number } {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % affirmations.length;
  return { text: affirmations[index], index };
}

export default function Affirmations() {
  const [daily, setDaily] = useState(getDailyAffirmation);
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem("affirmation-favorites");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("affirmation-favorites", JSON.stringify(Array.from(favorites)));
    } catch {}
  }, [favorites]);

  const toggleFavorite = (index: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleShuffle = () => {
    const newIndex = Math.floor(Math.random() * affirmations.length);
    setDaily({ text: affirmations[newIndex], index: newIndex });
  };

  const handleShare = async () => {
    const text = `"${daily.text}" — 50+ WorkReady`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Affirmation copied to clipboard!");
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="section-page">
      <PageHeader
        title="Daily Affirmations"
        subtitle="Words of strength and confidence for your job search journey"
      />

      <div className="px-4 py-5">
        {/* Today's Date */}
        <p
          className="text-xs font-semibold text-[#C9922A] uppercase tracking-widest mb-3 text-center"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {today}
        </p>

        {/* Daily Affirmation Hero Card */}
        <div
          className="rounded-2xl px-5 py-6 mb-5 relative overflow-hidden fade-up"
          style={{
            background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)",
            boxShadow: "0 8px 32px rgba(27,58,107,0.25)",
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
            style={{ background: "#C9922A", transform: "translate(30%, -30%)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10"
            style={{ background: "#E8B84B", transform: "translate(-30%, 30%)" }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "rgba(201,146,42,0.25)", border: "1px solid #C9922A" }}
              >
                <Star size={14} fill="#C9922A" className="text-[#C9922A]" />
              </div>
              <span
                className="text-xs font-semibold text-[#E8B84B] uppercase tracking-widest"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                Today's Affirmation
              </span>
            </div>

            <p
              className="text-xl font-bold text-white leading-relaxed mb-5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              "{daily.text}"
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(daily.index)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{
                  background: favorites.has(daily.index) ? "#C9922A" : "rgba(255,255,255,0.15)",
                  color: "white",
                  fontFamily: "'Source Sans 3', sans-serif",
                }}
              >
                <Heart
                  size={13}
                  fill={favorites.has(daily.index) ? "white" : "none"}
                  className="text-white"
                />
                {favorites.has(daily.index) ? "Saved" : "Save"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  fontFamily: "'Source Sans 3', sans-serif",
                }}
              >
                <Share2 size={13} />
                Share
              </button>
              <button
                onClick={handleShuffle}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ml-auto"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  fontFamily: "'Source Sans 3', sans-serif",
                }}
              >
                <RefreshCw size={13} />
                New One
              </button>
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        {favorites.size > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={16} fill="#C9922A" className="text-[#C9922A]" />
              <h2
                className="text-base font-bold text-[#1B3A6B]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Your Saved Affirmations
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {Array.from(favorites).map((i) => (
                <div
                  key={i}
                  className="rounded-xl px-4 py-3 flex items-start gap-3"
                  style={{
                    background: "#FFFBEB",
                    border: "1.5px solid #F5D88A",
                  }}
                >
                  <button
                    onClick={() => toggleFavorite(i)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    <Heart size={14} fill="#C9922A" className="text-[#C9922A]" />
                  </button>
                  <p
                    className="text-sm text-[#2D2D2D] leading-relaxed italic flex-1"
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    "{affirmations[i]}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Affirmations Toggle */}
        <button
          onClick={() => setShowAll((v) => !v)}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 mb-3"
          style={{
            background: showAll ? "#EFF4FF" : "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)",
            color: showAll ? "#1B3A6B" : "white",
            border: showAll ? "1.5px solid #C5D5F0" : "none",
            fontFamily: "'Source Sans 3', sans-serif",
            boxShadow: showAll ? "none" : "0 4px 14px rgba(27,58,107,0.25)",
          }}
        >
          {showAll ? "Hide All Affirmations" : `View All ${affirmations.length} Affirmations`}
        </button>

        {/* Full Affirmation List */}
        {showAll && (
          <div className="flex flex-col gap-2 fade-up">
            {affirmations.map((text, i) => (
              <div
                key={i}
                className="rounded-xl px-4 py-3 flex items-start gap-3 transition-all duration-200"
                style={{
                  background: favorites.has(i) ? "#FFFBEB" : "white",
                  border: favorites.has(i) ? "1.5px solid #F5D88A" : "1.5px solid #E5E7EB",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <button
                  onClick={() => toggleFavorite(i)}
                  className="mt-0.5 flex-shrink-0 transition-transform duration-200 active:scale-125"
                >
                  <Heart
                    size={15}
                    fill={favorites.has(i) ? "#C9922A" : "none"}
                    className={favorites.has(i) ? "text-[#C9922A]" : "text-[#D1D5DB]"}
                  />
                </button>
                <p
                  className="text-sm text-[#2D2D2D] leading-relaxed flex-1"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  "{text}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <PageFooter />
    </div>
  );
}
