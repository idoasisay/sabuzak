"use server";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export type SavePostInput = {
  postId?: string;
  title: string;
  content: string;
  excerpt?: string;
  categoryId: string;
  tagIds: string[];
  /** 새로 추가할 태그 이름 (없으면 생성 후 연결) */
  tagNamesToAdd?: string[];
  published: boolean;
  /** 발행 시각 (발행일 때만 사용, 없으면 now()) */
  publishedAt?: string | null;
};

export type SavePostResult = { ok: true; postId: string; slug: string } | { ok: false; error: string };

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function savePost(input: SavePostInput): Promise<SavePostResult> {
  const { postId, title, content, excerpt, categoryId, tagIds, tagNamesToAdd = [], published, publishedAt } = input;

  if (!title.trim()) return { ok: false, error: "제목을 입력해 주세요." };
  if (!categoryId) return { ok: false, error: "카테고리를 선택해 주세요." };

  const supabase = await createClient();

  const excerptText = excerpt?.trim() || stripHtml(content).slice(0, 200) || "";
  let slug = slugify(title);
  if (!slug || slug === "untitled") slug = `post-${Date.now()}`;

  if (postId) {
    const { data: existing } = await supabase.from("posts").select("id, slug").eq("id", postId).single();
    if (existing?.slug) slug = existing.slug;
  } else {
    const { data: conflict } = await supabase.from("posts").select("id").eq("slug", slug).maybeSingle();
    if (conflict) slug = `${slug}-${Date.now()}`;
  }

  const publishedAtValue = published
    ? publishedAt
      ? new Date(publishedAt).toISOString()
      : new Date().toISOString()
    : null;

  const row = {
    title: title.trim(),
    slug,
    content,
    excerpt: excerptText,
    category_id: categoryId,
    published,
    published_at: publishedAtValue,
    updated_at: new Date().toISOString(),
  };

  let finalPostId: string;

  if (postId) {
    const { error } = await supabase.from("posts").update(row).eq("id", postId);
    if (error) return { ok: false, error: error.message };
    finalPostId = postId;
  } else {
    const { data: inserted, error } = await supabase
      .from("posts")
      .insert({ ...row, created_at: new Date().toISOString() })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    finalPostId = inserted!.id;
  }

  const allTagIds = [...tagIds];

  for (const name of tagNamesToAdd) {
    const tagSlug = slugify(name) || `tag-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const { data: existingTag } = await supabase.from("tags").select("id").eq("slug", tagSlug).maybeSingle();
    if (existingTag) {
      allTagIds.push(existingTag.id);
    } else {
      const { data: newTag, error: createErr } = await supabase
        .from("tags")
        .insert({ name: name.trim(), slug: tagSlug })
        .select("id")
        .single();
      if (!createErr && newTag) allTagIds.push(newTag.id);
    }
  }

  await supabase.from("post_tags").delete().eq("post_id", finalPostId);
  const uniqueTagIds = [...new Set(allTagIds)];
  if (uniqueTagIds.length > 0) {
    await supabase.from("post_tags").insert(uniqueTagIds.map(tag_id => ({ post_id: finalPostId, tag_id })));
  }

  return { ok: true, postId: finalPostId, slug };
}
