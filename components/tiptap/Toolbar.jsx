"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Underline as UnderlineIcon,
  Highlighter,
  Link as LinkIcon,
  Superscript as SuperscriptIcon,
  Image as ImageIcon,
  SquareCode,
  TextAlignStart,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignJustify,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, active, FONT_FAMILIES, COLOR_PRESETS } from "./constants";

const SEP = <span className="mx-1 h-5 w-px bg-border" aria-hidden />;

export function Toolbar({ editor }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageOpen, setImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [colorOpen, setColorOpen] = useState(false);
  const linkInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const linkWrapRef = useRef(null);
  const imageWrapRef = useRef(null);
  const colorWrapRef = useRef(null);

  useEffect(() => {
    if (linkOpen && linkInputRef.current) linkInputRef.current.focus();
  }, [linkOpen]);
  useEffect(() => {
    if (imageOpen && imageInputRef.current) imageInputRef.current.focus();
  }, [imageOpen]);

  useEffect(() => {
    const close = e => {
      if (linkOpen && linkWrapRef.current && !linkWrapRef.current.contains(e.target)) setLinkOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [linkOpen]);
  useEffect(() => {
    const close = e => {
      if (imageOpen && imageWrapRef.current && !imageWrapRef.current.contains(e.target)) setImageOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [imageOpen]);
  useEffect(() => {
    const close = e => {
      if (colorOpen && colorWrapRef.current && !colorWrapRef.current.contains(e.target)) setColorOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [colorOpen]);

  if (!editor) return null;

  const applyLink = () => {
    const href = linkUrl.trim();
    if (href) editor.chain().focus().setLink({ href }).run();
    setLinkUrl("");
    setLinkOpen(false);
  };
  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setLinkUrl("");
    setLinkOpen(false);
  };
  const applyImage = () => {
    const src = imageUrl.trim();
    if (src) editor.chain().focus().setImage({ src }).run();
    setImageUrl("");
    setImageOpen(false);
  };

  const currentLink = editor.getAttributes("link").href ?? "";

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-t border-border bg-muted/30 px-1 py-1">
      {/* 1. Heading / Paragraph */}
      <select
        value={
          editor.isActive("heading", { level: 1 })
            ? "h1"
            : editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
                ? "h3"
                : "p"
        }
        onChange={e => {
          const v = e.target.value;
          if (v === "p") editor.chain().focus().setParagraph().run();
          else
            editor
              .chain()
              .focus()
              .toggleHeading({ level: Number(v.slice(1)) })
              .run();
        }}
        className={cn(
          "h-8 min-w-[4rem] cursor-pointer rounded border-0 bg-transparent px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
          editor.isActive("heading") && active
        )}
        title="제목/문단"
      >
        <option value="p">문단</option>
        <option value="h1">제목 1</option>
        <option value="h2">제목 2</option>
        <option value="h3">제목 3</option>
      </select>
      {SEP}

      {/* 2. List */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(btn, editor.isActive("bulletList") && active)}
        title="글머리 목록"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(btn, editor.isActive("orderedList") && active)}
        title="번호 목록"
      >
        <ListOrdered size={16} />
      </button>
      {SEP}

      {/* 15. Text color (dropdown) */}
      <div ref={colorWrapRef} className="relative">
        <button
          type="button"
          onClick={() => setColorOpen(o => !o)}
          className={cn(btn, editor.getAttributes("textStyle").color && active)}
          title="글자 색"
        >
          <span
            className="inline-block size-4 rounded border border-border"
            style={{ backgroundColor: editor.getAttributes("textStyle").color || "#000000" }}
          />
        </button>
        {colorOpen && (
          <div className="absolute left-0 top-full z-20 mt-1 w-[11rem] rounded-md border border-border bg-background p-3 shadow-md">
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(c).run();
                    setColorOpen(false);
                  }}
                  className={cn(
                    "aspect-square w-full min-w-0 rounded border border-border transition-opacity hover:opacity-90",
                    (editor.getAttributes("textStyle").color || "#000000").toLowerCase() === c.toLowerCase() &&
                      "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              <input
                type="color"
                value={(editor.getAttributes("textStyle").color || "#000000").replace(
                  /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/,
                  (_, r, g, b) => "#" + [r, g, b].map(x => Number(x).toString(16).padStart(2, "0")).join("")
                )}
                onChange={e => editor.chain().focus().setColor(e.target.value).run()}
                className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0"
              />
              <span className="text-xs text-muted-foreground">커스텀</span>
            </div>
          </div>
        )}
      </div>
      {SEP}

      {/* 3. BlockQuote */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(btn, editor.isActive("blockquote") && active)}
        title="인용"
      >
        <Quote size={16} />
      </button>
      {SEP}

      {/* 4. Code Block */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(btn, editor.isActive("codeBlock") && active)}
        title="코드 블록"
      >
        <SquareCode size={16} />
      </button>
      {SEP}

      {/* 5–8. Bold, Italic, Strike, Code */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(btn, editor.isActive("bold") && active)}
        title="굵게"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(btn, editor.isActive("italic") && active)}
        title="기울임"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(btn, editor.isActive("strike") && active)}
        title="취소선"
      >
        <Strikethrough size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(btn, editor.isActive("code") && active)}
        title="인라인 코드"
      >
        <Code size={16} />
      </button>
      {SEP}

      {/* 9. Underline */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(btn, editor.isActive("underline") && active)}
        title="밑줄"
      >
        <UnderlineIcon size={16} />
      </button>

      {/* 10. Highlight */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={cn(btn, editor.isActive("highlight") && active)}
        title="형광펜"
      >
        <Highlighter size={16} />
      </button>
      {SEP}

      {/* 11. Link */}
      <div ref={linkWrapRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setLinkUrl(currentLink);
            setLinkOpen(o => !o);
          }}
          className={cn(btn, editor.isActive("link") && active)}
          title="링크"
        >
          <LinkIcon size={16} />
        </button>
        {linkOpen && (
          <div className="absolute left-0 top-full z-20 mt-1 flex flex-col gap-1 rounded-md border border-border bg-background p-2 shadow-md">
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applyLink()}
              placeholder="https://..."
              className="w-56 rounded border border-border bg-background px-2 py-1 text-sm outline-none"
            />
            <div className="flex gap-1">
              <button
                type="button"
                onClick={applyLink}
                className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
              >
                적용
              </button>
              <button type="button" onClick={removeLink} className="rounded bg-muted px-2 py-1 text-xs">
                제거
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 12. SuperScript */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        className={cn(btn, editor.isActive("superscript") && active)}
        title="위 첨자"
      >
        <SuperscriptIcon size={16} />
      </button>
      {SEP}

      {/* 13. Align */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={cn(btn, editor.isActive({ textAlign: "left" }) && active)}
        title="왼쪽 정렬"
      >
        <TextAlignStart size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={cn(btn, editor.isActive({ textAlign: "center" }) && active)}
        title="가운데 정렬"
      >
        <TextAlignCenter size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={cn(btn, editor.isActive({ textAlign: "right" }) && active)}
        title="오른쪽 정렬"
      >
        <TextAlignEnd size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        className={cn(btn, editor.isActive({ textAlign: "justify" }) && active)}
        title="양쪽 정렬"
      >
        <TextAlignJustify size={16} />
      </button>
      {SEP}

      {/* 14. Image */}
      <div ref={imageWrapRef} className="relative">
        <button type="button" onClick={() => setImageOpen(o => !o)} className={btn} title="이미지">
          <ImageIcon size={16} />
        </button>
        {imageOpen && (
          <div className="absolute left-0 top-full z-20 mt-1 flex flex-col gap-1 rounded-md border border-border bg-background p-2 shadow-md">
            <input
              ref={imageInputRef}
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applyImage()}
              placeholder="https://..."
              className="w-56 rounded border border-border bg-background px-2 py-1 text-sm outline-none"
            />
            <button
              type="button"
              onClick={applyImage}
              className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
            >
              삽입
            </button>
          </div>
        )}
      </div>
      {SEP}

      {/* 16. Font family */}
      <select
        value={editor.getAttributes("textStyle").fontFamily || ""}
        onChange={e => {
          const v = e.target.value;
          if (v) editor.chain().focus().setFontFamily(v).run();
          else editor.chain().focus().unsetFontFamily().run();
        }}
        className={cn(
          "h-8 min-w-[4rem] cursor-pointer rounded border-0 bg-transparent px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
          editor.getAttributes("textStyle").fontFamily && active
        )}
        title="글꼴"
      >
        {FONT_FAMILIES.map(({ value, label }) => (
          <option key={value || "default"} value={value}>
            {label}
          </option>
        ))}
      </select>

      {SEP}
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn} title="실행 취소">
        <Undo size={16} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn} title="다시 실행">
        <Redo size={16} />
      </button>
    </div>
  );
}
