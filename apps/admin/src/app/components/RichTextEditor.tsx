"use client";

import { useEffect, useRef } from "react";
import type Quill from "quill";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function RichTextEditor({ value, onChange }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const lastValueRef = useRef<string>(value);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;
    if (quillRef.current) return;

    let cancelled = false;

    // Defensive cleanup: if React StrictMode mounted/unmounted this component
    // without fully removing DOM, Quill toolbars can be left behind.
    const parentEl = containerEl.parentElement;
    parentEl?.querySelectorAll(".ql-toolbar").forEach((el) => el.remove());
    containerEl.innerHTML = "";
    containerEl.classList.remove("ql-container");

    let toolbarEl: HTMLElement | null = null;
    let handleToolbarMouseDown: (() => void) | null = null;
    let handleChange: (() => void) | null = null;
    let quill: Quill | null = null;

    (async () => {
      const { default: QuillCtor } = await import("quill");
      if (cancelled) return;

      quill = new QuillCtor(containerEl, {
        theme: "snow",
      });
      quillRef.current = quill;

      if (value) {
        quill.clipboard.dangerouslyPasteHTML(value);
        lastValueRef.current = quill.root.innerHTML;
      }

      handleChange = () => {
        if (!quill) return;
        const html = quill.root.innerHTML;
        lastValueRef.current = html;
        onChange(html);
      };

      // Prevent toolbar actions from crashing when selection is null.
      toolbarEl = parentEl?.querySelector(".ql-toolbar") as HTMLElement | null;
      handleToolbarMouseDown = () => {
        if (!quillRef.current) return;
        const range = quillRef.current.getSelection();
        if (range) return;
        quillRef.current.focus();
        quillRef.current.setSelection(
          quillRef.current.getLength(),
          0,
          "silent",
        );
      };
      toolbarEl?.addEventListener("mousedown", handleToolbarMouseDown);

      quill.on("text-change", handleChange);
    })();

    return () => {
      cancelled = true;

      if (quill && handleChange) {
        quill.off("text-change", handleChange);
      }
      quillRef.current = null;

      if (toolbarEl && handleToolbarMouseDown) {
        toolbarEl.removeEventListener("mousedown", handleToolbarMouseDown);
      }
      toolbarEl?.remove();

      // Also remove any stray toolbars under this component.
      parentEl?.querySelectorAll(".ql-toolbar").forEach((el) => el.remove());

      containerEl.innerHTML = "";
      containerEl.classList.remove("ql-container");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    if (value === lastValueRef.current) return;
    if (value === quill.root.innerHTML) return;

    const selection = quill.getSelection();
    quill.clipboard.dangerouslyPasteHTML(value || "");
    if (selection) quill.setSelection(selection);
    lastValueRef.current = quill.root.innerHTML;
  }, [value]);

  return (
    <div ref={rootRef} data-test-id="rich-text-editor" aria-label="Content">
      <div ref={containerRef} />
    </div>
  );
}
