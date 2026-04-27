#!/usr/bin/env bash
# ============================================================
# CyberQuizMe — Initial GitHub push script
# Run this ONCE from inside the cyberquizme/ directory
# ============================================================
set -e

REPO="https://github.com/GregDavid13/cyberquizme.git"
BRANCH="main"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║       CyberQuizMe — GitHub Setup         ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. Check we're in the right place ────────────────────
if [ ! -f "package.json" ]; then
  echo "❌  Run this script from inside the cyberquizme/ directory."
  exit 1
fi

# ── 2. Check Node is available ───────────────────────────
if ! command -v node &>/dev/null; then
  echo "❌  Node.js not found. Install from https://nodejs.org"
  exit 1
fi
echo "✓  Node $(node -v) detected"

# ── 3. Install dependencies ───────────────────────────────
echo ""
echo "📦  Installing npm dependencies…"
npm install
echo "✓  Dependencies installed"

# ── 4. Set up .env.local ─────────────────────────────────
if [ ! -f ".env.local" ]; then
  cp .env.local.example .env.local
  echo ""
  echo "⚠️   .env.local created from example."
  echo "    Open it and fill in your Supabase URL and keys before seeding."
  echo "    Keys are at: Supabase Dashboard → Settings → API"
  echo ""
else
  echo "✓  .env.local already exists"
fi

# ── 5. Git init + push ───────────────────────────────────
echo ""
echo "🔧  Initialising git repository…"

if [ -d ".git" ]; then
  echo "    (git already initialised — skipping init)"
else
  git init
fi

git add .
git commit -m "feat: initial CyberQuizMe scaffolding

- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase Auth (email/password)
- Flashcard viewer with flip animation, category/difficulty filters
- Quiz mode with multiple-choice, scoring, and explanations
- Admin page for uploading new card JSON sets
- Supabase migration SQL (supabase/migrations/001_schema.sql)
- Seed script (npm run seed) to load flashcards_owasp_top10.json"

git branch -M $BRANCH

if git remote get-url origin &>/dev/null; then
  echo "    (remote 'origin' already set)"
else
  git remote add origin $REPO
fi

echo ""
echo "🚀  Pushing to GitHub…"
git push -u origin $BRANCH

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║              ✅  Done!                   ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "  1. Open Supabase → SQL Editor and run:"
echo "       supabase/migrations/001_schema.sql"
echo ""
echo "  2. Fill in .env.local with your Supabase keys"
echo ""
echo "  3. Seed the flashcards:"
echo "       npm run seed"
echo ""
echo "  4. Run locally:"
echo "       npm run dev   →  http://localhost:3000"
echo ""
echo "  5. In Vercel — add environment variables:"
echo "       NEXT_PUBLIC_SUPABASE_URL"
echo "       NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "       (Supabase Dashboard → Settings → API)"
echo ""
echo "  6. In Supabase → Authentication → URL Configuration:"
echo "       Site URL:         https://your-vercel-url.vercel.app"
echo "       Redirect URL:     https://your-vercel-url.vercel.app/auth/callback"
echo ""
