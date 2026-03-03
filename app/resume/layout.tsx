import type { Metadata } from "next";
import "@/features/resume/styles/resume.css";

export const metadata: Metadata = {
  title: "Resume | sabuzak",
  description: "이력서 · 경력증명서",
};

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
