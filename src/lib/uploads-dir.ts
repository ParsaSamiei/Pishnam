import path from "node:path";

/**
 * Absolute path to the upload storage directory. Relative values in
 * UPLOADS_DIR (e.g. "./uploads") are resolved against process.cwd() so
 * writes and reads always target the same folder in dev.
 */
export function getUploadsDir(): string {
  const configured = process.env.UPLOADS_DIR;
  if (!configured) {
    return path.join(process.cwd(), "uploads");
  }
  return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
}
