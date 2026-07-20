"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAssetUrl, uploadBlogImage } from "@/lib/api";

type TypewriterEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export type TypewriterEditorHandle = {
  /** Upload any blob: images in the current HTML, replace with permanent URLs, return final HTML. */
  persistContent: () => Promise<string>;
  /** Revoke local blob URLs without uploading (abandon draft / close drawer). */
  discardPending: () => void;
  getHtml: () => string;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:opacity-40",
        active && "bg-[#fff3ef] text-[#e34b32]"
      )}
    >
      {children}
    </button>
  );
}

export const TypewriterEditor = forwardRef<TypewriterEditorHandle, TypewriterEditorProps>(
  function TypewriterEditor(
    { value, onChange, placeholder = "Start writing your blog…", className },
    ref
  ) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingImagesRef = useRef(new Map<string, File>());
    const [persisting, setPersisting] = useState(false);

    const revokeBlob = useCallback((url: string) => {
      if (url.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      }
    }, []);

    const discardPending = useCallback(() => {
      for (const url of pendingImagesRef.current.keys()) {
        revokeBlob(url);
      }
      pendingImagesRef.current.clear();
    }, [revokeBlob]);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { class: "text-[#e34b32] underline" },
        }),
        Image.configure({
          HTMLAttributes: { class: "rounded-xl max-w-full h-auto my-4" },
        }),
        Placeholder.configure({ placeholder }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
      ],
      content: value || "",
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            "typewriter-content min-h-[280px] px-4 py-3 text-sm leading-7 text-slate-800 outline-none focus:outline-none",
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChange(ed.getHTML());
      },
    });

    useEffect(() => {
      if (!editor) return;
      const current = editor.getHTML();
      const next = value || "";
      if (next !== current) {
        editor.commands.setContent(next, { emitUpdate: false });
      }
    }, [value, editor]);

    // Cleanup blob URLs only when the editor unmounts (e.g. drawer closed without save)
    useEffect(() => {
      const pending = pendingImagesRef;
      return () => {
        for (const url of pending.current.keys()) {
          try {
            URL.revokeObjectURL(url);
          } catch {
            // ignore
          }
        }
        pending.current.clear();
      };
    }, []);

    const persistContent = useCallback(async () => {
      if (!editor) return value || "";

      setPersisting(true);
      try {
        let html = editor.getHTML();

        // Drop pending entries no longer referenced in HTML
        for (const [blobUrl] of [...pendingImagesRef.current.entries()]) {
          if (!html.includes(blobUrl)) {
            revokeBlob(blobUrl);
            pendingImagesRef.current.delete(blobUrl);
          }
        }

        // Upload remaining blob images and rewrite HTML
        for (const [blobUrl, file] of [...pendingImagesRef.current.entries()]) {
          if (!html.includes(blobUrl)) continue;
          const result = await uploadBlogImage(file);
          const permanentSrc = getAssetUrl(result.filename) || result.url;
          html = html.split(blobUrl).join(permanentSrc);
          revokeBlob(blobUrl);
          pendingImagesRef.current.delete(blobUrl);
        }

        // Also catch any leftover blob: URLs without a File (shouldn't happen)
        const leftoverBlobs = html.match(/blob:[^"'\s>]+/g) || [];
        if (leftoverBlobs.length > 0) {
          throw new Error(
            "Some images could not be uploaded. Please re-insert them and try again."
          );
        }

        editor.commands.setContent(html, { emitUpdate: false });
        onChange(html);
        return html;
      } finally {
        setPersisting(false);
      }
    }, [editor, onChange, revokeBlob, value]);

    useImperativeHandle(
      ref,
      () => ({
        persistContent,
        discardPending,
        getHtml: () => editor?.getHTML() || value || "",
      }),
      [persistContent, discardPending, editor, value]
    );

    const setLink = useCallback(() => {
      if (!editor) return;
      const previous = editor.getAttributes("link").href as string | undefined;
      const url = window.prompt("Enter URL", previous || "https://");
      if (url === null) return;
      if (url.trim() === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    }, [editor]);

    const insertImageFile = (file: File) => {
      if (!editor) return;
      if (!file.type.startsWith("image/")) {
        window.alert("Please choose an image file.");
        return;
      }
      // Local preview only — upload happens on Save via persistContent()
      const blobUrl = URL.createObjectURL(file);
      pendingImagesRef.current.set(blobUrl, file);
      editor.chain().focus().setImage({ src: blobUrl }).run();
    };

    if (!editor) {
      return (
        <div
          className={cn(
            "flex min-h-[320px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50",
            className
          )}
        >
          <Loader2 className="animate-spin text-slate-400" size={20} />
        </div>
      );
    }

    return (
      <div className={cn("overflow-hidden rounded-xl border border-slate-200 bg-white", className)}>
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-100 bg-slate-50/80 px-2 py-1.5">
          <ToolbarButton
            title="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Strikethrough"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough size={15} />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-slate-200" />
          <ToolbarButton
            title="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Heading 3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Quote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote size={15} />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-slate-200" />
          <ToolbarButton
            title="Align left"
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Align center"
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Align right"
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight size={15} />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-slate-200" />
          <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}>
            <Link2 size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Insert image (uploads on save)"
            disabled={persisting}
            onClick={() => fileInputRef.current?.click()}
          >
            {persisting ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-slate-200" />
          <ToolbarButton
            title="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo2 size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo2 size={15} />
          </ToolbarButton>
        </div>

        <EditorContent editor={editor} />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) insertImageFile(file);
            e.target.value = "";
          }}
        />
      </div>
    );
  }
);

export function isEmptyHtml(html: string) {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text.length === 0;
}
