"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { INFO_SLUG } from "../constants";
import {
  SquarePen,
  ChevronsRight,
  ChevronRight,
  CornerDownRight,
  Folder,
  AtSign,
  BadgeAlert,
  FileText,
} from "lucide-react";
import { iconButtonClass } from "../styles/uiClasses";
import { cn } from "@/lib/utils";
import type { CategoryItem } from "../api/getCategories";
import type { PostListItem } from "../api/getPosts";
import { ThemeToggle } from "@/components/ThemeToggle";

const SIDEBAR_OPEN = 14; // rem
const SIDEBAR_CLOSED = 3; // rem

export type CategoryWithPosts = CategoryItem & { posts: PostListItem[] };

type BlogSidebarProps = {
  categories?: CategoryWithPosts[];
  posts?: PostListItem[];
};

export function BlogSidebar({ categories = [], posts = [] }: BlogSidebarProps) {
  const [open, setOpen] = useState(true);
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  const toggleCategory = (slug: string) => {
    setExpandedSlugs(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category"); // URL에서 'category' 값을 읽음
  return (
    <aside
      className="flex shrink-0 flex-col overflow-hidden border-r border-border bg-background transition-[width] duration-300 ease-in-out"
      style={{ width: open ? `${SIDEBAR_OPEN}rem` : `${SIDEBAR_CLOSED}rem` }}
    >
      {/* MEMO 헤더: 토글 버튼 + 제목 */}
      <div
        className="flex h-10 shrink-0 items-center border-b border-border bg-accent pr-3 select-none"
        style={{ minWidth: open ? `${SIDEBAR_OPEN}rem` : undefined }}
      >
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          className="flex h-full shrink-0 items-center justify-center font-silkscreen text-accent-foreground"
          style={{ width: `${SIDEBAR_CLOSED}rem` }}
          aria-label={open ? "사이드바 닫기" : "사이드바 열기"}
        >
          <ChevronsRight
            className={`${iconButtonClass} text-muted-foreground hover:text-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            size={24}
          />
        </button>
        {open && (
          <>
            <p className="min-w-0 flex-1 truncate font-silkscreen text-info text-sm">MIO_DEV_BLOG</p>
            <Link href="/blog/write" className="">
              <SquarePen className={`${iconButtonClass} text-muted-foreground/80 hover:text-foreground`} size={20} />
            </Link>
          </>
        )}
      </div>

      {/* MEMO 카테고리·글 목록 */}
      <div className={cn("min-w-0 flex-1 overflow-hidden bg-accent/30 flex flex-col", open ? "flex" : "")}>
        <nav
          className="flex h-full flex-col gap-0.5 overflow-y-auto text-sm text-muted-foreground"
          style={{ minWidth: open ? `${SIDEBAR_OPEN}rem` : undefined }}
        >
          {!open && (
            <div className="flex flex-col items-center justify-center p-2 gap-2">
              {[
                {
                  href: `/blog/${INFO_SLUG}`,
                  icon: BadgeAlert,
                  label: "시작하는 글",
                  active: pathname === `/blog/${INFO_SLUG}`,
                },
                { href: "/", icon: AtSign, label: "Resume", target: "_blank" },
              ].map(item => (
                <Link key={item.href} href={item.href} target={item.target}>
                  <item.icon
                    size={32}
                    className={`${iconButtonClass} text-muted-foreground hover:text-foreground transition-colors duration-200`}
                  />
                </Link>
              ))}
            </div>
          )}

          {/* 시작하는 글 & Resume */}
          <div className={cn("flex flex-col border-b border-border", open ? "" : "hidden")}>
            {[
              {
                href: `/blog/${INFO_SLUG}`,
                icon: BadgeAlert,
                label: "시작하는 글",
                active: pathname === `/blog/${INFO_SLUG}`,
              },
              { href: "/", icon: AtSign, label: "Resume", target: "_blank" },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                target={item.target}
                className={cn(
                  "flex items-center gap-2 p-2 hover:text-foreground transition-colors duration-200",
                  item.active ? "bg-accent text-foreground" : "text-muted-foreground"
                )}
                style={{ width: `${SIDEBAR_OPEN}rem` }} // 너비 고정으로 텍스트 밀림 방지
              >
                <item.icon size={16} className="shrink-0 ml-1" />
                <p className="truncate">{item.label}</p>
              </Link>
            ))}
          </div>

          <div className={cn("p-2 pt-3", open ? "" : "hidden")}>
            <p className="mb-1 block text-xs font-medium text-muted-foreground/80">카테고리</p>
            {categories.length > 0 && (
              <>
                {categories.map(({ id, name, slug, posts: categoryPosts }) => {
                  const isExpanded = expandedSlugs.has(slug);
                  const isActive = currentCategory === slug; // 현재 선택된 카테고리

                  return (
                    <div key={id}>
                      <div
                        className={`flex items-center justify-between gap-2 transition-all duration-200 ease-out rounded-md bg-accent w-full group hover:bg-accent active:bg-muted-foreground/10 ${isActive ? "bg-accent" : "bg-transparent"}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleCategory(slug)}
                          className="relative shrink-0 size-5 flex items-center justify-center text-muted-foreground hover:text-foreground m-1"
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? `${name} 접기` : `${name} 글 목록 펼치기`}
                        >
                          <Folder
                            className={`absolute inset-0 m-auto ${iconButtonClass} transition-opacity duration-150 group-hover:opacity-0`}
                            size={20}
                          />
                          <ChevronRight
                            className={`absolute inset-0 m-auto ${iconButtonClass} text-info opacity-1 group-hover:opacity-100 transition-opacity duration-150 ${isExpanded ? "rotate-90" : ""}`}
                            size={16}
                          />
                        </button>
                        <Link
                          href={`/blog?category=${encodeURIComponent(slug)}`}
                          className="min-w-0 flex-1 truncate py-1"
                        >
                          <span
                            className={`text-xs block ${isActive ? "text-foreground/80 font-bold" : "text-muted-foreground"}`}
                          >
                            {name}
                          </span>
                        </Link>
                      </div>
                      {/* MEMO 포스트 목록 */}
                      {isExpanded && categoryPosts.length > 0 && (
                        <ul className="list-none py-0.5">
                          {categoryPosts.map(({ slug: postSlug, title }) => (
                            <li key={postSlug}>
                              <Link
                                href={`/blog/${postSlug}`}
                                className={cn(
                                  "truncate text-xs hover:text-foreground flex items-center gap-2 p-1 px-3 rounded-md",
                                  pathname === `/blog/${postSlug}`
                                    ? "font-medium text-foreground bg-accent"
                                    : "text-muted-foreground"
                                )}
                              >
                                <CornerDownRight className="size-3" />
                                {title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                      {isExpanded && categoryPosts.length === 0 && (
                        <p className="px-3 py-1.5 pl-5 text-xs text-muted-foreground">아직 글이 없습니다.</p>
                      )}
                    </div>
                  );
                })}
              </>
            )}
            {posts.length > 0 && (
              <>
                <p className="mb-2 mt-3 block text-xs font-medium text-muted-foreground/80">최근 등록된 글</p>
                {posts.map(({ slug, title }) => (
                  <Link
                    key={slug}
                    href={`/blog/${slug}`}
                    className={`truncate text-xs p-1 hover:text-foreground flex items-center gap-2 ${pathname === `/blog/${slug}` ? "font-medium text-foreground" : ""}`}
                  >
                    <FileText size={16} />
                    {title}
                  </Link>
                ))}
              </>
            )}
          </div>
        </nav>
        <div className="flex justify-end p-3">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
