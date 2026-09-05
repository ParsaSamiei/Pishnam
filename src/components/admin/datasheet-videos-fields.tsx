"use client";

import { useId, useState } from "react";
import { Plus, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { VideoUploadField } from "@/components/admin/video-upload-field";
import { cn } from "@/lib/utils";

export type DatasheetVideoDraft = {
  titleFa: string;
  titleEn: string;
  source: "aparat" | "hosted";
  aparatUrl: string;
  hostedVideo: string;
  thumbnail: string;
  order: number;
};

function emptyVideo(order: number): DatasheetVideoDraft {
  return {
    titleFa: "",
    titleEn: "",
    source: "aparat",
    aparatUrl: "",
    hostedVideo: "",
    thumbnail: "",
    order,
  };
}

function parsePreserved(
  raw: string | undefined,
  fallback: DatasheetVideoDraft[],
): DatasheetVideoDraft[] {
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map((item, index) => {
      const video = item as Partial<DatasheetVideoDraft> & {
        aparatUrl?: string | null;
        hostedVideo?: string | null;
      };
      const hosted = Boolean(video.hostedVideo);
      return {
        titleFa: String(video.titleFa ?? ""),
        titleEn: String(video.titleEn ?? ""),
        source: video.source === "hosted" || hosted ? "hosted" : "aparat",
        aparatUrl: String(video.aparatUrl ?? ""),
        hostedVideo: String(video.hostedVideo ?? ""),
        thumbnail: String(video.thumbnail ?? ""),
        order: typeof video.order === "number" ? video.order : index,
      };
    });
  } catch {
    return fallback;
  }
}

interface DatasheetVideosFieldsProps {
  defaultVideos?: DatasheetVideoDraft[];
  preservedJson?: string;
  error?: string;
}

export function DatasheetVideosFields({
  defaultVideos = [],
  preservedJson,
  error,
}: DatasheetVideosFieldsProps) {
  const listId = useId();
  const [videos, setVideos] = useState<DatasheetVideoDraft[]>(() =>
    parsePreserved(preservedJson, defaultVideos),
  );

  function update(index: number, patch: Partial<DatasheetVideoDraft>) {
    setVideos((prev) => prev.map((video, i) => (i === index ? { ...video, ...patch } : video)));
  }

  return (
    <div className="border-border border-t pt-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-pishnam-steel-600 text-sm font-bold">ویدیوها</h2>
          <p className="text-text-secondary mt-1 text-xs">
            اختیاری — چند ویدیو، هر کدام آپارات یا فایل آپلودشده.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setVideos((prev) => [...prev, emptyVideo(prev.length)])}
          className="cursor-pointer"
        >
          <Plus className="size-4" aria-hidden="true" />
          افزودن ویدیو
        </Button>
      </div>

      <input type="hidden" name="videosJson" value={JSON.stringify(videos)} />

      {videos.length === 0 ? (
        <p className="text-text-secondary border-border bg-bg-surface-alt rounded-lg border border-dashed px-4 py-6 text-center text-sm">
          ویدیویی اضافه نشده است.
        </p>
      ) : (
        <ul className="flex flex-col gap-4" aria-labelledby={listId}>
          <span id={listId} className="sr-only">
            فهرست ویدیوهای قطعه
          </span>
          {videos.map((video, index) => (
            <li
              key={`video-${index}`}
              className="border-border bg-bg-surface-alt/60 rounded-xl border p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-text-primary flex items-center gap-2 text-sm font-semibold">
                  <Video className="text-pishnam-gold-600 size-4 shrink-0" aria-hidden="true" />
                  ویدیو {index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setVideos((prev) =>
                      prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })),
                    )
                  }
                  className="text-pishnam-danger cursor-pointer"
                  aria-label={`حذف ویدیو ${index + 1}`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  حذف
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`ds-vid-title-fa-${index}`}>عنوان فارسی *</Label>
                  <Input
                    id={`ds-vid-title-fa-${index}`}
                    value={video.titleFa}
                    onChange={(e) => update(index, { titleFa: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5" dir="ltr">
                  <Label htmlFor={`ds-vid-title-en-${index}`}>English title *</Label>
                  <Input
                    id={`ds-vid-title-en-${index}`}
                    value={video.titleEn}
                    onChange={(e) => update(index, { titleEn: e.target.value })}
                    required
                  />
                </div>
              </div>

              <fieldset className="mt-3">
                <legend className="sr-only">منبع ویدیو {index + 1}</legend>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: "aparat", label: "آپارات (embed)" },
                      { value: "hosted", label: "آپلود روی سرور" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        update(index, {
                          source: option.value,
                          aparatUrl: option.value === "aparat" ? video.aparatUrl : "",
                          hostedVideo: option.value === "hosted" ? video.hostedVideo : "",
                        })
                      }
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors duration-200",
                        video.source === option.value
                          ? "border-pishnam-gold-500 bg-pishnam-gold-500/10 text-pishnam-steel-700 font-medium"
                          : "border-border text-text-secondary hover:border-pishnam-gold-500/50",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-3 flex flex-col gap-3">
                {video.source === "aparat" ? (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`ds-vid-aparat-${index}`}>کد Embed آپارات *</Label>
                    <Textarea
                      id={`ds-vid-aparat-${index}`}
                      dir="ltr"
                      rows={3}
                      value={video.aparatUrl}
                      onChange={(e) => update(index, { aparatUrl: e.target.value })}
                      required
                    />
                  </div>
                ) : (
                  <VideoUploadField
                    name={`ds-vid-file-${index}`}
                    label="فایل ویدیو"
                    field="datasheet.video"
                    policy="course.video"
                    defaultValue={video.hostedVideo}
                    required
                    onUploaded={(relativePath) => update(index, { hostedVideo: relativePath })}
                  />
                )}
                <ImageUploadField
                  name={`ds-vid-thumb-${index}`}
                  label="تصویر پیش‌نمایش (اختیاری)"
                  field="datasheet.videoThumbnail"
                  defaultValue={video.thumbnail}
                  onUploaded={(relativePath) => update(index, { thumbnail: relativePath })}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-pishnam-danger mt-2 text-xs">{error}</p>}
    </div>
  );
}
