"use client";

import { useAppStore } from "@/stores";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <button type="button" onClick={toggleTheme} aria-label="테마 전환">
      {theme === "light" ? (
        <Moon size={20} className="text-muted-foreground/70" />
      ) : (
        <Sun size={20} className="text-muted-foreground/70" />
      )}
    </button>
  );
}
