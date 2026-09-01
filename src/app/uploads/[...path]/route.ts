import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { getUploadsDir } from "@/lib/uploads-dir";

/**
 * Serves files from UPLOADS_DIR under the public `/uploads/*` path.
 *
 * This only matters for local development (`next dev`) -- in production,
 * nginx's `location /uploads/` block (infra/nginx.conf) intercepts these
 * requests before they ever reach Next.js, which is the efficient path per
 * docs/05-frontend-architecture.md. This route handler exists purely so
 * uploaded images/files are viewable without running the full nginx stack
 * locally, and as a defense-in-depth fallback.
 */

const UPLOADS_DIR = getUploadsDir();

const EXT_TO_CONTENT_TYPE: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".epub": "application/epub+zip",
  ".txt": "text/plain; charset=utf-8",
  ".zip": "application/zip",
  ".rar": "application/x-rar-compressed",
  ".7z": "application/x-7z-compressed",
  ".tar": "application/x-tar",
  ".gz": "application/gzip",
  ".bz2": "application/x-bzip2",
  ".xz": "application/x-xz",
  ".dmg": "application/x-apple-diskimage",
  ".exe": "application/x-msdownload",
  ".apk": "application/vnd.android.package-archive",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  // Only ever a single flat filename in practice (upload.ts never nests
  // directories), but reject anything containing traversal sequences or
  // path separators regardless -- never trust request-derived paths.
  const filename = segments.join("/");
  if (segments.length !== 1 || filename.includes("..") || filename.includes("/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(/*turbopackIgnore: true*/ UPLOADS_DIR, filename);

  try {
    const stats = await stat(/*turbopackIgnore: true*/ filePath);
    if (!stats.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = await readFile(/*turbopackIgnore: true*/ filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = EXT_TO_CONTENT_TYPE[ext] ?? "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
