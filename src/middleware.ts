import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Explicit type required — TypeScript strict mode can't infer cookiesToSet
// from @supabase/ssr's generic context
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

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /admin — redirect unauthenticated users to login
  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(
      new URL("/auth/login?next=/admin", request.url)
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/auth/callback"],
};
