"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type Point = { x: number; y: number };

export function BlogSelectionBox({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);
  const [start, setStart] = useState<Point | null>(null);
  const [current, setCurrent] = useState<Point | null>(null);

  const getRelativePoint = useCallback((e: { clientX: number; clientY: number }): Point => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      const p = getRelativePoint(e);
      isSelectingRef.current = true;
      setStart(p);
      setCurrent(p);
    },
    [getRelativePoint]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelectingRef.current) return;
      setCurrent(getRelativePoint(e));
    },
    [getRelativePoint]
  );

  const clearSelection = useCallback(() => {
    isSelectingRef.current = false;
    setStart(null);
    setCurrent(null);
  }, []);

  const handleMouseUp = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  useEffect(() => {
    const onWindowMouseUp = () => {
      if (isSelectingRef.current) clearSelection();
    };
    window.addEventListener("mouseup", onWindowMouseUp);
    return () => window.removeEventListener("mouseup", onWindowMouseUp);
  }, [clearSelection]);

  useEffect(() => {
    const onWindowMouseMove = (e: MouseEvent) => {
      if (!isSelectingRef.current) return;
      setCurrent(getRelativePoint(e));
    };
    window.addEventListener("mousemove", onWindowMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onWindowMouseMove);
  }, [getRelativePoint]);

  let boxStyle: React.CSSProperties | null = null;
  if (start && current && (start.x !== current.x || start.y !== current.y)) {
    const left = Math.min(start.x, current.x);
    const top = Math.min(start.y, current.y);
    const width = Math.abs(current.x - start.x);
    const height = Math.abs(current.y - start.y);
    boxStyle = {
      position: "absolute",
      left,
      top,
      width,
      height,
      background: "hsl(211 100% 45% / 0.10)",
      pointerEvents: "none",
      zIndex: 10,
    };
  }

  return (
    <div
      ref={containerRef}
      className="blog-selection-box relative flex h-screen min-h-0 overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {children}
      {boxStyle && <div style={boxStyle} aria-hidden />}
    </div>
  );
}
