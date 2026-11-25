"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { VideoUploadField } from "@/components/admin/video-upload-field";
import { cn } from "@/lib/utils";

export type CourseVideoSource = "none" | "aparat" | "hosted";

interface CourseVideoFieldsProps {
  defaultSource?: CourseVideoSource;
  aparatUrl?: string;
  hostedVideo?: string | null;
  videoThumbnail?: string | null;
  errors?: {
    videoSource?: string;
    aparatUrl?: string;
    hostedVideo?: string;
    videoThumbnail?: string;
  };
}

const SOURCE_OPTIONS: { value: CourseVideoSource; label: string }[] = [
  { value: "none", label: "بدون ویدیو" },
  { value: "aparat", label: "آپارات (embed)" },
  { value: "hosted", label: "آپلود روی سرور" },
];

export function CourseVideoFields({
  defaultSource = "none",
  aparatUrl = "",
  hostedVideo = null,
  videoThumbnail = null,
  errors,
}: CourseVideoFieldsProps) {
  const [source, setSource] = useState<CourseVideoSource>(defaultSource);

  return (
    <div className="border-border rounded-lg border p-4">
      <h2 className="text-pishnam-steel-600 mb-4 text-sm font-bold">ویدیو معرفی (اختیاری)</h2>

      <input type="hidden" name="videoSource" value={source} />

      <fieldset className="flex flex-col gap-4">
        <legend className="sr-only">منبع ویدیو</legend>
        <div className="flex flex-wrap gap-2">
          {SOURCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSource(option.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                source === option.value
                  ? "border-pishnam-gold-500 bg-pishnam-gold-500/10 text-pishnam-steel-700 font-medium"
                  : "border-border text-text-secondary hover:border-pishnam-gold-500/50",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {errors?.videoSource && <p className="text-pishnam-danger text-xs">{errors.videoSource}</p>}

        {source === "aparat" && (
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
              name="videoThumbnail"
              label="تصویر بندانگشتی (اختیاری — در صورت خالی بودن، بندانگشتی خود آپارات نمایش داده می‌شود)"
              field="course.videoThumbnail"
              defaultValue={videoThumbnail ?? undefined}
            />
          </div>
        )}

        {source === "hosted" && (
          <div className="flex flex-col gap-4">
            <VideoUploadField
              name="hostedVideo"
              label="فایل ویدیو *"
              field="course.hostedVideo"
              defaultValue={hostedVideo ?? undefined}
              required
              error={errors?.hostedVideo}
            />
            <ImageUploadField
              name="videoThumbnail"
              label="تصویر بندانگشتی (اختیاری — قبل از پخش نمایش داده می‌شود)"
              field="course.videoThumbnail"
              defaultValue={videoThumbnail ?? undefined}
            />
          </div>
        )}

        {source === "none" && (
          <>
            <input type="hidden" name="aparatUrl" value="" />
            <input type="hidden" name="hostedVideo" value="" />
            <input type="hidden" name="videoThumbnail" value="" />
            <p className="text-text-secondary text-xs">
              ویدیویی روی صفحه عمومی این دوره نمایش داده نمی‌شود.
            </p>
          </>
        )}
      </fieldset>
    </div>
  );
}
