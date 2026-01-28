"use client";

import { useAppStore } from "@/stores";

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground"
      aria-label="테마 전환"
    >
      현재: {theme} (클릭 시 전환)
    </button>
  );
}
