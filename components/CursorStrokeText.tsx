"use client";

import { useRef, useCallback } from "react";

/** 마우스가 영역 밖일 때 마스크 원을 화면 밖으로 보내기 위한 오프셋(px) */
const MOUSE_OUT_OF_BOUNDS_PX = -999;

const DEFAULT_SPOTLIGHT_RADIUS_PX = 10;

interface CursorStrokeTextProps {
  children: React.ReactNode;
  className?: string;
  /** 스트로크가 보이는 원의 반경(px). 기본 10. */
  spotlightRadius?: number;
}

/**
 * 글자 테두리(-webkit-text-stroke)가 커서 위치 기준 반경 안에서만 보이는 텍스트.
 * mousemove로 --mouse-x, --mouse-y를 갱신하고, stroke 레이어에 radial-gradient 마스크 적용.
 */
export function CursorStrokeText({
  children,
  className = "",
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS_PX,
}: CursorStrokeTextProps) {
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
    el.style.setProperty("--mouse-x", `${MOUSE_OUT_OF_BOUNDS_PX}px`);
    el.style.setProperty("--mouse-y", `${MOUSE_OUT_OF_BOUNDS_PX}px`);
  }, []);

  /* 선명한 원: 안은 불투명, 밖은 투명 (그라데이션 없음) */
  const maskStyle = {
    mask: `radial-gradient(circle ${spotlightRadius}px at var(--mouse-x, ${MOUSE_OUT_OF_BOUNDS_PX}px) var(--mouse-y, ${MOUSE_OUT_OF_BOUNDS_PX}px), black 0, black ${spotlightRadius}px, transparent ${spotlightRadius}px)`,
    WebkitMask: `radial-gradient(circle ${spotlightRadius}px at var(--mouse-x, ${MOUSE_OUT_OF_BOUNDS_PX}px) var(--mouse-y, ${MOUSE_OUT_OF_BOUNDS_PX}px), black 0, black ${spotlightRadius}px, transparent ${spotlightRadius}px)`,
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
      {/* 호버 시 커서 반경 안에서만: 스트로크/채움은 시맨틱 토큰으로 테마 대응 */}
      <span
        className="absolute inset-0 z-10 pointer-events-none select-none"
        aria-hidden
        style={{
          WebkitTextStroke: "1px var(--color-foreground)",
          color: "var(--color-background)",
          ...maskStyle,
        }}
      >
        {children}
      </span>
    </div>
  );
}
