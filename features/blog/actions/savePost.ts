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
  const { postId, title, content, excerpt, categoryId, published, publishedAt } = input;
  const tagIds = (input.tagIds ?? []).filter((id): id is string => Boolean(id));
  const tagNamesToAdd = (input.tagNamesToAdd ?? []).map(n => String(n).trim()).filter(n => n.length > 0);

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
    const trimmed = name.trim();
    if (!trimmed) continue;
    let tagSlug = slugify(trimmed);
    if (!tagSlug || tagSlug === "untitled") {
      tagSlug = trimmed; // 한글 등: slug를 이름 그대로 사용 (고유·가독)
    }
    const { data: bySlug } = await supabase.from("tags").select("id").eq("slug", tagSlug).maybeSingle();
    let existingTag = bySlug ?? null;
    if (!existingTag) {
      const { data: byName } = await supabase.from("tags").select("id").eq("name", trimmed).maybeSingle();
      existingTag = byName ?? null;
    }
    if (existingTag) {
      allTagIds.push(existingTag.id);
    } else {
      const { data: newTag, error: createErr } = await supabase
        .from("tags")
        .insert({ name: trimmed, slug: tagSlug })
        .select("id")
        .single();
      if (createErr) return { ok: false, error: `태그 "${trimmed}" 추가 실패: ${createErr.message}` };
      if (newTag) allTagIds.push(newTag.id);
    }
  }

  const { error: deleteErr } = await supabase.from("post_tags").delete().eq("post_id", finalPostId);
  if (deleteErr) return { ok: false, error: `태그 연결 해제 실패: ${deleteErr.message}` };

  const uniqueTagIds = [...new Set(allTagIds)];
  if (uniqueTagIds.length > 0) {
    const { error: insertErr } = await supabase
      .from("post_tags")
      .insert(uniqueTagIds.map(tag_id => ({ post_id: finalPostId, tag_id })));
    if (insertErr) return { ok: false, error: `태그 연결 실패: ${insertErr.message}` };
  }

  return { ok: true, postId: finalPostId, slug };
}
