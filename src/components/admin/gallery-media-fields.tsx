"use client";

import { useState } from "react";
import { ImageIcon, Video } from "lucide-react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { VideoUploadField } from "@/components/admin/video-upload-field";
import { cn } from "@/lib/utils";

export type GalleryMediaType = "IMAGE" | "VIDEO";

interface GalleryMediaFieldsProps {
  defaultMediaType?: GalleryMediaType;
  image?: string;
  video?: string | null;
  errors?: {
    mediaType?: string;
    image?: string;
    video?: string;
  };
}

const MEDIA_OPTIONS: {
  value: GalleryMediaType;
  label: string;
  description: string;
  icon: typeof ImageIcon;
}[] = [
  {
    value: "IMAGE",
    label: "تصویر",
    description: "عکس برای گالری و لایت‌باکس",
    icon: ImageIcon,
  },
  {
    value: "VIDEO",
    label: "ویدیو",
    description: "فایل MP4 یا WebM روی سرور",
    icon: Video,
  },
];

export function GalleryMediaFields({
  defaultMediaType = "IMAGE",
  image = "",
  video = null,
  errors,
}: GalleryMediaFieldsProps) {
  const [mediaType, setMediaType] = useState<GalleryMediaType>(defaultMediaType);

  return (
    <div className="border-border rounded-lg border p-4">
      <h2 className="text-pishnam-steel-600 mb-1 text-sm font-bold">نوع رسانه</h2>
      <p className="text-text-secondary mb-4 text-xs leading-relaxed">
        تصویر یا ویدیو را انتخاب کنید. ویدیوها در گالری با دکمه پخش نمایش داده می‌شوند.
      </p>

      <input type="hidden" name="mediaType" value={mediaType} />

      <fieldset className="flex flex-col gap-4">
        <legend className="sr-only">نوع رسانه گالری</legend>

        <div className="grid gap-2 sm:grid-cols-2">
          {MEDIA_OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = mediaType === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMediaType(option.value)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 text-start transition-colors",
                  selected
                    ? "border-pishnam-gold-500 bg-pishnam-gold-500/8 ring-pishnam-gold-500/30 ring-1"
                    : "border-border hover:border-pishnam-gold-500/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                    selected
                      ? "bg-pishnam-gold-500 text-pishnam-navy-900"
                      : "bg-bg-surface-alt text-text-secondary",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="text-text-primary block text-sm font-semibold">
                    {option.label}
                  </span>
                  <span className="text-text-secondary mt-0.5 block text-xs leading-relaxed">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {errors?.mediaType && <p className="text-pishnam-danger text-xs">{errors.mediaType}</p>}

        {mediaType === "IMAGE" ? (
          <div className="flex flex-col gap-2">
            <ImageUploadField
              name="image"
              label="تصویر"
              field="galleryImage.image"
              defaultValue={image}
              required
              error={errors?.image}
            />
            <p className="text-text-secondary text-xs leading-relaxed">
              تصویر افقی یا مربعی با حداقل ۱۲۰۰ پیکسل در ضلع بزرگ‌تر.
            </p>
            <input type="hidden" name="video" value="" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <VideoUploadField
              name="video"
              label="فایل ویدیو"
              field="galleryImage.video"
              policy="gallery.video"
              defaultValue={video ?? undefined}
              required
              error={errors?.video}
            />
            <ImageUploadField
              name="image"
              label="تصویر بندانگشتی (اختیاری)"
              field="galleryImage.poster"
              defaultValue={image || undefined}
            />
            <p className="text-text-secondary text-xs leading-relaxed">
              اگر بندانگشتی نگذارید، یک کادر ویدیو با آیکن پخش در گالری نمایش داده می‌شود.
            </p>
          </div>
        )}
      </fieldset>
    </div>
  );
}
