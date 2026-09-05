"use client";

import { useId, useState } from "react";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/admin/image-upload-field";

export type CourseImageDraft = {
  image: string;
  captionFa: string;
  captionEn: string;
  order: number;
  active: boolean;
};

function emptyImage(order: number): CourseImageDraft {
  return {
    image: "",
    captionFa: "",
    captionEn: "",
    order,
    active: true,
  };
}

function parsePreservedImages(
  raw: string | undefined,
  fallback: CourseImageDraft[],
): CourseImageDraft[] {
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map((item, index) => {
      const img = item as Partial<CourseImageDraft>;
      return {
        image: String(img.image ?? ""),
        captionFa: String(img.captionFa ?? ""),
        captionEn: String(img.captionEn ?? ""),
        order: typeof img.order === "number" ? img.order : index,
        active: img.active !== false,
      };
    });
  } catch {
    return fallback;
  }
}

interface CourseImagesFieldsProps {
  defaultImages?: CourseImageDraft[];
  preservedJson?: string;
  error?: string;
}

export function CourseImagesFields({
  defaultImages = [],
  preservedJson,
  error,
}: CourseImagesFieldsProps) {
  const listId = useId();
  const [images, setImages] = useState<CourseImageDraft[]>(() =>
    parsePreservedImages(preservedJson, defaultImages),
  );

  function updateImage(index: number, patch: Partial<CourseImageDraft>) {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, ...patch } : img)));
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i })));
  }

  function addImage() {
    setImages((prev) => [...prev, emptyImage(prev.length)]);
  }

  return (
    <div className="border-border border-t pt-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-pishnam-steel-600 text-sm font-bold">تصاویر دوره</h2>
          <p className="text-text-secondary mt-1 text-xs">
            اختیاری — عکس‌های کلاس، پروژه‌ها یا فضای کار که در صفحه دوره نمایش داده می‌شوند.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addImage}
          className="cursor-pointer"
        >
          <Plus className="size-4" aria-hidden="true" />
          افزودن تصویر
        </Button>
      </div>

      <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />

      {images.length === 0 ? (
        <p className="text-text-secondary border-border bg-bg-surface-alt rounded-lg border border-dashed px-4 py-6 text-center text-sm">
          تصویری اضافه نشده است.
        </p>
      ) : (
        <ul className="flex flex-col gap-4" aria-labelledby={listId}>
          <span id={listId} className="sr-only">
            فهرست تصاویر دوره
          </span>
          {images.map((img, index) => (
            <li
              key={`img-${index}-${img.image || "empty"}`}
              className="border-border bg-bg-surface-alt/60 rounded-xl border p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-text-primary flex items-center gap-2 text-sm font-semibold">
                  <ImageIcon className="text-pishnam-gold-600 size-4 shrink-0" aria-hidden="true" />
                  تصویر {index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="text-pishnam-danger cursor-pointer"
                  aria-label={`حذف تصویر ${index + 1}`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  حذف
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
                <ImageUploadField
                  name={`course-image-${index}`}
                  label="فایل تصویر"
                  field="course.image"
                  defaultValue={img.image}
                  required
                  onUploaded={(relativePath) => updateImage(index, { image: relativePath })}
                />
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`img-caption-fa-${index}`}>عنوان فارسی</Label>
                    <Input
                      id={`img-caption-fa-${index}`}
                      value={img.captionFa}
                      onChange={(e) => updateImage(index, { captionFa: e.target.value })}
                      placeholder="اختیاری"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5" dir="ltr">
                    <Label htmlFor={`img-caption-en-${index}`}>English caption</Label>
                    <Input
                      id={`img-caption-en-${index}`}
                      value={img.captionEn}
                      onChange={(e) => updateImage(index, { captionEn: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`img-order-${index}`}>ترتیب</Label>
                    <Input
                      id={`img-order-${index}`}
                      type="number"
                      min={0}
                      value={img.order}
                      onChange={(e) => updateImage(index, { order: Number(e.target.value) || 0 })}
                      className="max-w-28"
                    />
                  </div>
                </div>
              </div>

              {!img.image ? (
                <p className="text-pishnam-danger mt-2 text-xs">
                  آپلود تصویر برای این ردیف الزامی است.
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-pishnam-danger mt-2 text-xs">{error}</p>}
    </div>
  );
}
