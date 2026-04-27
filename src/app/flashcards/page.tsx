"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import FlashCard from "@/components/FlashCard";
import type { Flashcard } from "@/lib/types";
import { OWASP_CATEGORIES } from "@/lib/types";

export default function FlashcardsPage() {
  const supabase = createClient();

  const [cards,      setCards]      = useState<Flashcard[]>([]);
  const [filtered,   setFiltered]   = useState<Flashcard[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [category,   setCategory]   = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [search,     setSearch]     = useState("");
  const [userId,     setUserId]     = useState<string | null>(null);

  // Load cards + current user
  useEffect(() => {
    async function load() {
      const [{ data: cardsData }, { data: { user } }] = await Promise.all([
        supabase.from("flashcards").select("*").order("id"),
        supabase.auth.getUser(),
      ]);
      setCards((cardsData as Flashcard[]) ?? []);
      setUserId(user?.id ?? null);
      setLoading(false);
    }
    load();

    // Check URL params for category filter
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setCategory(cat);
  }, []);

  // Filter
  useEffect(() => {
    let f = [...cards];
    if (category   !== "all") f = f.filter((c) => c.owasp_id === category);
    if (difficulty !== "all") f = f.filter((c) => c.difficulty === difficulty);
    if (search.trim())        f = f.filter((c) =>
      c.question.toLowerCase().includes(search.toLowerCase()) ||
      c.topic.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );
    setFiltered(f);
  }, [cards, category, difficulty, search]);

  const updateProgress = useCallback(async (cardId: string, status: "learning" | "mastered") => {
    if (!userId) return;
    await supabase.from("user_progress").upsert(
      { user_id: userId, card_id: cardId, status, last_seen: new Date().toISOString() },
      { onConflict: "user_id,card_id" }
    );
  }, [userId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Flashcards</h1>
        <p className="text-slate-400 text-sm">{filtered.length} of {cards.length} cards</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text" placeholder="Search cards…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-[#12121f] border border-[#2a2a45] focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="bg-[#12121f] border border-[#2a2a45] rounded-lg px-3 py-2 text-sm text-slate-300 outline-none">
          <option value="all">All categories</option>
          {OWASP_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.id.split(":")[0]} — {c.label}</option>
          ))}
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
          className="bg-[#12121f] border border-[#2a2a45] rounded-lg px-3 py-2 text-sm text-slate-300 outline-none">
          <option value="all">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          No cards match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((card) => (
            <FlashCard
              key={card.id}
              card={card}
              onMastered={(id) => updateProgress(id, "mastered")}
              onLearning={(id) => updateProgress(id, "learning")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
