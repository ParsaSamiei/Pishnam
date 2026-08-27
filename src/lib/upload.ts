import "server-only";

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { UPLOAD_POLICIES, type UploadPolicyKey } from "@/lib/upload-policies";

export {
  DOWNLOAD_ACCEPT,
  DOWNLOAD_CENTER_MIME_TYPES,
  UPLOAD_POLICIES,
  type UploadPolicyKey,
} from "@/lib/upload-policies";

/**
 * Implements the upload-security checklist in
 * docs/05-frontend-architecture.md ("Upload security (enforced on every
 * upload, no exceptions)"). Every admin upload -- course covers, achievement
 * photos, download-center files -- goes through this module. Auth is
 * enforced by the caller (route handler checks the admin session before
 * this ever runs); everything else (allowlist, content verification,
 * re-encoding, safe naming, size limits) lives here so there's exactly one
 * place to audit.
 *
 * Client components must import constants from `@/lib/upload-policies`
 * instead of this file -- sharp and fs are Node-only.
 */

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");
// This directory is a runtime-mounted Docker volume (see docker-compose.yml)
// that's empty at build time and only gets populated after deployment --
// there's nothing here for Next's build-time file tracer to bundle, and it
// shouldn't try to. The `turbopackIgnore` comments on the fs calls below
// silence Turbopack's warning about that (it can't statically resolve an
// env-var-derived path, which is expected and fine here).
const DEFAULT_MAX_BYTES = Number(process.env.UPLOAD_MAX_BYTES ?? 10 * 1024 * 1024);

export class UploadValidationError extends Error {}

export interface UploadResult {
  storedFilename: string;
  /** Path to store in the DB / serve to clients, e.g. "/uploads/<uuid>.webp". */
  relativePath: string;
  mimeType: string;
  sizeBytes: number;
}

export async function processUpload(
  buffer: Buffer,
  policyKey: UploadPolicyKey,
): Promise<UploadResult> {
  const policy = UPLOAD_POLICIES[policyKey];

  if (buffer.byteLength === 0) {
    throw new UploadValidationError("File is empty.");
  }
  const maxBytes = policy.maxBytes ?? DEFAULT_MAX_BYTES;
  if (buffer.byteLength > maxBytes) {
    throw new UploadValidationError(
      `File is too large -- max ${(maxBytes / (1024 * 1024)).toFixed(0)}MB for this field.`,
    );
  }

  // Verify the file's REAL type via magic-byte signature inspection. Never
  // trust the client-supplied Content-Type header or the original
  // filename's extension -- both are trivially spoofable. Plain text is the
  // one exception: it has no reliable magic bytes, so we fall back to a
  // UTF-8 / no-null-byte check when the policy allows text/plain.
  const fromMagic = await fileTypeFromBuffer(buffer);
  const allowedMimes = policy.allowedMimeTypes as readonly string[];
  const detected =
    fromMagic ?? (allowedMimes.includes("text/plain") ? tryDetectPlainText(buffer) : null);
  if (!detected || !allowedMimes.includes(detected.mime)) {
    throw new UploadValidationError(
      detected
        ? `File type "${detected.mime}" isn't allowed for this field.`
        : "Couldn't verify this file's type -- it may be corrupted or not a real file of the expected kind.",
    );
  }

  await mkdir(/* turbopackIgnore: true */ UPLOADS_DIR, { recursive: true });
  const id = randomUUID(); // never trust/reuse the client's original filename

  if (policy.kind === "image") {
    // Re-encode every image on the way in -- this both normalizes format
    // and strips any embedded scripts/metadata that could hide inside a
    // crafted image file (EXIF payloads, polyglot files, etc.), per the
    // checklist's "Re-encode/strip images on upload" step. PDFs used for
    // posters skip this branch below since sharp can't re-encode PDFs;
    // content-type verification is the primary defense for those.
    if (detected.mime !== "application/pdf") {
      const processed = await sharp(buffer)
        .rotate() // bake in EXIF orientation before the metadata gets stripped
        .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      return writeAndDescribe(`${id}.webp`, processed, "image/webp");
    }
  }

  // Documents/archives can't be meaningfully "re-encoded" the way raster
  // images can -- verified content-type + isolated, non-executable storage
  // is the defense here. Extension comes from the *detected* type, not the
  // client's filename (file-type may return compound exts like "tar.gz").
  return writeAndDescribe(`${id}.${detected.ext}`, buffer, detected.mime);
}

/**
 * Plain-text fallback for policies that allow text/plain. Rejects anything
 * with a null byte (typical of binaries) or that isn't valid UTF-8 -- we
 * never trust the client extension alone.
 */
function tryDetectPlainText(buffer: Buffer): { ext: string; mime: string } | null {
  if (buffer.includes(0)) return null;
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return null;
  }
  return { ext: "txt", mime: "text/plain" };
}

async function writeAndDescribe(
  filename: string,
  buffer: Buffer,
  mimeType: string,
): Promise<UploadResult> {
  const destPath = path.join(/* turbopackIgnore: true */ UPLOADS_DIR, filename);

  // 0o644 = rw-r--r--: no execute bit for anyone, which is what item 7 of the
  // upload-security checklist in docs/05-frontend-architecture.md requires.
  //
  // Not 0o640. That assumed nginx and the app share a user or group, but they
  // are separate containers: the app is nextjs (uid 1001) while nginx's worker
  // processes drop to uid 101, so the group bit never reached nginx and every
  // uploaded file was served as 403 "Permission denied". The o+r bit is what
  // lets nginx read the volume it mounts read-only to serve /uploads/.
  //
  // Withholding o+r was not protecting anything: these files are served to
  // anonymous visitors over HTTP by design, and the volume is only reachable
  // by root on the host and by the two containers that mount it.
  await writeFile(destPath, buffer, { mode: 0o644 });

  return {
    storedFilename: filename,
    relativePath: `/uploads/${filename}`,
    mimeType,
    sizeBytes: buffer.byteLength,
  };
}
