/**
 * Client-safe upload allowlists and policy keys.
 *
 * Keep this module free of Node-only imports (sharp, fs, etc.) so admin
 * form components can share the same constants the server enforces.
 */

type UploadKind = "image" | "document" | "archive";

interface FieldPolicy {
  kind: UploadKind;
  allowedMimeTypes: readonly string[];
  maxBytes: number;
}

/**
 * Shared allowlist for download-center hosted files (software releases,
 * datasheets, books, component libraries). Keep in sync with
 * DOWNLOAD_ACCEPT used by the admin file pickers.
 *
 * text/plain is allowed but has no magic bytes -- see tryDetectPlainText
 * in upload.ts.
 */
export const DOWNLOAD_CENTER_MIME_TYPES = [
  "application/zip",
  "application/x-rar-compressed",
  "application/gzip", // .gz and .tar.gz (file-type reports both as gzip)
  "application/x-tar",
  "application/x-7z-compressed",
  "application/x-bzip2",
  "application/x-xz",
  "application/x-apple-diskimage", // .dmg
  "application/x-msdownload", // .exe
  "application/vnd.android.package-archive", // .apk
  "application/pdf",
  "application/epub+zip",
  "image/jpeg",
  "image/png",
  "text/plain",
] as const;

/** Browser `accept` attribute matching DOWNLOAD_CENTER_MIME_TYPES. */
export const DOWNLOAD_ACCEPT =
  ".zip,.rar,.7z,.tar,.gz,.tar.gz,.bz2,.xz,.dmg,.exe,.apk,.pdf,.epub,.txt,.jpg,.jpeg,.png";

// One entry per distinct upload field across the admin panel. Allowlist,
// not blocklist -- an unrecognized type is rejected, never passed through.
export const UPLOAD_POLICIES = {
  image: {
    kind: "image",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 5 * 1024 * 1024,
  },
  "download.software": {
    kind: "archive",
    allowedMimeTypes: DOWNLOAD_CENTER_MIME_TYPES,
    maxBytes: 50 * 1024 * 1024,
  },
  "download.datasheet": {
    kind: "document",
    allowedMimeTypes: DOWNLOAD_CENTER_MIME_TYPES,
    maxBytes: 20 * 1024 * 1024,
  },
  "download.book": {
    kind: "document",
    allowedMimeTypes: DOWNLOAD_CENTER_MIME_TYPES,
    maxBytes: 50 * 1024 * 1024,
  },
  "download.poster": {
    kind: "document",
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
    maxBytes: 20 * 1024 * 1024,
  },
  "download.componentLibrary": {
    kind: "archive",
    allowedMimeTypes: DOWNLOAD_CENTER_MIME_TYPES,
    maxBytes: 50 * 1024 * 1024,
  },
} satisfies Record<string, FieldPolicy>;

export type UploadPolicyKey = keyof typeof UPLOAD_POLICIES;
