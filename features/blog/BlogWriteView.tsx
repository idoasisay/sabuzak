"use client";

import Tiptap from "@/components/Tiptap";
import type { CategoryItem, TagItem, PostForEdit } from "@/features/blog";

type BlogWriteViewProps = {
  categories: CategoryItem[];
  tags: TagItem[];
  initialPost?: PostForEdit | null;
};

export function BlogWriteView({ categories, tags, initialPost }: BlogWriteViewProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Tiptap categories={categories} tags={tags} initialPost={initialPost} />
    </div>
  );
}
