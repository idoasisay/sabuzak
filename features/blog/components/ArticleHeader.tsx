"use client";

import Link from "next/link";
import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BlogScrollContext } from "./BlogMain";

/** Show thin bar when scrolled past this (px). Full header scrolls away with content. */
const THIN_BAR_THRESHOLD = 80;
const THIN_BAR_HEIGHT = 40;
/** Hysteresis: hide thin bar when back above this (avoids jitter) */
const HIDE_THRESHOLD = 40;

type ArticleHeaderTag = { id: string; slug: string; name: string };

type ArticleHeaderProps = {
  title: string;
  dateString: string;
  tags: ArticleHeaderTag[];
};

export function ArticleHeader({ title, dateString, tags }: ArticleHeaderProps) {
  const [showThin, setShowThin] = useState(false);
  const [barRect, setBarRect] = useState<{ left: number; width: number } | null>(null);
  const lastYRef = useRef(0);
  const scrollEl = useContext(BlogScrollContext);

  useLayoutEffect(() => {
    const el = scrollEl;
    if (!showThin || !el) return;
    function updateRect() {
      if (!el) return;
      const r = el.getBoundingClientRect();
      setBarRect({ left: r.left, width: r.width });
    }
    updateRect();
    const ro = new ResizeObserver(updateRect);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showThin, scrollEl]);

  useEffect(() => {
    const el = scrollEl ?? (typeof window !== "undefined" ? window : null);
    if (!el) return;

    let rafId: number | null = null;

    function handleScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const y = el === window ? window.scrollY : (el as HTMLDivElement).scrollTop;
        const lastY = lastYRef.current;

        if (showThin) {
          if (y <= HIDE_THRESHOLD) setShowThin(false);
          else if (y < lastY && y <= THIN_BAR_THRESHOLD) setShowThin(false);
        } else {
          if (y > THIN_BAR_THRESHOLD) setShowThin(true);
        }
        lastYRef.current = y;
      });
    }

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [showThin, scrollEl]);

  return (
    <>
      {/* Fixed thin bar: stays at top of viewport so it doesn't shrink at scroll end */}
      <div
        className="fixed z-10 flex items-center justify-center bg-chart-2/10 backdrop-blur-md border-b border-border transition-[height,opacity] duration-200 ease-out"
        style={{
          top: 0,
          left: barRect?.left ?? 0,
          width: barRect?.width ?? "100%",
          height: showThin ? THIN_BAR_HEIGHT : 0,
          opacity: showThin ? 1 : 0,
          minHeight: 0,
          pointerEvents: showThin ? "auto" : "none",
        }}
        aria-hidden={!showThin}
      >
        <span className="text-base font-semibold text-foreground truncate max-w-full px-4 py-3">{title}</span>
      </div>

      {/* Full header: in flow, scrolls up with the page. -mt-px removes top hairline */}
      <div className="-mt-px border-b border-border py-8 px-4 max-h-[114px] text-center flex flex-col items-center justify-center bg-linear-0 to-chart-2/10">
        <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dateString}</p>
        {tags.length > 0 && (
          <ul className="mt-2 flex flex-wrap justify-center gap-2">
            {tags.map(tag => (
              <li key={tag.id}>
                <Link
                  href={`/blog?tag=${encodeURIComponent(tag.slug)}`}
                  className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
