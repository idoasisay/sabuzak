import { Header, Footer } from "@/components/layout";

export default function WithHeaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-grid-center">{children}</main>
      <Footer />
    </div>
  );
}
