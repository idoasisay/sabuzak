"use client";

import Tiptap from "@/components/Tiptap";
import type { CategoryItem, TagItem, PostForEdit, DraftListItem } from "@/features/blog";

type BlogWriteViewProps = {
  categories: CategoryItem[];
  tags: TagItem[];
  initialPost?: PostForEdit | null;
  drafts?: DraftListItem[];
};

export function BlogWriteView({ categories, tags, initialPost, drafts = [] }: BlogWriteViewProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Tiptap categories={categories} tags={tags} initialPost={initialPost} drafts={drafts} />
    </div>
  );
}
