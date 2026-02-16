import { createClient } from "@/lib/supabase/server";

/** 사이드바 등에서 쓸 카테고리 한 줄 타입 (DB categories 테이블과 맞춤) */
export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
};

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

/** slug로 카테고리 한 건 조회 (이름 표시 등) */
export async function getCategoryBySlug(slug: string): Promise<CategoryItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("id, name, slug").eq("slug", slug).single();

  if (error || !data) return null;
  return data as CategoryItem;
}
