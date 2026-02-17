import { BlogView } from "@/features/blog";

type BlogPageProps = {
  searchParams: Promise<{ category?: string; tag?: string }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  return <BlogView searchParams={searchParams} />;
}
