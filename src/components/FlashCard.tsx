"use client";

import { useState } from "react";
import type { Flashcard } from "@/lib/types";
import { DIFFICULTY_COLORS } from "@/lib/types";

interface Props {
  card:       Flashcard;
  onMastered?: (id: string) => void;
  onLearning?: (id: string) => void;
}

type Tab = "explanation" | "code" | "breach" | "mitigations";

export default function FlashCard({ card, onMastered, onLearning }: Props) {
  const [flipped,  setFlipped]  = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("explanation");

  const tabs: { id: Tab; label: string }[] = [
    { id: "explanation", label: "Explanation" },
    { id: "code",        label: "Code" },
    { id: "breach",      label: "Real Breach" },
    { id: "mitigations", label: "Mitigations" },
  ];

  return (
    <div className="flip-container w-full" style={{ minHeight: flipped ? "auto" : "280px" }}>
      <div className={`flip-inner ${flipped ? "flipped" : ""}`} style={{ minHeight: "280px" }}>

        {/* ── FRONT ─────────────────────────────────────── */}
        <div className="flip-front w-full">
          <div
            onClick={() => setFlipped(true)}
            className="bg-[#12121f] border border-[#2a2a45] hover:border-cyan-400/40 rounded-2xl p-6 cursor-pointer transition-all select-none"
            style={{ minHeight: "280px" }}
          >
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-mono text-cyan-400/70">{card.owasp_id}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[card.difficulty]}`}>
                {card.difficulty}
              </span>
              {card.tags.slice(0, 3).map((t) => (
                <span key={t} className="text-xs text-slate-500 bg-[#0a0a14] px-2 py-0.5 rounded-full">
                  {t}
                </span>
              ))}
            </div>

            {/* Topic */}
            <div className="text-xs text-slate-500 mb-2">{card.topic}</div>

            {/* Question */}
            <p className="text-lg font-medium text-slate-100 leading-relaxed mb-6">
              {card.question}
            </p>

            {/* Tap hint */}
            <div className="flex items-center gap-2 text-slate-500 text-sm mt-auto">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
              </svg>
              Tap to reveal answer
            </div>
          </div>
        </div>

        {/* ── BACK ──────────────────────────────────────── */}
        <div className="flip-back w-full">
          <div className="bg-[#12121f] border border-cyan-400/30 rounded-2xl overflow-hidden">

            {/* Short answer bar */}
            <div className="bg-cyan-400/5 border-b border-cyan-400/20 px-6 py-4">
              <div className="text-xs text-cyan-400/60 mb-1 font-mono">ANSWER</div>
              <p className="text-slate-100 font-medium leading-relaxed">{card.short_answer}</p>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-[#2a2a45] px-4">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === t.id
                      ? "border-cyan-400 text-cyan-400"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === "explanation" && (
                <p className="text-slate-300 text-sm leading-relaxed">{card.explanation}</p>
              )}

              {activeTab === "code" && card.code_example && (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-red-400 font-mono mb-1">❌ VULNERABLE ({card.code_example.language})</div>
                    <pre className="text-red-300/80">{card.code_example.vulnerable}</pre>
                  </div>
                  <div>
                    <div className="text-xs text-green-400 font-mono mb-1">✓ SECURE</div>
                    <pre className="text-green-300/80">{card.code_example.secure}</pre>
                  </div>
                  {card.code_example.notes && (
                    <p className="text-slate-400 text-xs leading-relaxed border-l-2 border-cyan-400/30 pl-3">
                      {card.code_example.notes}
                    </p>
                  )}
                </div>
              )}

              {activeTab === "breach" && card.real_world_example && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">{card.real_world_example.incident}</span>
                    <span className="text-xs bg-[#0a0a14] text-slate-400 px-2 py-0.5 rounded">{card.real_world_example.year}</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{card.real_world_example.description}</p>
                  <div className="bg-red-400/5 border border-red-400/20 rounded-lg p-3">
                    <div className="text-xs text-red-400 font-mono mb-1">IMPACT</div>
                    <p className="text-slate-300 text-sm">{card.real_world_example.impact}</p>
                  </div>
                </div>
              )}

              {activeTab === "mitigations" && (
                <ul className="space-y-2">
                  {card.mitigation.map((m, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-300">
                      <span className="text-cyan-400 shrink-0 mt-0.5">→</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 px-6 pb-5">
              <button
                onClick={() => { setFlipped(false); setActiveTab("explanation"); }}
                className="flex-1 py-2 text-sm border border-[#2a2a45] hover:border-slate-500 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                ← Flip back
              </button>
              {onLearning && (
                <button onClick={() => onLearning(card.id)}
                  className="flex-1 py-2 text-sm bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 rounded-lg transition-colors">
                  Still learning
                </button>
              )}
              {onMastered && (
                <button onClick={() => onMastered(card.id)}
                  className="flex-1 py-2 text-sm bg-green-400/10 hover:bg-green-400/20 border border-green-400/30 text-green-400 rounded-lg transition-colors">
                  Mastered ✓
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
