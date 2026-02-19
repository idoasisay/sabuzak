"use client";

import { useContext } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { RepresentativeImageContext } from "./RepresentativeImageContext";
import { Flame } from "lucide-react";

export function ImageWithBadge({ node, HTMLAttributes, selected }) {
  const representativeImageUrl = useContext(RepresentativeImageContext);
  const isRepresentative = representativeImageUrl && node.attrs.src === representativeImageUrl;
  const w = node.attrs.width;
  const h = node.attrs.height;
  const align = node.attrs.align ?? "left";
  const alignClass =
    align === "center"
      ? "block w-max max-w-full mx-auto"
      : align === "right"
        ? "block w-max max-w-full ml-auto"
        : "inline-block max-w-full";
  const sizeStyle =
    w != null || h != null
      ? { width: w != null ? `${Number(w)}px` : undefined, height: h != null ? `${Number(h)}px` : undefined }
      : undefined;

  return (
    <NodeViewWrapper
      as="div"
      className={`relative rounded-md ${alignClass} [&_img]:block [&_img]:rounded-md [&_img]:align-top ${selected ? "ring-2 ring-ring ring-offset-0 ring-offset-background" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...HTMLAttributes}
        alt={HTMLAttributes.alt ?? ""}
        style={{ ...sizeStyle, maxWidth: "100%", height: h != null ? `${Number(h)}px` : "auto" }}
      />
      {isRepresentative && (
        <div
          className="absolute left-0 top-0 bg-primary text-primary p-1 pt-0.5 ml-2 rounded-br-md rounded-bl-md"
          aria-hidden
        >
          <Flame size={24} className="fill-chart-1 stroke-primary" />
        </div>
      )}
    </NodeViewWrapper>
  );
}
