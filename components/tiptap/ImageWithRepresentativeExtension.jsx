"use client";

import { mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageWithBadge } from "./ImageWithBadge";

/** Image 확장 + 대표 이미지일 때 "대표" 뱃지 + align 속성(왼쪽/가운데/오른쪽) */
export const ImageWithRepresentativeExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
        parseHTML: el => el.getAttribute("data-align") || null,
        renderHTML: attrs => (attrs.align ? { "data-align": attrs.align } : {}),
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const align = node.attrs.align;
    const extra = align ? { "data-align": align } : {};
    return ["img", mergeAttributes(this.options.HTMLAttributes ?? {}, HTMLAttributes, extra)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageWithBadge);
  },
});
