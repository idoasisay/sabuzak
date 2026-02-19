"use server";

import { createClient } from "@/lib/supabase/server";

const BUCKET = "blog-images";
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export type UploadImageResult = { ok: true; url: string } | { ok: false; error: string };

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100) || "image";
}

export async function uploadImage(formData: FormData): Promise<UploadImageResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요합니다." };

  const file = formData.get("file");
  if (!file || !(file instanceof File)) return { ok: false, error: "파일을 선택해 주세요." };

  if (file.size > MAX_SIZE_MB * 1024 * 1024)
    return { ok: false, error: `파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다.` };
  if (!ALLOWED_TYPES.includes(file.type)) return { ok: false, error: "지원 형식: JPEG, PNG, GIF, WebP" };

  const ext = file.name.split(".").pop() || "jpg";
  const base = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
  const path = `${user.id}/${Date.now()}-${base}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return { ok: false, error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: publicUrl };
}
