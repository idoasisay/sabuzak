// middleware.ts (프로젝트 루트)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const INFO_SLUG = "info";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 정확히 /blog 이고, category가 없거나 비어 있으면 /blog/info 로
  if (pathname === "/blog" && !searchParams.get("category")?.trim()) {
    const url = request.nextUrl.clone();
    url.pathname = `/blog/${INFO_SLUG}`;
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}
