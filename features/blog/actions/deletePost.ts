"use server";

import { createClient } from "@/lib/supabase/server";

const BUCKET = "blog-images";

export type DeletePostResult = { ok: true } | { ok: false; error: string };

/** content HTML과 thumbnail_url에서 blog-images 버킷 공개 URL만 추출해 storage path 배열 반환 */
function extractBlogImagePaths(content: string | null, thumbnailUrl: string | null): string[] {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return [];
  const prefix = `${baseUrl}/storage/v1/object/public/${BUCKET}/`;
  const paths: string[] = [];
  const seen = new Set<string>();

  function addPathFromUrl(url: string) {
    if (!url?.startsWith(prefix)) return;
    const path = url.slice(prefix.length).split("?")[0];
    if (path && !seen.has(path)) {
      seen.add(path);
      paths.push(path);
    }
  }

  if (thumbnailUrl) addPathFromUrl(thumbnailUrl);
  if (content) {
    const srcRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = srcRegex.exec(content)) !== null) addPathFromUrl(m[1]);
  }
  return paths;
}

export async function deletePost(slug: string): Promise<DeletePostResult> {
  if (!slug?.trim()) return { ok: false, error: "slug가 없습니다." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요합니다." };

  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("id, content, thumbnail_url")
    .eq("slug", slug.trim())
    .maybeSingle();

  if (fetchError) return { ok: false, error: fetchError.message };
  if (!post?.id) return { ok: false, error: "글이 없습니다." };

  const paths = extractBlogImagePaths(post.content ?? null, post.thumbnail_url ?? null);
  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  await supabase.from("post_tags").delete().eq("post_id", post.id);
  const { error: deleteError } = await supabase.from("posts").delete().eq("id", post.id);

  if (deleteError) return { ok: false, error: deleteError.message };
  return { ok: true };
}
