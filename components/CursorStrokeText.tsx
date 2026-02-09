"use client";

import { useRef, useCallback } from "react";

const RADIUS_PX = 10;
const FALLBACK = -999;

interface CursorStrokeTextProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 글자 테두리(-webkit-text-stroke)가 커서 위치 기준 반경 10px 안에서만 보이는 텍스트.
 * mousemove로 --mouse-x, --mouse-y를 갱신하고, stroke 레이어에 radial-gradient 마스크 적용.
 */
export function CursorStrokeText({ children, className = "" }: CursorStrokeTextProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--mouse-x", `${x}px`);
    el.style.setProperty("--mouse-y", `${y}px`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.style.setProperty("--mouse-x", `${FALLBACK}px`);
    el.style.setProperty("--mouse-y", `${FALLBACK}px`);
  }, []);

  /* 선명한 원: 안은 불투명, 밖은 투명 (그라데이션 없음) */
  const maskStyle = {
    mask: `radial-gradient(circle ${RADIUS_PX}px at var(--mouse-x, ${FALLBACK}px) var(--mouse-y, ${FALLBACK}px), black 0, black ${RADIUS_PX}px, transparent ${RADIUS_PX}px)`,
    WebkitMask: `radial-gradient(circle ${RADIUS_PX}px at var(--mouse-x, ${FALLBACK}px) var(--mouse-y, ${FALLBACK}px), black 0, black ${RADIUS_PX}px, transparent ${RADIUS_PX}px)`,
  };

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block ${className}`}
    >
      {/* 기본 글자 (fill) */}
      <span className="relative z-0 select-none">{children}</span>
      {/* 호버 시 커서 반경 안에서만: 스트로크 검정, 채움 흰색 */}
      <span
        className="absolute inset-0 z-10 pointer-events-none select-none"
        aria-hidden
        style={{
          WebkitTextStroke: "1px #000",
          color: "#fff",
          ...maskStyle,
        }}
      >
        {children}
      </span>
    </div>
  );
}
