/**
 * Client-safe upload allowlists and policy keys.
 *
 * Keep this module free of Node-only imports (jimp, fs, etc.) so admin
 * form components can share the same constants the server enforces.
 */

type UploadKind = "image" | "document" | "archive" | "video";

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
    // No image/webp. Every image is re-encoded on upload (upload.ts), and the
    // re-encoder is jimp, which ships no WebP codec -- its formats are
    // bmp/gif/jpeg/png/tiff. Accepting WebP here would let the admin pick a
    // file the server then rejects. The alternative, storing WebP without
    // re-encoding, would exempt it from the "no exceptions" re-encode rule in
    // the upload-security checklist, so the format is dropped instead.
    // Re-add it together with a WebP decoder, not on its own.
    allowedMimeTypes: ["image/jpeg", "image/png"],
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
  "teamMember.resume": {
    kind: "document",
    allowedMimeTypes: ["application/pdf"],
    maxBytes: 10 * 1024 * 1024,
  },
  "course.video": {
    kind: "video",
    allowedMimeTypes: ["video/mp4", "video/webm"],
    maxBytes: 100 * 1024 * 1024,
  },
  "course.document": {
    kind: "document",
    allowedMimeTypes: [
      "application/pdf",
      "application/zip",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
      "application/epub+zip",
      "text/plain",
      "image/jpeg",
      "image/png",
    ],
    maxBytes: 20 * 1024 * 1024,
  },
  "gallery.video": {
    kind: "video",
    allowedMimeTypes: ["video/mp4", "video/webm"],
    maxBytes: 100 * 1024 * 1024,
  },
  "video.hosted": {
    kind: "video",
    allowedMimeTypes: ["video/mp4", "video/webm"],
    maxBytes: 100 * 1024 * 1024,
  },
} satisfies Record<string, FieldPolicy>;

export type UploadPolicyKey = keyof typeof UPLOAD_POLICIES;

/**
 * Browser `accept` attribute for the admin image picker, derived from the
 * `image` policy rather than written out by hand, so the file dialog can never
 * offer a format the server rejects. It previously hardcoded image/webp, which
 * is no longer accepted -- see the note on the policy above.
 */
export const IMAGE_ACCEPT = UPLOAD_POLICIES.image.allowedMimeTypes.join(",");

/** Browser `accept` for course hosted-video uploads. */
export const VIDEO_ACCEPT = UPLOAD_POLICIES["course.video"].allowedMimeTypes
  .concat([".mp4", ".webm"])
  .join(",");

/** Browser `accept` for course-related document uploads. */
export const COURSE_DOCUMENT_ACCEPT = ".pdf,.zip,.rar,.7z,.epub,.txt,.jpg,.jpeg,.png";
