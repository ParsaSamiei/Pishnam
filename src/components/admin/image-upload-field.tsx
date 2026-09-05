"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { IMAGE_ACCEPT } from "@/lib/upload-policies";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  /** Form field name -- the resulting `/uploads/<uuid>.{jpg,png}` path submits under this name. */
  name: string;
  label: string;
  /** Existing image path, for edit forms. */
  defaultValue?: string;
  /** Audit-log identifier, e.g. "achievement.photo" -- see UploadLog in prisma/schema.prisma. */
  field: string;
  required?: boolean;
  error?: string;
  /** Reports the stored path back to a parent that keeps its own state (e.g. course image rows). */
  onUploaded?: (relativePath: string) => void;
}

/**
 * Every content type with a photo/cover-image field uses this component, per
 * docs/06-admin-panel.md ("Image fields: upload widget -> local disk
 * storage... with preview"). The upload itself always goes through
 * /api/admin/upload, which runs the full checklist in
 * src/lib/upload.ts -- this component never talks to the filesystem
 * directly.
 */
export function ImageUploadField({
  name,
  label,
  defaultValue,
  field,
  required,
  error,
  onUploaded,
}: ImageUploadFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = `image-upload-${name}`;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("policy", "image");
    formData.append("field", field);

    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setUploadError(data.error ?? "خطا در آپلود تصویر.");
        return;
      }
      setValue(data.relativePath);
      onUploaded?.(data.relativePath);
    } catch {
      setUploadError("خطا در آپلود تصویر. اتصال خود را بررسی کنید.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={fieldId}>
        {label}
        {required && " *"}
      </Label>
      <input type="hidden" name={name} value={value} />

      {value ? (
        <div className="relative w-40">
          <div className="border-border bg-bg-surface-alt relative aspect-square overflow-hidden rounded-lg border">
            <Image src={value} alt="" fill sizes="160px" className="object-cover" />
          </div>
          <button
            type="button"
            onClick={() => {
              setValue("");
              onUploaded?.("");
            }}
            className="bg-pishnam-danger absolute -end-2 -top-2 flex size-6 cursor-pointer items-center justify-center rounded-full text-white shadow"
            aria-label="حذف تصویر"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={fieldId}
          className={cn(
            "flex h-32 w-40 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed",
            "border-border text-text-secondary hover:border-pishnam-gold-500 hover:text-pishnam-gold-600",
            isUploading && "pointer-events-none opacity-70",
          )}
        >
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="size-5" aria-hidden="true" />
          )}
          <span className="text-xs">{isUploading ? "در حال آپلود..." : "انتخاب تصویر"}</span>
          <input
            ref={inputRef}
            id={fieldId}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      )}

      {(uploadError || error) && (
        <p className="text-pishnam-danger text-xs">{uploadError ?? error}</p>
      )}
    </div>
  );
}
