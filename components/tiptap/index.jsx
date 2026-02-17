"use client";

import { useState, useCallback, useSyncExternalStore, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { Upload } from "lucide-react";
import { Toolbar } from "./Toolbar";
import { PublishSidebar } from "./PublishSidebar";
import { savePost } from "@/features/blog/actions/savePost";

/** @typedef {{ id: string; name: string; slug: string }} CategoryItem */
/** @typedef {{ id: string; name: string; slug: string }} TagItem */
/** @typedef {{ id: string; slug: string; title: string; content: string; category_id: string; tag_ids: string[]; published_at: string | null }} PostForEdit */

/**
 * @param {{ categories?: CategoryItem[]; tags?: TagItem[]; initialPost?: PostForEdit | null }} props
 */
export default function TiptapEditor({ categories = [], tags = [], initialPost = null }) {
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [publishSidebarOpen, setPublishSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Link.configure({ openOnClick: false }),
      Superscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ allowBase64: false }),
      TextStyle,
      Color,
      FontFamily,
    ],
    content: initialPost?.content ?? "<p>Hello World! 🌎</p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
  });

  const initialPostId = initialPost?.id ?? null;
  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title);
      if (editor) editor.commands.setContent(initialPost.content, false);
    } else {
      setTitle("");
    }
    // initialPost identity not in deps: only sync when switching to another post (id) or editor ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPostId, editor]);

  const editorVersion = useSyncExternalStore(
    useCallback(
      onStoreChange => {
        if (!editor) return () => {};
        const fn = () => {
          editor.storage.updateVersion = (editor.storage.updateVersion ?? 0) + 1;
          onStoreChange();
        };
        editor.on("selectionUpdate", fn);
        editor.on("transaction", fn);
        return () => {
          editor.off("selectionUpdate", fn);
          editor.off("transaction", fn);
        };
      },
      [editor]
    ),
    useCallback(() => editor?.storage?.updateVersion ?? 0, [editor]),
    () => 0
  );
  void editorVersion;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex items-center gap-2 bg-background">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="제목"
          className="min-w-0 flex-1 bg-transparent px-3 py-[5.5px] text-lg font-medium outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={() => setPublishSidebarOpen(true)}
          className="mx-1.5 flex shrink-0 items-center gap-1 rounded-md bg-primary px-2 py-1 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Upload size={12} />
          발행
        </button>
      </div>
      <Toolbar editor={editor} />
      <div
        className="min-h-0 flex-1 overflow-y-auto cursor-text outline-none [&_.tiptap-editor]:outline-none [&_.tiptap-editor]:ring-0 [&_.tiptap-editor]:shadow-none"
        onClick={() => editor?.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>

      <PublishSidebar
        key={initialPost?.id ?? "new"}
        open={publishSidebarOpen}
        onClose={() => setPublishSidebarOpen(false)}
        categories={categories}
        tags={tags}
        initialCategoryId={initialPost?.category_id ?? ""}
        initialTagIds={initialPost?.tag_ids ?? []}
        initialPublishAt={initialPost?.published_at ?? null}
        isSaving={isSaving}
        onSave={async payload => {
          if (!editor) return;
          setIsSaving(true);
          try {
            const result = await savePost({
              ...payload,
              postId: initialPost?.id,
              title: title.trim() || "제목 없음",
              content: editor.getHTML(),
            });
            if (result.ok) {
              setPublishSidebarOpen(false);
              if (payload.published) {
                window.alert("발행되었습니다.");
                window.location.href = `/blog/${result.slug}`;
              }
            } else {
              window.alert(result.error || "저장에 실패했습니다. 다시 시도해 주세요.");
            }
          } catch (err) {
            window.alert(err?.message || "저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
          } finally {
            setIsSaving(false);
          }
        }}
      />
    </div>
  );
}
