"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/",           label: "Home" },
    { href: "/flashcards", label: "Flashcards" },
    { href: "/quiz",       label: "Quiz" },
    ...(user ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <nav className="border-b border-[#2a2a45] bg-[#0a0a14]/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg">
          <span className="text-white">Cyber</span>
          <span className="text-cyan-400">Quiz</span>
          <span className="text-white">Me</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === l.href
                  ? "bg-cyan-400/10 text-cyan-400"
                  : "text-slate-400 hover:text-white hover:bg-[#1a1a2e]"
              }`}>
              {l.label}
            </Link>
          ))}

          {user ? (
            <button onClick={signOut}
              className="ml-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-[#1a1a2e] rounded-lg transition-colors">
              Sign out
            </button>
          ) : (
            <Link href="/auth/login"
              className="ml-2 px-3 py-1.5 text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
