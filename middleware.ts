// middleware.ts (프로젝트 루트)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const INFO_SLUG = "info";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 정확히 /blog 이고, category/tag 없으면 /blog/info 로. 목록 필터(?tag=, ?category=) 있으면 리다이렉트 안 함
  const category = searchParams.get("category")?.trim();
  const tag = searchParams.get("tag")?.trim();
  if (pathname === "/blog" && !category && !tag) {
    const url = request.nextUrl.clone();
    url.pathname = `/blog/${INFO_SLUG}`;
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}
