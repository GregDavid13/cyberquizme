"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Flashcard } from "@/lib/types";
import { OWASP_CATEGORIES, DIFFICULTY_COLORS } from "@/lib/types";

type QuizState = "setup" | "question" | "feedback" | "results";

interface Question {
  card:     Flashcard;
  choices:  string[];
  correct:  number;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestion(card: Flashcard, allCards: Flashcard[]): Question {
  const distractors = shuffle(allCards.filter((c) => c.id !== card.id))
    .slice(0, 3)
    .map((c) => c.short_answer);
  const choices = shuffle([card.short_answer, ...distractors]);
  return { card, choices, correct: choices.indexOf(card.short_answer) };
}

export default function QuizPage() {
  const supabase = createClient();

  const [allCards,   setAllCards]   = useState<Flashcard[]>([]);
  const [state,      setState]      = useState<QuizState>("setup");
  const [category,   setCategory]   = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [qCount,     setQCount]     = useState(10);
  const [questions,  setQuestions]  = useState<Question[]>([]);
  const [qIndex,     setQIndex]     = useState(0);
  const [selected,   setSelected]   = useState<number | null>(null);
  const [score,      setScore]      = useState(0);
  const [answers,    setAnswers]    = useState<boolean[]>([]);

  useEffect(() => {
    supabase.from("flashcards").select("*").then(({ data }) => {
      setAllCards((data as Flashcard[]) ?? []);
    });
  }, []);

  function startQuiz() {
    let pool = [...allCards];
    if (category   !== "all") pool = pool.filter((c) => c.owasp_id === category);
    if (difficulty !== "all") pool = pool.filter((c) => c.difficulty === difficulty);
    if (pool.length < 4) return alert("Not enough cards for the selected filters. Need at least 4.");

    const picked = shuffle(pool).slice(0, Math.min(qCount, pool.length));
    setQuestions(picked.map((c) => buildQuestion(c, allCards)));
    setQIndex(0); setScore(0); setAnswers([]); setSelected(null);
    setState("question");
  }

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === questions[qIndex].correct;
    setAnswers((prev) => [...prev, correct]);
    if (correct) setScore((s) => s + 1);
    setState("feedback");
  }

  function next() {
    setSelected(null);
    if (qIndex + 1 >= questions.length) {
      setState("results");
    } else {
      setQIndex((i) => i + 1);
      setState("question");
    }
  }

  // ── SETUP ──────────────────────────────────────────────────
  if (state === "setup") return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Quiz Mode</h1>
      <p className="text-slate-400 text-sm mb-8">
        Multiple-choice questions drawn from your flashcard deck. Full explanations shown after each answer.
      </p>

