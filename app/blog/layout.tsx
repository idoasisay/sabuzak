import type { Metadata } from "next";
import { BlogLayoutView } from "@/features/blog";

export const metadata: Metadata = {
  title: { default: "imio_dev", template: "%s - imio.dev" },
  description: "imio.dev 개발 블로그",
  openGraph: {
    title: "imio_dev",
    description: "imio.dev 개발 블로그",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <BlogLayoutView>{children}</BlogLayoutView>;
}
