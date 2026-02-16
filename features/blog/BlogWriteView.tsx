"use client";

import Tiptap from "@/components/Tiptap";
import type { CategoryItem } from "@/features/blog/api/getCategories";
import type { TagItem } from "@/features/blog/api/getTags";

type BlogWriteViewProps = {
  categories: CategoryItem[];
  tags: TagItem[];
};

export function BlogWriteView({ categories, tags }: BlogWriteViewProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Tiptap categories={categories} tags={tags} />
    </div>
  );
}
