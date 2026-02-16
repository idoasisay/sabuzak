"use client";

import { useState, useId } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** @typedef {{ id: string; name: string; slug: string }} CategoryItem */
/** @typedef {{ id: string; name: string; slug: string }} TagItem */

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   categories: CategoryItem[];
 *   tags: TagItem[];
 *   onSave: (payload: {
 *     categoryId: string;
 *     tagIds: string[];
 *     tagNamesToAdd: string[];
 *     published: boolean;
 *     publishedAt: string | null;
 *   }) => Promise<void>;
 *   isSaving?: boolean;
 * }} props
 */
export function PublishSidebar({ open, onClose, categories, tags, onSave, isSaving = false }) {
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState(new Set());
  const [tagNamesToAdd, setTagNamesToAdd] = useState("");
  const [publishAt, setPublishAt] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  const categorySelectId = useId();
  const publishAtId = useId();

  const handleToggleTag = tagId => {
    setSelectedTagIds(prev => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const tagNamesArray = tagNamesToAdd
    .split(/[,，\s]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const handleSave = async published => {
    await onSave({
      categoryId,
      tagIds: Array.from(selectedTagIds),
      tagNamesToAdd: tagNamesArray,
      published,
      publishedAt: published ? publishAt || null : null,
    });
    onClose();
  };

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ease-out",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-sm border-l border-border bg-background shadow-lg transition-transform duration-300 ease-out sm:w-96",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="발행 설정"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold">발행</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="닫기"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
            {/* 카테고리 */}
            <div className="space-y-2">
              <label htmlFor={categorySelectId} className="block text-sm font-medium text-foreground">
                카테고리
              </label>
              <select
                id={categorySelectId}
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">선택</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 태그 */}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-foreground">태그</span>
              {tags.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <li key={tag.id}>
                      <button
                        type="button"
                        onClick={() => handleToggleTag(tag.id)}
                        className={cn(
                          "rounded-md border px-2 py-1 text-xs transition-colors",
                          selectedTagIds.has(tag.id)
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border bg-muted/50 text-muted-foreground hover:border-input hover:text-foreground"
                        )}
                      >
                        {tag.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <input
                type="text"
                placeholder="새 태그 (쉼표로 구분)"
                value={tagNamesToAdd}
                onChange={e => setTagNamesToAdd(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* 발행 시각 */}
            <div className="space-y-2">
              <label htmlFor={publishAtId} className="block text-sm font-medium text-foreground">
                발행 시각
              </label>
              <input
                id={publishAtId}
                type="datetime-local"
                value={publishAt}
                onChange={e => setPublishAt(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                발행 시 이 시각이 적용됩니다. 임시 저장에는 사용되지 않습니다.
              </p>
            </div>

            {/* 저장 방식 / 발행 버튼 */}
            <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={!categoryId || isSaving}
                onClick={() => handleSave(false)}
              >
                {isSaving ? "저장 중…" : "임시 저장"}
              </Button>
              <Button
                type="button"
                className="w-full"
                disabled={!categoryId || isSaving}
                onClick={() => handleSave(true)}
              >
                {isSaving ? "저장 중…" : "발행"}
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
