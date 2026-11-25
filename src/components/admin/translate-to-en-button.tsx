"use client";

import { useState, useTransition } from "react";
import { Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { translateFaToEnAction } from "@/app/admin/(dashboard)/translate/actions";
import { dispatchRichTextSet } from "@/lib/rich-text-set-event";
import type { TranslateFormat } from "@/lib/translate-format";
import { cn } from "@/lib/utils";

function readNamedField(name: string): string {
  const el = document.querySelector(`[name="${CSS.escape(name)}"]`) as
    HTMLInputElement | HTMLTextAreaElement | null;
  return el?.value ?? "";
}

function writeNamedField(name: string, value: string, format: TranslateFormat) {
  if (format === "html") {
    dispatchRichTextSet(name, value);
    return;
  }

  const el = document.querySelector(`[name="${CSS.escape(name)}"]`) as
    HTMLInputElement | HTMLTextAreaElement | null;
  if (!el) return;

  const prototype = Object.getPrototypeOf(el) as { value?: PropertyDescriptor };
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  descriptor?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

export interface TranslateToEnButtonProps {
  sourceName?: string;
  targetName?: string;
  format?: TranslateFormat;
  getSourceText?: () => string;
  getTargetText?: () => string;
  onTranslated?: (text: string) => void;
  className?: string;
}

/**
 * Reads Persian copy, calls Cloud Translation on the server, and fills the
 * matching English field. Works with uncontrolled form controls (by name) and
 * with controlled nested editors via get/on callbacks.
 */
export function TranslateToEnButton({
  sourceName,
  targetName,
  format = "text",
  getSourceText,
  getTargetText,
  onTranslated,
  className,
}: TranslateToEnButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);

    const source = getSourceText?.() ?? (sourceName ? readNamedField(sourceName) : "");
    if (!source.trim()) {
      setError("ابتدا متن فارسی را وارد کنید.");
      return;
    }

    const existing = getTargetText?.() ?? (targetName ? readNamedField(targetName) : "");
    if (existing.trim()) {
      const replace = window.confirm("متن انگلیسی از قبل پر شده است. با ترجمه جایگزین شود؟");
      if (!replace) return;
    }

    startTransition(async () => {
      const result = await translateFaToEnAction(source, format);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (onTranslated) {
        onTranslated(result.text);
      } else if (targetName) {
        writeNamedField(targetName, result.text, format);
      }
    });
  }

  return (
    <div className={cn("flex shrink-0 flex-col items-end gap-0.5", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isPending}
        className="h-7 gap-1.5 px-2 text-[11px]"
        aria-label="ترجمه متن فارسی به انگلیسی"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Languages className="size-3.5" aria-hidden="true" />
        )}
        ترجمه
      </Button>
      {error && (
        <p className="text-pishnam-danger max-w-[14rem] text-end text-[10px] leading-snug">
          {error}
        </p>
      )}
    </div>
  );
}
