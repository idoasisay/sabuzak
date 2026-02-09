"use client";

import { useCallback, useEffect } from "react";

const COLOR_SWATCHES = [
  { name: "background", class: "bg-background", hex: "#ffffff / #171717" },
  { name: "foreground", class: "bg-foreground", hex: "#171717 / #fafafa" },
  { name: "card", class: "bg-card", hex: "#ffffff / #171717" },
  { name: "primary", class: "bg-primary", hex: "#262626 / #fafafa" },
  { name: "primary-foreground", class: "bg-primary text-primary-foreground", hex: "#fafafa / #262626" },
  { name: "secondary", class: "bg-secondary", hex: "#f5f5f5 / #262626" },
  { name: "muted", class: "bg-muted", hex: "#f5f5f5 / #262626" },
  { name: "muted-foreground", class: "bg-muted-foreground", hex: "#737373 / #a6a6a6" },
  { name: "accent", class: "bg-accent", hex: "#f5f5f5 / #262626" },
  { name: "destructive", class: "bg-destructive text-destructive-foreground", hex: "#ef4444 / #b91c1c" },
  { name: "border", class: "bg-border", hex: "#e5e5e5 / #2e2e2e" },
] as const;

type DesignSystemPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DesignSystemPreview({ isOpen, onClose }: DesignSystemPreviewProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="디자인 시스템"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-background p-6 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">디자인 시스템</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            닫기
          </button>
        </div>

        {/* Colors */}
        <section className="mb-8">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">색상 토큰</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COLOR_SWATCHES.map(({ name, class: bgClass, hex }) => (
              <div key={name} className="flex flex-col gap-1">
                <div className={`h-14 w-full rounded-md border border-border ${bgClass}`} title={hex} />
                <span className="text-xs font-medium text-foreground">{name}</span>
                <span className="font-mono text-xs text-muted-foreground">{hex}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mb-8">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">타이포그래피</h3>
          <div className="space-y-2 rounded-md border border-border bg-muted/50 p-4">
            <p className="text-2xl font-semibold text-foreground">Heading 2xl</p>
            <p className="text-xl font-semibold text-foreground">Heading xl</p>
            <p className="text-lg font-medium text-foreground">Heading lg</p>
            <p className="text-base text-foreground">Body base — font-sans</p>
            <p className="text-sm text-muted-foreground">Body sm — muted</p>
            <p className="font-mono text-sm text-foreground">Mono font</p>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-8">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">버튼</h3>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Primary
            </button>
            <button
              type="button"
              className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              Secondary
            </button>
            <button
              type="button"
              className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90"
            >
              Destructive
            </button>
            <button
              type="button"
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Outline
            </button>
            <button type="button" className="rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
              Ghost
            </button>
          </div>
        </section>

        {/* Radius */}
        <section>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">둥글기</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-sm bg-muted" />
              <span className="text-xs text-muted-foreground">rounded-sm</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-md bg-muted" />
              <span className="text-xs text-muted-foreground">rounded-md</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-lg bg-muted" />
              <span className="text-xs text-muted-foreground">rounded-lg</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
