"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clover, Loader2 } from "lucide-react";

type LoginViewProps = {
  /** 로그인 성공 후 이동할 URL (예: /blog/foo) */
  returnTo?: string | null;
  /** 글 수정 시 slug (returnTo 없을 때 /blog/write?slug=xxx 로 리프레시) */
  slug?: string | null;
};

export function LoginView({ returnTo, slug }: LoginViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resolvedReturnTo = returnTo ?? searchParams.get("returnTo");
  const resolvedSlug = slug ?? searchParams.get("slug");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("외부인은 로그인할 수 없습니다");
      return;
    }
    if (resolvedReturnTo) {
      router.push(resolvedReturnTo);
      return;
    }
    const path = resolvedSlug ? `/blog/write?slug=${encodeURIComponent(resolvedSlug)}` : "/blog/write";
    router.push(path);
    router.refresh();
  }

  return (
    <div className="bg-muted text-foreground flex min-h-0 flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-chart-2 text-xs h-4 mb-2">{error}</div>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="!border-chart-2 text-chart-2 border-b bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          />
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="!border-chart-2 text-chart-2 border-b bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          />
          <Button variant="ghost" disabled={loading} className="font-silkscreen self-end [&_svg]:size-7 group">
            {loading ? (
              <Loader2 className="animate-spin text-chart-2" />
            ) : (
              <Clover className="text-accent group-hover:text-chart-2 group-hover:scale-110 transition-all duration-300" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
