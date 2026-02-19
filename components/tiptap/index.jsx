"use client";

import { useState, useRef, useCallback, useSyncExternalStore, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { RepresentativeImageContext } from "./RepresentativeImageContext";
import { ImageWithRepresentativeExtension } from "./ImageWithRepresentativeExtension";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { Upload } from "lucide-react";
import { Toolbar } from "./Toolbar";
import { PublishSidebar } from "./PublishSidebar";
import { savePost } from "@/features/blog/actions/savePost";
import { uploadImage } from "@/features/blog/actions/uploadImage";

/** 새 글 기본 본문 (빈 문단 여러 개로 최소 높이 확보) */
const EMPTY_CONTENT = Array(14).fill("<p></p>").join("");

/** @typedef {{ id: string; name: string; slug: string }} CategoryItem */
/** @typedef {{ id: string; name: string; slug: string }} TagItem */
/** @typedef {{ id: string; slug: string; title: string; content: string; category_id: string; tag_ids: string[]; published_at: string | null; thumbnail_url?: string | null }} PostForEdit */

/**
 * @param {{ categories?: CategoryItem[]; tags?: TagItem[]; initialPost?: PostForEdit | null }} props
 */
export default function TiptapEditor({ categories = [], tags = [], initialPost = null }) {
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [publishSidebarOpen, setPublishSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [representativeImageUrl, setRepresentativeImageUrl] = useState(initialPost?.thumbnail_url ?? null);
  const pendingImageFiles = useRef(/** @type {Record<string, File>} */ ({}));
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Link.configure({ openOnClick: false }),
      Superscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ImageWithRepresentativeExtension.configure({ allowBase64: false }),
      TextStyle,
      Color,
      FontFamily,
    ],
    content: initialPost?.content ?? EMPTY_CONTENT,
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
      setRepresentativeImageUrl(initialPost.thumbnail_url ?? null);
      if (editor) editor.commands.setContent(initialPost.content, false);
    } else {
      setTitle("");
      setRepresentativeImageUrl(null);
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

  const handleImageFileSelect = useCallback(
    file => {
      if (!editor) return;
      const blobUrl = URL.createObjectURL(file);
      pendingImageFiles.current[blobUrl] = file;
      editor.chain().focus().setImage({ src: blobUrl }).run();
    },
    [editor]
  );

  return (
    <RepresentativeImageContext.Provider value={representativeImageUrl}>
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
        <Toolbar
          editor={editor}
          representativeImageUrl={representativeImageUrl}
          onSetThumbnail={setRepresentativeImageUrl}
          onImageFileSelect={handleImageFileSelect}
        />
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
              let content = editor.getHTML();
              let thumbnailToSave = representativeImageUrl ?? null;
              const blobUrlRegex = /src=["'](blob:[^"']+)["']/g;
              const blobUrls = [];
              let m;
              while ((m = blobUrlRegex.exec(content)) !== null) blobUrls.push(m[1]);
              const uniqueBlobUrls = [...new Set(blobUrls)];
              for (const blobUrl of uniqueBlobUrls) {
                const file = pendingImageFiles.current[blobUrl];
                if (!file) continue;
                const formData = new FormData();
                formData.append("file", file);
                const upResult = await uploadImage(formData);
                if (upResult.ok) {
                  content = content.split(blobUrl).join(upResult.url);
                  if (representativeImageUrl === blobUrl) {
                    thumbnailToSave = upResult.url;
                    setRepresentativeImageUrl(upResult.url);
                  }
                }
                URL.revokeObjectURL(blobUrl);
                delete pendingImageFiles.current[blobUrl];
              }
              const result = await savePost({
                ...payload,
                postId: initialPost?.id,
                title: title.trim() || "제목 없음",
                content,
                thumbnailUrl: thumbnailToSave,
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
    </RepresentativeImageContext.Provider>
  );
}
