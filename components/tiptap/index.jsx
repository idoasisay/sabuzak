"use client";

import { useState, useEffect } from "react";
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
import { savePost } from "@/features/blog";

/** @typedef {{ id: string; name: string; slug: string }} CategoryItem */
/** @typedef {{ id: string; name: string; slug: string }} TagItem */

/**
 * @param {{ categories?: CategoryItem[]; tags?: TagItem[] }} props
 */
export default function TiptapEditor({ categories = [], tags = [] }) {
  const [title, setTitle] = useState("");
  const [updateTrigger, setUpdateTrigger] = useState(0);
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
    content: "<p>Hello World! 🌎</p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const onUpdate = () => setUpdateTrigger(n => n + 1);
    editor.on("selectionUpdate", onUpdate);
    editor.on("transaction", onUpdate);
    return () => {
      editor.off("selectionUpdate", onUpdate);
      editor.off("transaction", onUpdate);
    };
  }, [editor]);

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
      <Toolbar editor={editor} updateTrigger={updateTrigger} />
      <div className="min-h-0 flex-1 overflow-y-auto cursor-text" onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>

      <PublishSidebar
        open={publishSidebarOpen}
        onClose={() => setPublishSidebarOpen(false)}
        categories={categories}
        tags={tags}
        isSaving={isSaving}
        onSave={async payload => {
          if (!editor) return;
          setIsSaving(true);
          try {
            const result = await savePost({
              ...payload,
              title: title.trim() || "제목 없음",
              content: editor.getHTML(),
            });
            if (result.ok) {
              setPublishSidebarOpen(false);
              if (payload.published) {
                window.alert("발행되었습니다.");
                window.location.href = `/blog/${result.slug}`;
              }
            }
          } finally {
            setIsSaving(false);
          }
        }}
      />
    </div>
  );
}
