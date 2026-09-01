import { NextRequest, NextResponse } from "next/server";
import { open, readFile, stat } from "node:fs/promises";
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
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

const VIDEO_EXTENSIONS = new Set([".mp4", ".webm"]);

function isVideoExtension(ext: string) {
  return VIDEO_EXTENSIONS.has(ext);
}

export async function GET(
  request: NextRequest,
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

    const ext = path.extname(filename).toLowerCase();
    const contentType = EXT_TO_CONTENT_TYPE[ext] ?? "application/octet-stream";
    const commonHeaders = {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
    } as const;

    const rangeHeader = request.headers.get("range");
    if (rangeHeader && isVideoExtension(ext)) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader);
      if (match?.[1]) {
        const start = Number.parseInt(match[1], 10);
        const end = match[2] ? Number.parseInt(match[2], 10) : stats.size - 1;
        if (start >= stats.size || end >= stats.size || start > end) {
          return new NextResponse(null, {
            status: 416,
            headers: { "Content-Range": `bytes */${stats.size}` },
          });
        }

        const chunkSize = end - start + 1;
        const buffer = Buffer.alloc(chunkSize);
        const file = await open(/*turbopackIgnore: true*/ filePath, "r");
        await file.read(buffer, 0, chunkSize, start);
        await file.close();

        return new NextResponse(buffer, {
          status: 206,
          headers: {
            ...commonHeaders,
            "Accept-Ranges": "bytes",
            "Content-Range": `bytes ${start}-${end}/${stats.size}`,
            "Content-Length": String(chunkSize),
          },
        });
      }
    }

    const buffer = await readFile(/*turbopackIgnore: true*/ filePath);

    return new NextResponse(buffer, {
      headers: isVideoExtension(ext)
        ? { ...commonHeaders, "Accept-Ranges": "bytes", "Content-Length": String(stats.size) }
        : commonHeaders,
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
