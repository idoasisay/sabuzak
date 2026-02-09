import Link from "next/link";

export function ProjectsView() {
  return (
    <div className="min-h-screen font-sans mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
      <p className="mt-2 text-muted-foreground">프로젝트 목록이 들어갈 자리입니다.</p>
      <Link href="/" className="mt-6 inline-block text-sm text-muted-foreground underline hover:text-foreground">
        ← 홈으로
      </Link>
    </div>
  );
}
