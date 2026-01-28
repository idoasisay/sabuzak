import { ThemeToggle } from "@/components/ThemeToggle";

export function HomeView() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background font-sans">
      <p>HELLO WORLD!</p>
      <ThemeToggle />
    </div>
  );
}
