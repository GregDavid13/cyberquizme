import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Explicit type required — TypeScript strict mode can't infer cookiesToSet
// from @supabase/ssr's generic context in Next.js 14 App Router
type CookieToSet = {
  name: string;
  value: string;
  options?: {
    path?: string;
    maxAge?: number;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "strict" | "lax" | "none" | boolean;
    expires?: Date | number;
    priority?: "low" | "medium" | "high";
  };
};

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore.
            // Middleware keeps the session refreshed.
          }
        },
      },
    }
  );
}
