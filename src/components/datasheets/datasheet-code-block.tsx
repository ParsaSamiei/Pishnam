"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { formatFileSize, isDirectDownloadLink } from "@/lib/format";
import { datasheetLanguageSilkscreen } from "@/lib/datasheet-languages";
import { cn } from "@/lib/utils";

interface DatasheetCodeBlockProps {
  title: string;
  language: string;
  code: string;
  notes: string | null;
  fileUrl: string | null;
  fileSource: "HOSTED" | "EXTERNAL" | null;
  fileSizeBytes: number | null;
  downloadLabel: string;
  copiedLabel: string;
  copyLabel: string;
}

export function DatasheetCodeBlock({
  title,
  language,
  code,
  notes,
  fileUrl,
  fileSource,
  fileSizeBytes,
  downloadLabel,
  copiedLabel,
  copyLabel,
}: DatasheetCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code ? code.replace(/\n$/, "").split("\n") : [];
  const isDirect = fileUrl ? isDirectDownloadLink(fileUrl, fileSource ?? undefined) : false;

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="border-border overflow-hidden rounded-xl border">
      <div className="bg-pishnam-navy-900 text-pishnam-off-white flex flex-wrap items-center gap-3 px-4 py-2.5">
        <span className="flex items-center gap-1" aria-hidden="true">
          <span className="bg-pishnam-gold-500 size-1.5 rounded-full" />
          <span className="bg-pishnam-gold-500/60 size-1.5 rounded-full" />
        </span>
        <h3 className="min-w-0 flex-1 text-sm font-semibold">{title}</h3>
        <span
          className="text-pishnam-gold-500 font-mono text-[10px] tracking-[0.2em] uppercase"
          dir="ltr"
        >
          {datasheetLanguageSilkscreen(language)}
        </span>
        {code ? (
          <button
            type="button"
            onClick={copyCode}
            className="text-pishnam-off-white/80 hover:text-pishnam-gold-500 focus-visible:ring-pishnam-gold-500 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none"
          >
            {copied ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
            {copied ? copiedLabel : copyLabel}
          </button>
        ) : null}
      </div>

      {code ? (
        <pre
          className="max-h-[28rem] overflow-auto bg-[#121920] p-4 text-[13px] leading-relaxed"
          dir="ltr"
        >
          <code className="text-pishnam-off-white/90 font-mono">
            {lines.map((line, index) => (
              <span key={index} className="flex gap-4">
                <span className="text-pishnam-off-white/30 w-6 shrink-0 text-end tabular-nums select-none">
                  {index + 1}
                </span>
                <span className="min-w-0 whitespace-pre">{line || " "}</span>
              </span>
            ))}
          </code>
        </pre>
      ) : null}

      {(notes || fileUrl) && (
        <div className="border-border bg-bg-surface-alt flex flex-wrap items-start justify-between gap-3 border-t px-4 py-3">
          {notes ? <p className="text-text-secondary max-w-2xl text-sm">{notes}</p> : <span />}
          {fileUrl ? (
            <a
              href={fileUrl}
              target={isDirect ? undefined : "_blank"}
              rel={isDirect ? undefined : "noopener noreferrer"}
              download={isDirect || undefined}
              className={cn(
                "bg-pishnam-gold-500 text-pishnam-navy-900 hover:bg-pishnam-gold-600",
                "focus-visible:ring-pishnam-gold-500 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none",
              )}
            >
              <Download className="size-3.5" aria-hidden="true" />
              {downloadLabel}
              {fileSizeBytes ? (
                <span className="font-normal opacity-80">{formatFileSize(fileSizeBytes)}</span>
              ) : null}
            </a>
          ) : null}
        </div>
      )}
    </article>
  );
}
