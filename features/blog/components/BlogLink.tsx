"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

interface BlogLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// 1. 서버용 스냅샷 (원본 유지)
const getServerSnapshot = () => false;

// 2. 클라이언트용 스냅샷 (서브도메인 여부 확인)
const getSnapshot = () => {
  if (typeof window === "undefined") return false;
  return window.location.hostname.startsWith("blog.");
};

// 3. 구독 (도메인은 변하지 않으므로 빈 함수)
const subscribe = () => () => {};

export default function BlogLink({ href, children, className, style }: BlogLinkProps) {
  const isBlogSubdomain = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // BlogLink.tsx 내부 로직 수정
  let finalHref = href;

  if (isBlogSubdomain && href.startsWith("/blog")) {
    // 1. '/blog' 바로 뒤의 글자를 확인
    const afterBlog = href.substring(5); // '/blog'가 5글자이므로 그 이후 추출

    if (afterBlog.startsWith("?") || afterBlog.startsWith("#")) {
      // '/blog?category=...' 형태일 때 -> '/?category=...'
      finalHref = "/" + afterBlog;
    } else if (afterBlog.startsWith("/")) {
      // '/blog/post-1' 형태일 때 -> '/post-1'
      finalHref = afterBlog;
    } else if (afterBlog === "") {
      // '/blog' 그 자체일 때 -> '/'
      finalHref = "/";
    }
  }

  return (
    <Link href={finalHref} className={className} style={style}>
      {children}
    </Link>
  );
}
