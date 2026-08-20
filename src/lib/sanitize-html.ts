import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes rich-text HTML before it's ever rendered via
 * dangerouslySetInnerHTML -- applies to Course.translations[].body and
 * Article.translations[].body (Tiptap output stored in Postgres).
 *
 * Content only ever comes from authenticated admin users (no public
 * submission path writes to these fields), but sanitizing on the way out
 * is cheap defense-in-depth against a compromised/careless admin session
 * or a future contributor role, rather than trusting every writer forever.
 */
export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "h2",
      "h3",
      "h4",
      "blockquote",
      "code",
      "pre",
      "img",
      "hr",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title"],
  });
}
