"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  LinkIcon,
  ImageIcon,
  Undo,
  Redo,
} from "lucide-react";
import { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  /** Form field name -- the current HTML is mirrored into a hidden input under this name. */
  name: string;
  defaultValue?: string;
  error?: string;
}

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "text-text-secondary hover:bg-bg-surface-alt hover:text-text-primary flex size-8 items-center justify-center rounded-md transition-colors",
        active && "bg-pishnam-gold-500/15 text-pishnam-gold-600",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Rich text editor for Course/Article body fields, per docs/06-admin-panel.md
 * ("rich text editor -- Tiptap, matching the tool already used elsewhere in
 * Pishnam's stack"). Renders its live HTML into a hidden input on every
 * update, so it works inside a plain <form action={serverAction}> without
 * any client-side submit wiring -- the server action reads `name` out of
 * FormData exactly like any other field, then runs it through
 * sanitizeRichText() before ever storing or rendering it (see
 * lib/sanitize-html.ts) -- this editor's own allowlisted extensions are a
 * UX constraint, not the security boundary.
 */
export function RichTextEditor({ name, defaultValue = "", error }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      TiptapImage,
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class:
          "prose-pishnam min-h-[200px] max-w-none rounded-b-md border border-t-0 border-border bg-bg-surface px-3 py-2.5 text-sm text-text-primary focus:outline-none [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-bold [&_blockquote]:border-s-4 [&_blockquote]:border-pishnam-gold-500 [&_blockquote]:ps-3",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    // A full link-picker dialog isn't worth the complexity for this
    // admin-only tool -- window.prompt is fine here.
    const url = window.prompt("آدرس لینک را وارد کنید:", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    // See setLink() above re: window.prompt.
    const url = window.prompt(
      "آدرس تصویر را وارد کنید (ابتدا از فیلد تصویر شاخص آپلود کنید یا لینک مستقیم بدهید):",
    );
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  // Keep the hidden input's value in sync so plain FormData submission picks
  // up the latest HTML without any onSubmit wiring.
  useEffect(() => {
    if (!editor) return;
    const hiddenInput = document.getElementById(`richtext-${name}`) as HTMLInputElement | null;
    if (hiddenInput) hiddenInput.value = editor.getHTML();

    function handleUpdate() {
      if (hiddenInput) hiddenInput.value = editor!.getHTML();
    }
    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, name]);

  if (!editor) return null;

  return (
    <div>
      <input type="hidden" id={`richtext-${name}`} name={name} defaultValue={defaultValue} />
      <div className="border-border bg-bg-surface-alt flex flex-wrap items-center gap-0.5 rounded-t-md border p-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          label="Bold"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          label="Italic"
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          label="Strikethrough"
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <div className="bg-border mx-1 h-5 w-px" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          label="Heading 2"
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          label="Heading 3"
        >
          <Heading3 className="size-4" />
        </ToolbarButton>
        <div className="bg-border mx-1 h-5 w-px" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          label="Bullet list"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          label="Numbered list"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          label="Quote"
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <div className="bg-border mx-1 h-5 w-px" />
        <ToolbarButton onClick={setLink} active={editor.isActive("link")} label="Link">
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} label="Image">
          <ImageIcon className="size-4" />
        </ToolbarButton>
        <div className="bg-border mx-1 h-5 w-px" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} label="Undo">
          <Undo className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} label="Redo">
          <Redo className="size-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
      {error && <p className="text-pishnam-danger mt-1 text-xs">{error}</p>}
    </div>
  );
}
