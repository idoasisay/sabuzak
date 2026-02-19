"use server";

import { createClient } from "@/lib/supabase/server";

export type DeletePostResult = { ok: true } | { ok: false; error: string };

export async function deletePost(slug: string): Promise<DeletePostResult> {
  if (!slug?.trim()) return { ok: false, error: "slug가 없습니다." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요합니다." };

  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", slug.trim())
    .maybeSingle();

  if (fetchError) return { ok: false, error: fetchError.message };
  if (!post?.id) return { ok: false, error: "글이 없습니다." };

  await supabase.from("post_tags").delete().eq("post_id", post.id);
  const { error: deleteError } = await supabase.from("posts").delete().eq("id", post.id);

  if (deleteError) return { ok: false, error: deleteError.message };
  return { ok: true };
}
