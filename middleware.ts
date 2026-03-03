import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const INFO_SLUG = "info"; // 기존에 사용하시던 슬러그 값

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname, searchParams } = url;
  const hostname = request.headers.get("host") || "";

  // 1. 서브도메인 판단 (로컬호스트 포함)
  const isResumeSubdomain = hostname.startsWith("resume.");
  const isBlogSubdomain = hostname.startsWith("blog.");

  if (isResumeSubdomain) {
    // resume.xxx/... → 내부 /resume (단일 페이지)
    url.pathname = "/resume";
    return NextResponse.rewrite(url);
  }

  if (isBlogSubdomain) {
    // [Case A] 서브도메인으로 접속했을 때 (blog.xxx/...)

    const category = searchParams.get("category")?.trim();
    const tag = searchParams.get("tag")?.trim();

    if (pathname === "/" && !category && !tag) {
      return NextResponse.rewrite(new URL(`/blog/${INFO_SLUG}`, request.url));
    }

    if (pathname === "/" && (category || tag)) {
      url.pathname = "/blog";
      return NextResponse.rewrite(url);
    }

    if (!pathname.startsWith("/blog")) {
      url.pathname = `/blog${pathname}`;
      return NextResponse.rewrite(url);
    }
  } else {
    // [Case B] 메인 도메인으로 접속했을 때 (imio.dev/blog)

    // 본 도메인 루트(/) → blog. 서브도메인으로 리다이렉트
    if (pathname === "/") {
      const redirectUrl = new URL(request.url);
      redirectUrl.hostname = `blog.${redirectUrl.hostname}`;
      redirectUrl.pathname = "/";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl, 307);
    }

    // 기존 로직: /blog 접속 시 /blog/info로 리다이렉트
    const category = searchParams.get("category")?.trim();
    const tag = searchParams.get("tag")?.trim();

    if (pathname === "/blog" && !category && !tag) {
      url.pathname = `/blog/${INFO_SLUG}`;
      return NextResponse.redirect(url, 307);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 정적 파일 및 API 경로를 제외한 모든 경로에서 실행
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