      <div className="bg-[#12121f] border border-[#2a2a45] rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#0a0a14] border border-[#2a2a45] rounded-lg px-3 py-2 text-sm text-slate-300 outline-none">
            <option value="all">All categories</option>
            {OWASP_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.id.split(":")[0]} — {c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Difficulty</label>
          <div className="flex gap-2">
            {["all", "beginner", "intermediate", "advanced"].map((d) => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 text-xs rounded-lg border transition-colors capitalize ${
                  difficulty === d
                    ? "bg-cyan-400/10 border-cyan-400/50 text-cyan-400"
                    : "border-[#2a2a45] text-slate-400 hover:text-white"
                }`}>
                {d === "all" ? "All" : d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Number of questions: {qCount}</label>
          <input type="range" min={5} max={Math.min(allCards.length, 30)} value={qCount}
            onChange={(e) => setQCount(Number(e.target.value))}
            className="w-full accent-cyan-400" />
          <div className="flex justify-between text-xs text-slate-500 mt-1"><span>5</span><span>30</span></div>
        </div>

        <button onClick={startQuiz}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors">
          Start Quiz
        </button>
      </div>
    </div>
  );

  // ── RESULTS ────────────────────────────────────────────────
  if (state === "results") {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 90 ? "🏆 Excellent" : pct >= 70 ? "✅ Good" : pct >= 50 ? "📚 Keep studying" : "❌ Needs work";
    return (
      <div className="max-w-md mx-auto text-center animate-[slideUp_0.3s_ease-out]">
        <div className="bg-[#12121f] border border-[#2a2a45] rounded-2xl p-8">
          <div className="text-5xl font-bold mb-2"
            style={{ color: pct >= 70 ? "#00ff88" : pct >= 50 ? "#ffd700" : "#ff4757" }}>
            {pct}%
          </div>
          <div className="text-xl font-semibold text-white mb-1">{grade}</div>
          <p className="text-slate-400 text-sm mb-6">{score} / {questions.length} correct</p>

          <div className="flex gap-2">
            <button onClick={startQuiz}
              className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors text-sm">
              Retry
            </button>
            <button onClick={() => setState("setup")}
              className="flex-1 py-2.5 border border-[#2a2a45] hover:border-slate-500 text-slate-300 rounded-lg transition-colors text-sm">
              New quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── QUESTION / FEEDBACK ────────────────────────────────────
  const q = questions[qIndex];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4 text-sm text-slate-400">
        <span>{qIndex + 1} / {questions.length}</span>
        <span className="text-green-400 font-medium">{score} correct</span>
      </div>
      <div className="w-full bg-[#2a2a45] rounded-full h-1.5 mb-6">
        <div className="bg-cyan-400 h-1.5 rounded-full transition-all"
          style={{ width: `${((qIndex) / questions.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div className="bg-[#12121f] border border-[#2a2a45] rounded-2xl p-6 mb-4">
        <div className="flex gap-2 mb-3">
          <span className="text-xs font-mono text-cyan-400/70">{q.card.owasp_id}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[q.card.difficulty]}`}>
            {q.card.difficulty}
          </span>
        </div>
        <p className="text-lg font-medium text-slate-100 leading-relaxed">{q.card.question}</p>
      </div>

      {/* Choices */}
      <div className="space-y-2 mb-6">
        {q.choices.map((choice, idx) => {
          let style = "border-[#2a2a45] text-slate-300 hover:border-cyan-400/50 hover:text-white";
          if (selected !== null) {
            if (idx === q.correct) style = "border-green-400 bg-green-400/10 text-green-300";
            else if (idx === selected && idx !== q.correct) style = "border-red-400 bg-red-400/10 text-red-300";
            else style = "border-[#2a2a45] text-slate-500 opacity-50";
          }
          return (
            <button key={idx} onClick={() => handleAnswer(idx)}
              className={`w-full text-left p-4 bg-[#12121f] border rounded-xl text-sm leading-relaxed transition-all ${style} ${
                selected !== null ? "cursor-default" : "cursor-pointer"
              }`}>
              <span className="font-mono text-xs opacity-60 mr-2">{String.fromCharCode(65 + idx)}.</span>
              {choice}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {state === "feedback" && (
        <div className="bg-[#12121f] border border-[#2a2a45] rounded-xl p-5 mb-4 animate-[slideUp_0.3s_ease-out]">
          <div className={`text-sm font-semibold mb-2 ${selected === q.correct ? "text-green-400" : "text-red-400"}`}>
            {selected === q.correct ? "✓ Correct!" : "✗ Incorrect"}
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">{q.card.explanation}</p>
          {q.card.real_world_example && (
            <div className="text-xs text-slate-500 border-l-2 border-cyan-400/30 pl-3">
              <span className="text-cyan-400/70">Real world: </span>
              {q.card.real_world_example.incident} ({q.card.real_world_example.year})
            </div>
          )}
        </div>
      )}

      {state === "feedback" && (
        <button onClick={next}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors">
          {qIndex + 1 >= questions.length ? "See results →" : "Next question →"}
        </button>
      )}
    </div>
  );
}
