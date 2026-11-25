import { sanitizeRichText } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";

export function RichText({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose-pishnam text-text-primary max-w-none",
        "[&_a]:text-pishnam-steel-600 [&_a]:underline [&_a]:underline-offset-2",
        "[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold",
        "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold",
        "[&_p]:mb-3 [&_p]:leading-relaxed",
        "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:ps-6",
        "[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:ps-6",
        "[&_blockquote]:border-pishnam-gold-500 [&_blockquote]:text-text-secondary [&_blockquote]:border-s-4 [&_blockquote]:ps-4",
        "[&_img]:rounded-lg",
        className,
      )}
      // Sanitized above -- see lib/sanitize-html.ts.
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
    />
  );
}
