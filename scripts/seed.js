#!/usr/bin/env node
/**
 * seed.js — loads flashcards_owasp_top10.json into Supabase
 *
 * Usage:
 *   npm run seed
 *
 * Requirements:
 *   - .env.local must contain NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   - Run `npm run seed` from the cyberquizme project root
 *   - The JSON file must be at: ../flashcards_owasp_top10.json
 *     (i.e. one directory up from the project root, in your Learning Cyber folder)
 *
 * To seed a different JSON file:
 *   CARDS_FILE=/path/to/your/cards.json npm run seed
 */

const fs   = require("fs");
const path = require("path");

// ── Load env from .env.local ──────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌  .env.local not found. Copy .env.local.example and fill in your keys.");
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
}
loadEnv();

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// ── Load the flashcard JSON ───────────────────────────────────────────
const CARDS_FILE = process.env.CARDS_FILE ||
  path.join(__dirname, "..", "..", "flashcards_owasp_top10.json");

if (!fs.existsSync(CARDS_FILE)) {
  console.error(`❌  Flashcard file not found at: ${CARDS_FILE}`);
  console.error("    Set CARDS_FILE=/path/to/your/cards.json to override.");
  process.exit(1);
}

const { cards } = JSON.parse(fs.readFileSync(CARDS_FILE, "utf8"));
console.log(`📦  Loaded ${cards.length} cards from ${path.basename(CARDS_FILE)}`);

// ── Upsert into Supabase ──────────────────────────────────────────────
async function seed() {
  const BATCH = 50;

  for (let i = 0; i < cards.length; i += BATCH) {
    const batch = cards.slice(i, i + BATCH);

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/flashcards`,
      {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "apikey":         SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
          "Prefer":        "resolution=merge-duplicates",  // upsert on PK
        },
        body: JSON.stringify(batch),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error(`❌  Batch ${i / BATCH + 1} failed:`, err);
      process.exit(1);
    }

    console.log(`✓   Seeded cards ${i + 1}–${Math.min(i + BATCH, cards.length)}`);
  }

  console.log(`\n✅  Done — ${cards.length} flashcards loaded into Supabase.`);
  console.log("    Cards are now available at your Supabase Dashboard → Table Editor → flashcards");
}

seed().catch((err) => {
  console.error("❌  Unexpected error:", err);
  process.exit(1);
});
