"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores";

/**
 * 스토어의 theme을 <html>의 class에 반영합니다.
 * layout에서 한 번만 넣으면 전역에 적용됩니다.
 */
export function ThemeSync() {
  const theme = useAppStore(state => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return null;
}
