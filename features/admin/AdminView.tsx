"use client";

import { useState } from "react";
import { DesignSystemPreview } from "@/components/DesignSystemPreview";

export function AdminView() {
  const [designSystemOpen, setDesignSystemOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        type="button"
        onClick={() => setDesignSystemOpen(true)}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        디자인 토큰
      </button>
      <DesignSystemPreview isOpen={designSystemOpen} onClose={() => setDesignSystemOpen(false)} />
    </div>
  );
}
