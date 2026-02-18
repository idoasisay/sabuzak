"use client";

import { createContext, useState, useCallback, type ReactNode } from "react";

export const BlogScrollContext = createContext<HTMLDivElement | null>(null);

type BlogMainProps = { children: ReactNode };

export function BlogMain({ children }: BlogMainProps) {
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const mainRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setScrollEl(el);
  }, []);

  return (
    <BlogScrollContext.Provider value={scrollEl}>
      <main ref={mainRef} className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </BlogScrollContext.Provider>
  );
}
