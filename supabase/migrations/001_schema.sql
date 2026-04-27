-- ============================================================
-- CyberQuizMe — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. Flashcards ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flashcards (
  id               TEXT        PRIMARY KEY,          -- e.g. "A01-001"
  owasp_id         TEXT        NOT NULL,             -- e.g. "A01:2021"
  category         TEXT        NOT NULL,
  topic            TEXT        NOT NULL,
  difficulty       TEXT        NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags             TEXT[]      DEFAULT '{}',
  question         TEXT        NOT NULL,
  short_answer     TEXT        NOT NULL,
  explanation      TEXT        NOT NULL,
  real_world_example JSONB     DEFAULT '{}',
  code_example     JSONB       DEFAULT '{}',
  mitigation       TEXT[]      DEFAULT '{}',
  resource_links   TEXT[]      DEFAULT '{}',  -- renamed: 'references' is a reserved word in PostgreSQL
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. User Progress (per-card, per-user) ─────────────────
CREATE TABLE IF NOT EXISTS user_progress (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id        TEXT        NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  status         TEXT        NOT NULL DEFAULT 'unseen'
                               CHECK (status IN ('unseen', 'learning', 'mastered')),
  correct_count  INT         NOT NULL DEFAULT 0,
  attempt_count  INT         NOT NULL DEFAULT 0,
  last_seen      TIMESTAMPTZ,
  UNIQUE (user_id, card_id)
);

-- ── 3. Quiz Sessions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_filter   TEXT,
  difficulty_filter TEXT,
  score             INT         NOT NULL DEFAULT 0,
  total_questions   INT         NOT NULL DEFAULT 0,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. Row Level Security ─────────────────────────────────

-- Flashcards: public read, only service role can write
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flashcards_public_read"
  ON flashcards FOR SELECT USING (true);

-- User progress: users can only see/modify their own rows
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_progress_owner"
  ON user_progress USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Quiz sessions: users can only see/modify their own rows
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_sessions_owner"
  ON quiz_sessions USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 5. Indexes ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_flashcards_owasp_id    ON flashcards(owasp_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_difficulty  ON flashcards(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id  ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id  ON quiz_sessions(user_id);

-- ── Done ──────────────────────────────────────────────────
-- After running this, go back to your terminal and run:
--   cp .env.local.example .env.local   # then fill in your keys
--   npm run seed                        # loads flashcards into the table
