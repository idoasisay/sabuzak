import { createClient } from "@/lib/supabase/server";

export type PostListItem = {
  slug: string;
  title: string;
};

export type Post = PostListItem & {
  content: string;
  excerpt: string;
  created_at: string;
  updated_at: string;
};

/** 편집 폼용: id, category_id, tag_ids 포함 */
export type PostForEdit = Post & {
  id: string;
  category_id: string;
  tag_ids: string[];
  published_at: string | null;
};

export async function getPostsList(): Promise<PostListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("slug, title")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) return [];
  const fromDb = (data ?? []) as PostListItem[];
  return fromDb;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, content, excerpt, created_at, updated_at")
    .eq("published", true)
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as Post;
}

/** 편집 페이지용: slug로 글 조회 (published 무관), category_id·tag_ids 포함 */
export async function getPostForEdit(slug: string): Promise<PostForEdit | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, content, excerpt, created_at, updated_at, category_id, published_at, post_tags(tag_id)")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  const postTags = (row.post_tags as { tag_id: string }[] | null) ?? [];
  const tag_ids = postTags.map(pt => pt.tag_id);
  const { post_tags: _, ...post } = row;
  return { ...post, tag_ids } as PostForEdit;
}

/**
 * 카테고리 slug로 해당 카테고리 글 목록만 조회 (예: /blog?category=xxx).
 * ⚠️ posts.published = true 인 행만 반환합니다. (DB 기본값은 false)
 */
export async function getPostsByCategorySlug(categorySlug: string): Promise<PostListItem[]> {
  const supabase = await createClient();
  const { data: category, error: catError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (catError || !category?.id) {
    if (process.env.NODE_ENV === "development" && catError) {
      console.warn("[getPostsByCategorySlug] category lookup failed:", categorySlug, catError.message);
    }
    return [];
  }

  const { data, error } = await supabase
    .from("posts")
    .select("slug, title")
    .eq("published", true)
    .eq("category_id", category.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[getPostsByCategorySlug] posts query failed:", category.id, error.message);
    }
    return [];
  }

  const list = (data ?? []) as PostListItem[];
  if (process.env.NODE_ENV === "development" && list.length === 0) {
    console.warn(
      "[getPostsByCategorySlug] 0 posts for category:",
      categorySlug,
      "id:",
      category.id,
      "→ Check posts.published = true and posts.category_id = this id"
    );
  }
  return list;
}
