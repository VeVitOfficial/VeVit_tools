"use client";

import Link from "next/link";
import { Box } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuthStore } from "@/store/authStore";

export default function Header() {
  const { isLoggedIn } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 border-b glass">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-500 to-sky-500">
            <Box className="text-white w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight">VeVit</span>
            <span className="text-sm font-medium px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400">
              Tools
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isLoggedIn ? (
            <button
              onClick={() => useAuthStore.getState().logout()}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Odhlásit
            </button>
          ) : (
            <a
              href="https://account.vevit.fun/login"
              className="text-sm font-medium px-4 py-2 rounded-lg border border-border hover:border-primary/50 hover:text-primary transition-colors"
            >
              Přihlásit se
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
