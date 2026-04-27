"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Flashcard } from "@/lib/types";

export default function AdminPage() {
  const supabase = createClient();
  const [json,    setJson]    = useState("");
  const [status,  setStatus]  = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [stats,   setStats]   = useState<{ total: number; byCategory: Record<string, number> } | null>(null);

  useEffect(() => {
    supabase.from("flashcards").select("owasp_id").then(({ data }) => {
      if (!data) return;
      const byCategory: Record<string, number> = {};
      data.forEach((c) => { byCategory[c.owasp_id] = (byCategory[c.owasp_id] ?? 0) + 1; });
      setStats({ total: data.length, byCategory });
    });
  }, [status]);

  async function handleUpload() {
    setStatus("loading");
    setMessage("");
    try {
      const parsed = JSON.parse(json);
      const cards: Flashcard[] = Array.isArray(parsed) ? parsed : parsed.cards;
      if (!cards?.length) throw new Error("No cards found in JSON. Expected { cards: [...] } or [...]");

      // Validate required fields on first card
      const required = ["id", "owasp_id", "category", "topic", "difficulty", "question", "short_answer", "explanation"];
      const missing = required.filter((f) => !(f in cards[0]));
      if (missing.length) throw new Error(`Missing required fields: ${missing.join(", ")}`);

      // Upsert in batches of 50
      const BATCH = 50;
      let upserted = 0;
      for (let i = 0; i < cards.length; i += BATCH) {
        const { error } = await supabase
          .from("flashcards")
          .upsert(cards.slice(i, i + BATCH), { onConflict: "id" });
        if (error) throw new Error(error.message);
        upserted += Math.min(BATCH, cards.length - i);
      }

      setStatus("success");
      setMessage(`✓ ${upserted} cards uploaded successfully.`);
      setJson("");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Admin — Card Uploader</h1>
        <p className="text-slate-400 text-sm">
          Paste a flashcard JSON file to upsert cards into Supabase. Existing cards with the same ID will be updated.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="bg-[#12121f] border border-[#2a2a45] rounded-xl p-5 mb-6">
          <div className="text-sm font-medium text-slate-300 mb-3">Current database: {stats.total} cards</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byCategory).sort().map(([cat, count]) => (
              <span key={cat} className="text-xs bg-[#0a0a14] border border-[#2a2a45] text-slate-400 px-2 py-1 rounded">
                {cat.split(":")[0]}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* JSON input */}
      <div className="bg-[#12121f] border border-[#2a2a45] rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Paste flashcard JSON ({`{ "cards": [...] }`} or a raw array)
          </label>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            rows={16}
            className="w-full bg-[#0a0a14] border border-[#2a2a45] focus:border-cyan-400 rounded-lg p-3 text-xs font-mono text-slate-300 outline-none resize-none"
            placeholder={'{\n  "cards": [\n    {\n      "id": "A01-001",\n      "owasp_id": "A01:2021",\n      ...\n    }\n  ]\n}'}
          />
        </div>

        {message && (
          <div className={`text-sm p-3 rounded-lg ${
            status === "success" ? "bg-green-400/10 text-green-400 border border-green-400/30"
                                 : "bg-red-400/10 text-red-400 border border-red-400/30"
          }`}>
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleUpload} disabled={!json.trim() || status === "loading"}
            className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-semibold rounded-lg transition-colors text-sm">
            {status === "loading" ? "Uploading…" : "Upload to Supabase"}
          </button>
          <button onClick={() => { setJson(""); setStatus("idle"); setMessage(""); }}
            className="px-4 py-2.5 border border-[#2a2a45] hover:border-slate-500 text-slate-400 hover:text-white rounded-lg transition-colors text-sm">
            Clear
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Cards are upserted on <code className="text-cyan-400/70">id</code> — uploading the same set twice is safe.
        </p>
      </div>
    </div>
  );
}
