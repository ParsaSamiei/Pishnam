"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { UploadPolicyKey } from "@/lib/upload-policies";
import { VIDEO_ACCEPT } from "@/lib/upload-policies";
import { AppVideoPlayer } from "@/components/media/app-video-player";
import { cn } from "@/lib/utils";

interface VideoUploadFieldProps {
  name: string;
  label: string;
  field: string;
  policy?: UploadPolicyKey;
  defaultValue?: string;
  required?: boolean;
  error?: string;
  onUploaded?: (relativePath: string) => void;
}

export function VideoUploadField({
  name,
  label,
  field,
  policy = "course.video",
  defaultValue,
  required,
  error,
  onUploaded,
}: VideoUploadFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = `video-upload-${name}`;

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
        setUploadError(data.error ?? "خطا در آپلود ویدیو.");
        return;
      }
      setValue(data.relativePath);
      onUploaded?.(data.relativePath);
    } catch {
      setUploadError("خطا در آپلود ویدیو. اتصال خود را بررسی کنید.");
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
        <div className="border-border bg-bg-surface-alt flex flex-col gap-3 rounded-lg border p-3">
          <AppVideoPlayer
            src={value}
            title={label}
            preload="metadata"
            className="rounded-md"
            videoClassName="aspect-video w-full rounded-md"
          />
          <div className="flex items-center justify-between gap-2">
            <span dir="ltr" className="text-text-secondary truncate text-xs">
              {value.split("/").pop()}
            </span>
            <button
              type="button"
              onClick={() => {
                setValue("");
                onUploaded?.("");
              }}
              className="text-text-secondary hover:bg-bg-surface hover:text-pishnam-danger flex size-7 shrink-0 items-center justify-center rounded-full"
              aria-label="حذف ویدیو"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={fieldId}
          className={cn(
            "flex h-24 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed",
            "border-border text-text-secondary hover:border-pishnam-gold-500 hover:text-pishnam-gold-600",
            isUploading && "pointer-events-none opacity-70",
          )}
        >
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="size-5" aria-hidden="true" />
          )}
          <span className="text-sm">
            {isUploading
              ? "در حال آپلود..."
              : "انتخاب فایل ویدیو (MP4 یا WebM، حداکثر ۱۰۰ مگابایت)"}
          </span>
          <input
            ref={inputRef}
            id={fieldId}
            type="file"
            accept={VIDEO_ACCEPT}
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
