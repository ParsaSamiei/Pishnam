"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { UploadPolicyKey } from "@/lib/upload-policies";

interface FileUploadFieldProps {
  /** Form field name -- the resulting `/uploads/<uuid>.ext` path submits under this name. */
  name: string;
  label: string;
  policy: UploadPolicyKey;
  accept: string;
  /** Audit-log identifier, e.g. "download.software" -- see UploadLog in prisma/schema.prisma. */
  field: string;
  defaultValue?: string;
  required?: boolean;
  error?: string;
  /** Reports the upload result back to the parent form -- e.g. so it can also stash fileSizeBytes. */
  onUploaded?: (result: { relativePath: string; sizeBytes: number }) => void;
}

/**
 * Same upload pipeline as ImageUploadField (always through
 * /api/admin/upload -> src/lib/upload.ts), but for download-center resources
 * (archives, installers, PDFs, etc.) that don't get a thumbnail preview --
 * shows the stored filename instead.
 */
export function FileUploadField({
  name,
  label,
  policy,
  accept,
  field,
  defaultValue,
  required,
  error,
  onUploaded,
}: FileUploadFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = `file-upload-${name}`;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("policy", policy);
    formData.append("field", field);

    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setUploadError(data.error ?? "خطا در آپلود فایل.");
        return;
      }
      setValue(data.relativePath);
      onUploaded?.({ relativePath: data.relativePath, sizeBytes: data.sizeBytes });
    } catch {
      setUploadError("خطا در آپلود فایل. اتصال خود را بررسی کنید.");
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
        <div className="border-border bg-bg-surface-alt flex items-center gap-3 rounded-lg border p-3">
          <FileText className="text-pishnam-steel-600 size-5 shrink-0" aria-hidden="true" />
          <span
            dir="ltr"
            className="text-text-primary flex-1 truncate text-end text-sm sm:text-start"
          >
            {value.split("/").pop()}
          </span>
          <button
            type="button"
            onClick={() => {
              setValue("");
              onUploaded?.({ relativePath: "", sizeBytes: 0 });
            }}
            className="text-text-secondary hover:bg-bg-surface hover:text-pishnam-danger flex size-7 shrink-0 items-center justify-center rounded-full"
            aria-label="حذف فایل"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={fieldId}
          className={cn(
            "flex h-20 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed",
            "border-border text-text-secondary hover:border-pishnam-gold-500 hover:text-pishnam-gold-600",
            isUploading && "pointer-events-none opacity-70",
          )}
        >
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="size-5" aria-hidden="true" />
          )}
          <span className="text-sm">{isUploading ? "در حال آپلود..." : "انتخاب فایل"}</span>
          <input
            ref={inputRef}
            id={fieldId}
            type="file"
            accept={accept}
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
