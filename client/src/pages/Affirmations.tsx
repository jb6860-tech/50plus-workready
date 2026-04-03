/*
 * DESIGN: "Warm Authority" — Daily hero card, custom affirmations section,
 * favorites list, full scrollable list — all persisted in localStorage
 */
import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import PageFooter from "@/components/PageFooter";
import { Heart, RefreshCw, Share2, Star, Plus, Trash2, X, Pencil } from "lucide-react";
import { toast } from "sonner";

const BUILT_IN_AFFIRMATIONS = [
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

interface CustomAffirmation {
  id: string;
  text: string;
}

function loadCustom(): CustomAffirmation[] {
  try {
    const saved = localStorage.getItem("custom-affirmations");
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function loadFavorites(): Set<string> {
  try {
    const saved = localStorage.getItem("affirmation-favorites-v2");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch { return new Set(); }
}

function getDailyAffirmation(allTexts: string[]): { text: string; key: string } {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % allTexts.length;
  return { text: allTexts[index], key: `builtin-${index}` };
}

export default function Affirmations() {
  const [customList, setCustomList] = useState<CustomAffirmation[]>(loadCustom);
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites);
  const [showAll, setShowAll] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "favorites" | "mine">("all");

  // Combine built-in + custom for daily rotation
  const allTexts = [
    ...BUILT_IN_AFFIRMATIONS,
    ...customList.map(c => c.text),
  ];

  const [daily, setDaily] = useState(() => getDailyAffirmation(allTexts));

  useEffect(() => {
    try {
      localStorage.setItem("custom-affirmations", JSON.stringify(customList));
    } catch {}
  }, [customList]);

  useEffect(() => {
    try {
      localStorage.setItem("affirmation-favorites-v2", JSON.stringify(Array.from(favorites)));
    } catch {}
  }, [favorites]);

  const toggleFavorite = (key: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleShuffle = () => {
    const newIndex = Math.floor(Math.random() * allTexts.length);
    const isCustom = newIndex >= BUILT_IN_AFFIRMATIONS.length;
    const key = isCustom
      ? `custom-${customList[newIndex - BUILT_IN_AFFIRMATIONS.length]?.id}`
      : `builtin-${newIndex}`;
    setDaily({ text: allTexts[newIndex], key });
  };

  const handleShare = async () => {
    const text = `"${daily.text}" — 50+ WorkReady`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Affirmation copied to clipboard!");
    }
  };

  const handleAddCustom = () => {
    if (!customInput.trim()) {
      toast.error("Please write your affirmation first.");
      return;
    }
    if (editingCustomId) {
      setCustomList(prev => prev.map(c => c.id === editingCustomId ? { ...c, text: customInput.trim() } : c));
      toast.success("Affirmation updated!");
      setEditingCustomId(null);
    } else {
      const newAff: CustomAffirmation = { id: Date.now().toString(), text: customInput.trim() };
      setCustomList(prev => [newAff, ...prev]);
      toast.success("Your affirmation saved!");
    }
    setCustomInput("");
    setShowCustomForm(false);
  };

  const handleEditCustom = (aff: CustomAffirmation) => {
    setCustomInput(aff.text);
    setEditingCustomId(aff.id);
    setShowCustomForm(true);
  };

  const handleDeleteCustom = (id: string) => {
    setCustomList(prev => prev.filter(c => c.id !== id));
    setFavorites(prev => { const next = new Set(prev); next.delete(`custom-${id}`); return next; });
    toast.success("Affirmation removed.");
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const favoritedBuiltIn = BUILT_IN_AFFIRMATIONS
    .map((text, i) => ({ text, key: `builtin-${i}` }))
    .filter(a => favorites.has(a.key));
  const favoritedCustom = customList
    .map(c => ({ text: c.text, key: `custom-${c.id}`, id: c.id }))
    .filter(a => favorites.has(a.key));
  const allFavorites = [...favoritedBuiltIn, ...favoritedCustom];

  return (
    <div className="section-page">
      <PageHeader
        title="Daily Affirmations"
        subtitle="Words of strength and confidence for your job search journey"
      />

      <div className="px-4 py-5">
        {/* Date */}
        <p className="text-xs font-semibold text-[#C9922A] uppercase tracking-widest mb-3 text-center" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {today}
        </p>

        {/* Daily Hero Card */}
        <div className="rounded-2xl px-5 py-6 mb-5 relative overflow-hidden fade-up" style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", boxShadow: "0 8px 32px rgba(27,58,107,0.25)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "#C9922A", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10" style={{ background: "#E8B84B", transform: "translate(-30%, 30%)" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(201,146,42,0.25)", border: "1px solid #C9922A" }}>
                <Star size={14} fill="#C9922A" className="text-[#C9922A]" />
              </div>
              <span className="text-xs font-semibold text-[#E8B84B] uppercase tracking-widest" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>Today's Affirmation</span>
            </div>
            <p className="text-xl font-bold text-white leading-relaxed mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              "{daily.text}"
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleFavorite(daily.key)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200" style={{ background: favorites.has(daily.key) ? "#C9922A" : "rgba(255,255,255,0.15)", color: "white", fontFamily: "'Source Sans 3', sans-serif" }}>
                <Heart size={13} fill={favorites.has(daily.key) ? "white" : "none"} className="text-white" />
                {favorites.has(daily.key) ? "Saved" : "Save"}
              </button>
              <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold" style={{ background: "rgba(255,255,255,0.15)", color: "white", fontFamily: "'Source Sans 3', sans-serif" }}>
                <Share2 size={13} /> Share
              </button>
              <button onClick={handleShuffle} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ml-auto" style={{ background: "rgba(255,255,255,0.15)", color: "white", fontFamily: "'Source Sans 3', sans-serif" }}>
                <RefreshCw size={13} /> New One
              </button>
            </div>
          </div>
        </div>

        {/* Add Custom Affirmation Button */}
        {!showCustomForm && (
          <button
            onClick={() => { setShowCustomForm(true); setEditingCustomId(null); setCustomInput(""); }}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mb-5 transition-all duration-200"
            style={{ background: "#EFF4FF", color: "#1B3A6B", border: "1.5px solid #C5D5F0", fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <Plus size={16} /> Write Your Own Affirmation
          </button>
        )}

        {/* Custom Affirmation Form */}
        {showCustomForm && (
          <div className="rounded-xl p-4 mb-5 fade-up" style={{ background: "white", border: "1.5px solid #C9922A", boxShadow: "0 4px 16px rgba(201,146,42,0.12)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#1B3A6B] text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
                {editingCustomId ? "Edit Your Affirmation" : "Write Your Own Affirmation"}
              </h3>
              <button onClick={() => { setShowCustomForm(false); setEditingCustomId(null); setCustomInput(""); }}>
                <X size={16} className="text-[#9CA3AF]" />
              </button>
            </div>
            <textarea
              className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none transition-all duration-200 focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20 resize-none"
              style={{ fontFamily: "'Source Sans 3', sans-serif", borderColor: "#D1D5DB", background: "white", minHeight: "80px" }}
              placeholder="Write something meaningful to you... e.g., I am strong, capable, and ready for what comes next."
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
            />
            <div className="flex gap-3 mt-3">
              <button onClick={() => { setShowCustomForm(false); setEditingCustomId(null); setCustomInput(""); }} className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-[#6B7280]" style={{ background: "#F3F4F6", fontFamily: "'Source Sans 3', sans-serif" }}>Cancel</button>
              <button onClick={handleAddCustom} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white" style={{ background: "#C9922A", fontFamily: "'Source Sans 3', sans-serif" }}>
                {editingCustomId ? "Save Changes" : "Save Affirmation"}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {([["all", "All"], ["favorites", `Saved (${allFavorites.length})`], ["mine", `My Own (${customList.length})`]] as [typeof activeTab, string][]).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{ background: activeTab === tab ? "#1B3A6B" : "#F3F4F6", color: activeTab === tab ? "white" : "#6B7280", fontFamily: "'Source Sans 3', sans-serif" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Favorites */}
        {activeTab === "favorites" && (
          <div className="flex flex-col gap-2">
            {allFavorites.length === 0 ? (
              <div className="text-center py-8">
                <Heart size={32} className="text-[#D1D5DB] mx-auto mb-2" />
                <p className="text-sm text-[#9CA3AF]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>No saved affirmations yet. Tap the heart icon to save your favorites.</p>
              </div>
            ) : allFavorites.map(a => (
              <div key={a.key} className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: "#FFFBEB", border: "1.5px solid #F5D88A" }}>
                <button onClick={() => toggleFavorite(a.key)} className="mt-0.5 flex-shrink-0">
                  <Heart size={15} fill="#C9922A" className="text-[#C9922A]" />
                </button>
                <p className="text-sm text-[#2D2D2D] leading-relaxed italic flex-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>"{a.text}"</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab: My Own */}
        {activeTab === "mine" && (
          <div className="flex flex-col gap-2">
            {customList.length === 0 ? (
              <div className="text-center py-8">
                <Pencil size={32} className="text-[#D1D5DB] mx-auto mb-2" />
                <p className="text-sm text-[#9CA3AF]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>You haven't written any affirmations yet. Tap "Write Your Own" above to add one.</p>
              </div>
            ) : customList.map(c => (
              <div key={c.id} className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: "white", border: "1.5px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <button onClick={() => toggleFavorite(`custom-${c.id}`)} className="mt-0.5 flex-shrink-0">
                  <Heart size={15} fill={favorites.has(`custom-${c.id}`) ? "#C9922A" : "none"} className={favorites.has(`custom-${c.id}`) ? "text-[#C9922A]" : "text-[#D1D5DB]"} />
                </button>
                <p className="text-sm text-[#2D2D2D] leading-relaxed flex-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>"{c.text}"</p>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => handleEditCustom(c)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#EFF4FF" }}>
                    <Pencil size={12} className="text-[#1B3A6B]" />
                  </button>
                  <button onClick={() => handleDeleteCustom(c.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#FEF2F2" }}>
                    <Trash2 size={12} className="text-[#DC2626]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: All */}
        {activeTab === "all" && (
          <>
            <button
              onClick={() => setShowAll(v => !v)}
              className="w-full py-3 rounded-xl font-semibold text-sm mb-3 transition-all duration-200"
              style={{ background: showAll ? "#EFF4FF" : "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", color: showAll ? "#1B3A6B" : "white", border: showAll ? "1.5px solid #C5D5F0" : "none", fontFamily: "'Source Sans 3', sans-serif", boxShadow: showAll ? "none" : "0 4px 14px rgba(27,58,107,0.25)" }}
            >
              {showAll ? "Hide All Affirmations" : `View All ${BUILT_IN_AFFIRMATIONS.length} Affirmations`}
            </button>
            {showAll && (
              <div className="flex flex-col gap-2 fade-up">
                {BUILT_IN_AFFIRMATIONS.map((text, i) => {
                  const key = `builtin-${i}`;
                  return (
                    <div key={key} className="rounded-xl px-4 py-3 flex items-start gap-3 transition-all duration-200" style={{ background: favorites.has(key) ? "#FFFBEB" : "white", border: favorites.has(key) ? "1.5px solid #F5D88A" : "1.5px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                      <button onClick={() => toggleFavorite(key)} className="mt-0.5 flex-shrink-0 transition-transform duration-200 active:scale-125">
                        <Heart size={15} fill={favorites.has(key) ? "#C9922A" : "none"} className={favorites.has(key) ? "text-[#C9922A]" : "text-[#D1D5DB]"} />
                      </button>
                      <p className="text-sm text-[#2D2D2D] leading-relaxed flex-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>"{text}"</p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <PageFooter />
    </div>
  );
}
