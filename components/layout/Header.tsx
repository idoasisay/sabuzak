import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CursorStrokeText } from "@/components/CursorStrokeText";

export function Header() {
  return (
    <header className="bg-grid-center flex justify-center gap-x-(--grid-pair-width) px-(--grid-edge) select-none">
      <nav className="flex flex-col flex-1 items-end text-sm">
        <Link href="/blog" className="text-muted-foreground hover:text-foreground">
          Blog
        </Link>
        <Link href="/projects" className="text-muted-foreground hover:text-foreground">
          Projects
        </Link>
        <Link href="/reviews" className="text-muted-foreground hover:text-foreground">
          Reviews
        </Link>
      </nav>
      <Link href="/" className="flex flex-col flex-1 items-start">
        <ThemeToggle />
        <CursorStrokeText className="font-silkscreen text-2xl text-foreground">sabuzak</CursorStrokeText>
        <CursorStrokeText className="font-silkscreen text-lg">prod.mio</CursorStrokeText>
      </Link>
    </header>
  );
}
