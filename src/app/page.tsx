import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OWASP_CATEGORIES } from "@/lib/types";

export default async function HomePage() {
  const supabase = createClient();

  // Card counts per category
  const { data: cards } = await supabase
    .from("flashcards")
    .select("owasp_id, difficulty");

  const total = cards?.length ?? 0;
  const byCat = OWASP_CATEGORIES.map((cat) => ({
    ...cat,
    count: cards?.filter((c) => c.owasp_id === cat.id).length ?? 0,
  }));

  const difficulties = {
    beginner:     cards?.filter((c) => c.difficulty === "beginner").length ?? 0,
    intermediate: cards?.filter((c) => c.difficulty === "intermediate").length ?? 0,
    advanced:     cards?.filter((c) => c.difficulty === "advanced").length ?? 0,
  };

  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      {/* Hero */}
      <div className="text-center mb-12 pt-4">
        <div className="inline-block text-xs font-mono bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 px-3 py-1 rounded-full mb-4">
          OWASP Top 10 · 2021
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-white">Cyber</span>
          <span className="text-cyan-400">Quiz</span>
          <span className="text-white">Me</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
          Master web application security through deep-dive flashcards and randomised tests.
          Real breaches. Real code. Real understanding.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/flashcards"
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors">
            Browse Flashcards
          </Link>
          <Link href="/quiz"
            className="px-6 py-3 bg-[#1a1a2e] hover:bg-[#2a2a45] border border-[#2a2a45] text-white font-semibold rounded-lg transition-colors">
            Start a Quiz
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Cards",   value: total,                    color: "text-cyan-400" },
          { label: "Beginner",      value: difficulties.beginner,    color: "text-green-400" },
          { label: "Intermediate",  value: difficulties.intermediate, color: "text-yellow-400" },
          { label: "Advanced",      value: difficulties.advanced,     color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#12121f] border border-[#2a2a45] rounded-xl p-4 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category grid */}
      <h2 className="text-xl font-semibold text-slate-200 mb-4">Browse by Category</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {byCat.map((cat, i) => (
          <Link key={cat.id}
            href={`/flashcards?category=${encodeURIComponent(cat.id)}`}
            className="bg-[#12121f] border border-[#2a2a45] hover:border-cyan-400/50 rounded-xl p-4 transition-all group">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-mono text-cyan-400/70">{cat.id.split(":")[0]}</span>
              <span className="text-xs bg-[#0a0a14] text-slate-400 px-2 py-0.5 rounded-full">
                {cat.count} cards
              </span>
            </div>
            <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
              {cat.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
