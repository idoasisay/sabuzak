import { createClient } from "@/lib/supabase/server";
import type { PostListItem } from "./getPosts";

/** 사이드바 등에서 쓸 카테고리 한 줄 타입 (DB categories 테이블과 맞춤) */
export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
};

export type CategoryWithPosts = CategoryItem & { posts: PostListItem[] };

/**
 * Supabase categories 테이블에서 카테고리 목록을 가져옵니다.
 * 서버 컴포넌트·레이아웃에서만 호출 (createClient가 next/headers 사용).
 */
export async function getCategories(): Promise<CategoryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? []) as CategoryItem[];
}

/**
 * 카테고리 목록과 카테고리별 published 포스트를 2회 쿼리로 조회 (N+1 방지).
 * 서버 컴포넌트·레이아웃 전용.
 */
export async function getCategoriesWithPosts(): Promise<CategoryWithPosts[]> {
  const supabase = await createClient();

  const [categoriesRes, postsRes] = await Promise.all([
    supabase.from("categories").select("id, name, slug").order("created_at", { ascending: true }),
    supabase
      .from("posts")
      .select("slug, title, category_id")
      .eq("published", true)
      .order("created_at", { ascending: false }),
  ]);

  if (categoriesRes.error) return [];
  const categories = (categoriesRes.data ?? []) as CategoryItem[];

  if (postsRes.error) {
    return categories.map(cat => ({ ...cat, posts: [] }));
  }

  const postsByCategoryId = (postsRes.data ?? []).reduce(
    (acc, row) => {
      const item = { slug: row.slug, title: row.title };
      const id = (row as { category_id: string }).category_id;
      if (!acc[id]) acc[id] = [];
      acc[id].push(item);
      return acc;
    },
    {} as Record<string, PostListItem[]>
  );

  return categories.map(cat => ({
    ...cat,
    posts: postsByCategoryId[cat.id] ?? [],
  }));
}

/** slug로 카테고리 한 건 조회 (이름 표시 등) */
export async function getCategoryBySlug(slug: string): Promise<CategoryItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("id, name, slug").eq("slug", slug).single();

  if (error || !data) return null;
  return data as CategoryItem;
}
