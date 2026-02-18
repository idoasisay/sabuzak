import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 제목 등에서 URL용 slug 생성. 공백은 하이픈, 한글·영문·숫자·하이픈만 유지 (예: "한글로 해줘" → "한글로-해줘"). */
export function slugify(text: string): string {
  const s = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "untitled";
}
