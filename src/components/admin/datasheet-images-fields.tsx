"use client";

import { useId, useState } from "react";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/admin/image-upload-field";

export type DatasheetImageDraft = {
  image: string;
  captionFa: string;
  captionEn: string;
  order: number;
};

function emptyImage(order: number): DatasheetImageDraft {
  return { image: "", captionFa: "", captionEn: "", order };
}

function parsePreserved(
  raw: string | undefined,
  fallback: DatasheetImageDraft[],
): DatasheetImageDraft[] {
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map((item, index) => {
      const img = item as Partial<DatasheetImageDraft>;
      return {
        image: String(img.image ?? ""),
        captionFa: String(img.captionFa ?? ""),
        captionEn: String(img.captionEn ?? ""),
        order: typeof img.order === "number" ? img.order : index,
      };
    });
  } catch {
    return fallback;
  }
}

interface DatasheetImagesFieldsProps {
  defaultImages?: DatasheetImageDraft[];
  preservedJson?: string;
  error?: string;
}

export function DatasheetImagesFields({
  defaultImages = [],
  preservedJson,
  error,
}: DatasheetImagesFieldsProps) {
  const listId = useId();
  const [images, setImages] = useState<DatasheetImageDraft[]>(() =>
    parsePreserved(preservedJson, defaultImages),
  );

  function update(index: number, patch: Partial<DatasheetImageDraft>) {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, ...patch } : img)));
  }

  return (
    <div className="border-border border-t pt-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-pishnam-steel-600 text-sm font-bold">گالری تصاویر</h2>
          <p className="text-text-secondary mt-1 text-xs">
            اختیاری — عکس قطعه، پین‌اوت، یا نمونه سیم‌کشی.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setImages((prev) => [...prev, emptyImage(prev.length)])}
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
            فهرست تصاویر قطعه
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
                  onClick={() =>
                    setImages((prev) =>
                      prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })),
                    )
                  }
                  className="text-pishnam-danger cursor-pointer"
                  aria-label={`حذف تصویر ${index + 1}`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  حذف
                </Button>
              </div>

              <ImageUploadField
                name={`ds-img-${index}`}
                label="تصویر *"
                field="datasheet.image"
                defaultValue={img.image}
                required
                onUploaded={(relativePath) => update(index, { image: relativePath })}
              />

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`ds-img-cap-fa-${index}`}>شرح فارسی</Label>
                  <Input
                    id={`ds-img-cap-fa-${index}`}
                    value={img.captionFa}
                    onChange={(e) => update(index, { captionFa: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5" dir="ltr">
                  <Label htmlFor={`ds-img-cap-en-${index}`}>English caption</Label>
                  <Input
                    id={`ds-img-cap-en-${index}`}
                    value={img.captionEn}
                    onChange={(e) => update(index, { captionEn: e.target.value })}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-pishnam-danger mt-2 text-xs">{error}</p>}
    </div>
  );
}
