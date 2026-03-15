"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { RepresentativeImageContext } from "./RepresentativeImageContext";
import { Flame } from "lucide-react";

const MIN_IMAGE_WIDTH = 120;

export function ImageWithBadge({ node, HTMLAttributes, selected, updateAttributes }) {
  const representativeImageUrl = useContext(RepresentativeImageContext);
  const isRepresentative = representativeImageUrl && node.attrs.src === representativeImageUrl;
  const wrapperRef = useRef(null);
  const imageRef = useRef(null);
  const resizeStateRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const w = node.attrs.width;
  const align = node.attrs.align ?? "left";
  const alignClass =
    align === "center"
      ? "block w-max max-w-full mx-auto"
      : align === "right"
        ? "block w-max max-w-full ml-auto"
        : "inline-block max-w-full";
  const sizeStyle = w != null ? { width: `${Number(w)}px` } : undefined;

  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = event => {
      const state = resizeStateRef.current;
      if (!state) return;
      const nextWidth = Math.round(state.startWidth + (event.clientX - state.startX));
      const boundedWidth = Math.max(MIN_IMAGE_WIDTH, Math.min(state.maxWidth, nextWidth));
      updateAttributes({ width: boundedWidth, height: null });
    };

    const handlePointerUp = () => {
      resizeStateRef.current = null;
      setIsResizing(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isResizing, updateAttributes]);

  const handleResizeStart = event => {
    event.preventDefault();
    event.stopPropagation();

    const wrapper = wrapperRef.current;
    const image = imageRef.current;
    if (!wrapper || !image) return;

    const editorRoot = wrapper.closest(".tiptap-editor");
    const editorWidth = editorRoot?.clientWidth ?? wrapper.parentElement?.clientWidth ?? wrapper.clientWidth;
    const naturalWidth = image.naturalWidth || editorWidth;
    const maxWidth = Math.max(MIN_IMAGE_WIDTH, Math.min(editorWidth, naturalWidth));
    const startWidth = wrapper.getBoundingClientRect().width;

    resizeStateRef.current = {
      startX: event.clientX,
      startWidth,
      maxWidth,
    };
    setIsResizing(true);
  };

  return (
    <NodeViewWrapper
      as="div"
      ref={wrapperRef}
      className={`relative rounded-md ${alignClass} [&_img]:block [&_img]:rounded-md [&_img]:align-top ${selected ? "ring-2 ring-ring ring-offset-0 ring-offset-background" : ""} ${isResizing ? "select-none" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        {...HTMLAttributes}
        alt={HTMLAttributes.alt ?? ""}
        draggable={false}
        style={{ ...sizeStyle, maxWidth: "100%", height: "auto" }}
      />
      {isRepresentative && (
        <div
          className="absolute left-0 top-0 bg-primary text-primary p-1 pt-0.5 ml-2 rounded-br-md rounded-bl-md"
          aria-hidden
        >
          <Flame size={24} className="fill-chart-1 stroke-primary" />
        </div>
      )}
      {selected && (
        <button
          type="button"
          onPointerDown={handleResizeStart}
          className="absolute bottom-2 right-2 z-10 h-4 w-4 cursor-se-resize rounded-sm border border-background bg-primary shadow-sm touch-none after:absolute after:inset-[3px] after:border-b-2 after:border-r-2 after:border-primary-foreground after:content-['']"
          aria-label="이미지 크기 조절"
          title="드래그해서 이미지 크기 조절"
        />
      )}
    </NodeViewWrapper>
  );
}
