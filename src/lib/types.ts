export interface RealWorldExample {
  incident:    string;
  year:        number;
  description: string;
  impact:      string;
}

export interface CodeExample {
  language:   string;
  vulnerable: string;
  secure:     string;
  notes:      string;
}

export interface Flashcard {
  id:                  string;
  owasp_id:            string;
  category:            string;
  topic:               string;
  difficulty:          "beginner" | "intermediate" | "advanced";
  tags:                string[];
  question:            string;
  short_answer:        string;
  explanation:         string;
  real_world_example:  RealWorldExample;
  code_example:        CodeExample;
  mitigation:          string[];
  references:          string[];
  created_at?:         string;
}

export interface UserProgress {
  id:            string;
  user_id:       string;
  card_id:       string;
  status:        "unseen" | "learning" | "mastered";
  correct_count: number;
  attempt_count: number;
  last_seen?:    string;
}

export interface QuizSession {
  id:                string;
  user_id:           string;
  category_filter?:  string;
  difficulty_filter?: string;
  score:             number;
  total_questions:   number;
  completed_at?:     string;
  created_at:        string;
}

export type Difficulty = "beginner" | "intermediate" | "advanced";

export const OWASP_CATEGORIES = [
  { id: "A01:2021", label: "Broken Access Control" },
  { id: "A02:2021", label: "Cryptographic Failures" },
  { id: "A03:2021", label: "Injection" },
  { id: "A04:2021", label: "Insecure Design" },
  { id: "A05:2021", label: "Security Misconfiguration" },
  { id: "A06:2021", label: "Vulnerable Components" },
  { id: "A07:2021", label: "Auth Failures" },
  { id: "A08:2021", label: "Integrity Failures" },
  { id: "A09:2021", label: "Logging Failures" },
  { id: "A10:2021", label: "SSRF" },
] as const;

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner:     "text-green-400 bg-green-400/10 border-green-400/30",
  intermediate: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  advanced:     "text-red-400 bg-red-400/10 border-red-400/30",
};
