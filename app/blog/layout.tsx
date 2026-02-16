import { BlogLayoutView } from "@/features/blog";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <BlogLayoutView>{children}</BlogLayoutView>;
}
