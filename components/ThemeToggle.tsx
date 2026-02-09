"use client";

import { useAppStore } from "@/stores";

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <button type="button" onClick={toggleTheme} aria-label="테마 전환">
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
