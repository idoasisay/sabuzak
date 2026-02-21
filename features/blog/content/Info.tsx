"use client";

import Link from "next/link";
import { ArrowUpRight, Folder } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";

/** LinkedIn icon (Simple Icons path), lucide Linkedin is deprecated */
function LinkedInIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}
import { useRef, useState, useCallback } from "react";

const STAR_COUNT = 18;
/* 동심 링마다 다른 translateZ → 중심이 가장 볼록, 끝으로 갈수록 줄어듦 (반지름 150px). z를 키우면 더 볼록, perspective를 줄여도 더 튀어나와 보임 */
const BULGE_RINGS: { inner: number; outer: number; z: number }[] = [
  { inner: 120, outer: 150, z: 0 },
  { inner: 90, outer: 120, z: 14 },
  { inner: 60, outer: 90, z: 28 },
  { inner: 30, outer: 60, z: 42 },
  { inner: 0, outer: 30, z: 56 },
];
const BULGE_PERSPECTIVE = 240;

const DEV_START = new Date("2020-09-01T00:00:00Z");
const ENG_START = new Date("2024-10-14T00:00:00Z");

function getDaysSince(start: Date): number {
  const now = new Date();
  const ms = now.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

const EMAIL = "idoasisay.yc@gmail.com";

const CATEGORIES = [
  { title: "공부", slug: "study", desc: "궁금한 기술이나 지식에 대한 정리" },
  { title: "문제해결", slug: "problem-solving", desc: "개발하며 마주쳤던 문제를 정의하고 해결하는 노트" },
  { title: "생각노트", slug: "think-note", desc: "개발에 대한 주관적인 생각을 적는 아티클" },
  { title: "지식서재", slug: "library", desc: "공부하고 싶은 것들을 올려 놓는 곳" },
] as const;

function CategoryCard({ title, slug, desc }: { title: string; slug: string; desc: string }) {
  const [hovered, setHovered] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const handleEnter = () => {
    setHovered(true);
    setAnimKey(k => k + 1);
  };
  return (
    <li>
      <Link
        href={`/blog?category=${encodeURIComponent(slug)}`}
        className="hover:!border-chart-2/50 transition-colors duration-300 relative block overflow-hidden rounded-lg bg-muted-foreground/5 border border-border"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="p-2">
          <div className="flex gap-2 items-center">
            <Folder size={18} className="text-foreground/50 shrink-0" />
            <p className="font-semibold text-foreground/80 text-sm pb-0.5">{title}</p>
          </div>
          <p className="text-chart-2 text-xs">{desc}</p>
        </div>
        <div
          className="absolute right-0 top-0 bottom-0 w-[42px] flex items-start justify-end pt-2 pr-1.5 text-accent pointer-events-none transition-all duration-300 ease-out"
          style={{
            background: "linear-gradient(to right, transparent, hsl(var(--chart-2)))",
            transform: hovered ? "translateX(0)" : "translateX(100%)",
            opacity: hovered ? 1 : 0,
          }}
          aria-hidden
        >
          <div key={animKey} className="absolute inset-0">
            <span className="absolute top-2 right-1.5 category-arrow-1">
              <ArrowUpRight size={16} className="text-accent/80 shrink-0" />
            </span>
            <span className="absolute top-2 right-1.5 category-arrow-2">
              <ArrowUpRight size={16} className="text-accent/80 shrink-0" />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export function Info() {
  const headingRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyEmail = useCallback(async () => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 1000);
    } catch {
      setCopied(false);
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = headingRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSpot({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);
  const handleMouseLeave = useCallback(() => setSpot(null), []);

  return (
    <article className="select-none relative overflow-hidden p-2 bg-accent h-full overflow-y-auto">
      <div className="fixed z-99 cursor-default right-2 transition-opacity duration-200 flex flex-col items-end justify-end mb-3 gap-0.5">
        <div className="opacity-40 hover:opacity-100 text-[10px] hover:text-xs text-muted border border-border bg-chart-5 px-1 rounded-sm w-fit transition-all duration-200">
          updated at 2026.02.20
        </div>
        <div className="opacity-40 hover:opacity-100 text-[10px] hover:text-xs text-muted border border-border bg-chart-1 px-1 rounded-sm w-fit transition-all duration-200">
          개발이라는 걸 시작한 지 <span className="">+{getDaysSince(DEV_START)}일</span>
        </div>
        <div className="opacity-40 hover:opacity-100 text-[10px] hover:text-xs text-muted border border-border bg-chart-2 px-1 rounded-sm w-fit transition-all duration-200">
          개발자가 된 지 <span className="">+{getDaysSince(ENG_START)}일</span>
        </div>
      </div>
      {/* 별비 픽셀 레이어 */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {Array.from({ length: STAR_COUNT }, (_, i) => {
          const isStar = (i * 7 + 11) % 3 === 0;
          const style = {
            left: `${(i * 5.5 + 2) % 98}%`,
            animationDelay: `${i * 0.35}s`,
            animationDuration: `${2.5 + (i % 5) * 0.4}s`,
          };
          return isStar ? (
            <div
              key={i}
              className="star-rain-pixel absolute flex items-center justify-center text-foreground/60 text-[10px] leading-none"
              style={style}
              aria-hidden
            >
              *
            </div>
          ) : (
            <div key={i} className="star-rain-pixel absolute w-px h-1.5 rounded-sm bg-foreground/60" style={style} />
          );
        })}
      </div>
      <div
        ref={headingRef}
        className="relative z-10 text-center select-none mt-8"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* 1) 볼록 레이어 먼저 (아래에 깔림) */}
        {spot &&
          BULGE_RINGS.map((ring, i) => {
            const mask =
              ring.inner === 0
                ? `radial-gradient(circle ${ring.outer}px at ${spot.x}px ${spot.y}px, black 0, black ${ring.outer}px, transparent ${ring.outer}px)`
                : `radial-gradient(circle ${ring.outer}px at ${spot.x}px ${spot.y}px, transparent 0, transparent ${ring.inner}px, black ${ring.inner}px, black ${ring.outer}px, transparent ${ring.outer}px)`;
            return (
              <div
                key={i}
                aria-hidden
                className="pointer-events-none absolute inset-0 text-center transition-transform duration-300"
                style={{
                  maskImage: mask,
                  WebkitMaskImage: mask,
                  perspective: BULGE_PERSPECTIVE,
                  perspectiveOrigin: `${spot.x}px ${spot.y}px`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div style={{ transform: `translateZ(${ring.z}px)`, transformStyle: "preserve-3d" }}>
                  <h1 className="text-9xl font-rubik-maps text-muted-foreground text-outline">imio.dev</h1>
                  <h1 className="text-9xl font-rubik-maps text-outline-spot absolute inset-0 flex items-center justify-center text-center">
                    imio.dev
                  </h1>
                </div>
              </div>
            );
          })}
        {/* 2) 기본 글자 맨 위에 (z-index로), 원 안만 뚫어서 아래 볼록 레이어가 보이게 */}
        <div className="relative z-10">
          <h1
            className="text-9xl font-rubik-maps text-muted-foreground text-outline"
            style={
              spot
                ? {
                    maskImage: `radial-gradient(circle 150px at ${spot.x}px ${spot.y}px, transparent 0, transparent 150px, black 150px)`,
                    WebkitMaskImage: `radial-gradient(circle 150px at ${spot.x}px ${spot.y}px, transparent 0, transparent 150px, black 150px)`,
                  }
                : undefined
            }
          >
            imio.dev
          </h1>
        </div>
      </div>
      <p className="my-7 text-xs text-chart-1 bg-input border border-border rounded-md px-1 w-fit mx-auto">
        ※ 이 블로그에 쓰인 <span className="font-bold">모든 포스트</span>는 AI가 쓴 글이 아닙니다 ※
      </p>
      <div className="w-full border-b border-border my-2" />
      <div className="flex flex-row items-center justify-center gap-3">
        <a
          href="https://github.com/idoasisay"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:scale-110 transition-transform duration-200"
        >
          <SiGithub size={24} className="text-foreground" />
        </a>
        <a
          href="https://www.linkedin.com/in/%EC%9C%A0%EC%A0%95-%EC%9D%B4-107579207/"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:scale-110 transition-transform duration-200"
        >
          <LinkedInIcon size={24} className="text-foreground" />
        </a>
      </div>
      <div className="w-full border-b border-border my-2" />
      <div className="mt-10 flex flex-col items-center justify-center font-orbit">
        <h1 className="text-xl font-bold">
          어서오세요,{" "}
          <span
            className="px-1"
            style={{
              background:
                "linear-gradient(to right, transparent, hsl(var(--chart-2) / 0.2) 5%, hsl(var(--chart-2) / 0.2) 95%, transparent)",
            }}
          >
            이유정의 DEV BLOG
          </span>
          에!
        </h1>
        <div className="relative w-fit my-2 mb-8">
          {/* 말풍선 꼬리 (위쪽 삼각형, border 트릭) */}
          <div
            className="absolute left-24.5 box-border"
            style={{
              top: "-6px",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderBottom: "10px solid hsl(var(--accent-foreground))",
            }}
            aria-hidden
          />
          <div
            className="text-xs text-accent bg-accent-foreground px-2 py-1 w-fit"
            style={{
              /* 상하단에 물결 효과를 주는 clip-path */
              clipPath:
                "polygon(1% 20%, 15% 0%, 30% 15%, 45% 0%, 60% 15%, 75% 0%, 90% 15%, 100% 15%, 100% 85%, 90% 100%, 75% 85%, 60% 100%, 45% 85%, 30% 100%, 15% 85%, 0% 100%)",
            }}
          >
            문제를 정의하고 해결하는 과정을 좋아합니다
          </div>
        </div>
        <div className="flex flex-col items-center justify-center mb-4">
          <p>배움과 고민의 흔적을 기록하는 공간입니다</p>
          <p>개선 제안이나 질문, 컨택, 커피챗 등등은 언제나</p>
          <p>
            <span className="relative inline-block">
              <button
                type="button"
                onClick={copyEmail}
                className="font-bold underline cursor-pointer underline-offset-4 hover:opacity-100 opacity-40 transition-opacity duration-200"
              >
                {EMAIL}
              </button>
              {copied && (
                <span
                  className="absolute bottom-full left-1/2 px-2 py-1 text-xs font-medium text-accent bg-accent-foreground rounded shadow-sm whitespace-nowrap copy-tooltip-anim"
                  style={{ transformOrigin: "center bottom" }}
                  role="status"
                >
                  Copied!
                </span>
              )}
            </span>
            으로 환영합니다
          </p>
        </div>
        <p>
          저에 대해 더 궁금하시다면ㅡ
          <Link
            href="https://resume.imio.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer bg-chart-1/90 px-1 rounded-md text-accent font-bold font-silkscreen hover:opacity-90"
          >
            CLICK HERE!
          </Link>
        </p>
        <p>
          또는 우측 <span className="bg-chart-2/90 px-1 rounded-md text-accent font-bold font-silkscreen">@Resume</span>
          를 확인해 주세요
        </p>
      </div>
      <div className="flex flex-col items-center justify-center font-orbit my-10">
        <h2 className="font-bold font-silkscreen">category</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-2 font-sans">
          {CATEGORIES.map(({ title, slug, desc }) => (
            <CategoryCard key={slug} title={title} slug={slug} desc={desc} />
          ))}
        </ul>
      </div>
    </article>
  );
}
