"use client";

import { useState } from "react";
import { Server, Video } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { VideoUploadField } from "@/components/admin/video-upload-field";
import { cn } from "@/lib/utils";

export type VideoEntrySource = "aparat" | "hosted";

interface VideoEntrySourceFieldsProps {
  defaultSource?: VideoEntrySource;
  aparatUrl?: string;
  hostedVideo?: string | null;
  thumbnail?: string | null;
  errors?: {
    videoSource?: string;
    aparatUrl?: string;
    hostedVideo?: string;
    thumbnail?: string;
  };
}

const SOURCE_OPTIONS: {
  value: VideoEntrySource;
  label: string;
  description: string;
  icon: typeof Video;
}[] = [
  {
    value: "aparat",
    label: "آپارات",
    description: "کد embed از صفحه اشتراک‌گذاری آپارات",
    icon: Video,
  },
  {
    value: "hosted",
    label: "آپلود روی سرور",
    description: "فایل MP4 یا WebM روی سرور پیشنام",
    icon: Server,
  },
];

export function VideoEntrySourceFields({
  defaultSource = "aparat",
  aparatUrl = "",
  hostedVideo = null,
  thumbnail = null,
  errors,
}: VideoEntrySourceFieldsProps) {
  const [source, setSource] = useState<VideoEntrySource>(defaultSource);

  return (
    <div className="border-border rounded-lg border p-4">
      <h2 className="text-pishnam-steel-600 mb-1 text-sm font-bold">منبع ویدیو</h2>
      <p className="text-text-secondary mb-4 text-xs leading-relaxed">
        ویدیو را از آپارات embed کنید یا فایل را مستقیماً روی سرور آپلود کنید.
      </p>

      <input type="hidden" name="videoSource" value={source} />

      <fieldset className="flex flex-col gap-4">
        <legend className="sr-only">منبع ویدیو</legend>

        <div className="grid gap-2 sm:grid-cols-2">
          {SOURCE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = source === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSource(option.value)}
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

        {errors?.videoSource && <p className="text-pishnam-danger text-xs">{errors.videoSource}</p>}

        {source === "aparat" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="aparatUrl">کد Embed آپارات *</Label>
              <Textarea
                id="aparatUrl"
                name="aparatUrl"
                dir="ltr"
                rows={4}
                placeholder={
                  '<div id="..."><script type="text/JavaScript" src="https://www.aparat.com/embed/xxxxx?..."></script></div>'
                }
                defaultValue={aparatUrl}
                aria-invalid={Boolean(errors?.aparatUrl)}
              />
              <p className="text-text-secondary text-xs">
                کل کد embed را از صفحه اشتراک‌گذاری آپارات کپی و اینجا پیست کنید.
              </p>
              {errors?.aparatUrl && (
                <p className="text-pishnam-danger text-xs">{errors.aparatUrl}</p>
              )}
            </div>
            <ImageUploadField
              name="thumbnail"
              label="تصویر بندانگشتی (اختیاری — در صورت خالی بودن، بندانگشتی خود آپارات نمایش داده می‌شود)"
              field="video.thumbnail"
              defaultValue={thumbnail ?? undefined}
            />
            <input type="hidden" name="hostedVideo" value="" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <VideoUploadField
              name="hostedVideo"
              label="فایل ویدیو"
              field="video.hostedVideo"
              policy="video.hosted"
              defaultValue={hostedVideo ?? undefined}
              required
              error={errors?.hostedVideo}
            />
            <ImageUploadField
              name="thumbnail"
              label="تصویر بندانگشتی (اختیاری — قبل از پخش نمایش داده می‌شود)"
              field="video.thumbnail"
              defaultValue={thumbnail ?? undefined}
            />
            <input type="hidden" name="aparatUrl" value="" />
          </div>
        )}
      </fieldset>
    </div>
  );
}
