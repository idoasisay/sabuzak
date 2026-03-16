import type { Metadata } from "next";
import { BlogAllPostsView } from "@/features/blog";

type BlogAllPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export const metadata: Metadata = {
  title: "전체 보기",
  description: "블로그의 모든 포스트를 페이지별로 모아봅니다.",
};

export default async function BlogAllPage({ searchParams }: BlogAllPageProps) {
  return <BlogAllPostsView searchParams={searchParams} />;
}
