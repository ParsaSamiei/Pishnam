"use client";

import { useId, useState } from "react";
import { List, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ProductSpecDraft = {
  keyFa: string;
  keyEn: string;
  valueFa: string;
  valueEn: string;
  order: number;
};

function emptySpec(order: number): ProductSpecDraft {
  return { keyFa: "", keyEn: "", valueFa: "", valueEn: "", order };
}

function parsePreserved(raw: string | undefined, fallback: ProductSpecDraft[]): ProductSpecDraft[] {
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map((item, index) => {
      const spec = item as Partial<ProductSpecDraft>;
      return {
        keyFa: String(spec.keyFa ?? ""),
        keyEn: String(spec.keyEn ?? ""),
        valueFa: String(spec.valueFa ?? ""),
        valueEn: String(spec.valueEn ?? ""),
        order: typeof spec.order === "number" ? spec.order : index,
      };
    });
  } catch {
    return fallback;
  }
}

interface ProductSpecsFieldsProps {
  defaultSpecs?: ProductSpecDraft[];
  preservedJson?: string;
  error?: string;
}

export function ProductSpecsFields({
  defaultSpecs = [],
  preservedJson,
  error,
}: ProductSpecsFieldsProps) {
  const listId = useId();
  const [specs, setSpecs] = useState<ProductSpecDraft[]>(() =>
    parsePreserved(preservedJson, defaultSpecs),
  );

  function update(index: number, patch: Partial<ProductSpecDraft>) {
    setSpecs((prev) => prev.map((spec, i) => (i === index ? { ...spec, ...patch } : spec)));
  }

  return (
    <div className="border-border border-t pt-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-pishnam-steel-600 text-sm font-bold">جدول مشخصات</h2>
          <p className="text-text-secondary mt-1 text-xs">
            اختیاری — جفت‌های کلید/مقدار مثل وزن، ابعاد، ولتاژ.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSpecs((prev) => [...prev, emptySpec(prev.length)])}
          className="cursor-pointer"
        >
          <Plus className="size-4" aria-hidden="true" />
          افزودن ردیف
        </Button>
      </div>

      <input type="hidden" name="specsJson" value={JSON.stringify(specs)} />

      {specs.length === 0 ? (
        <p className="text-text-secondary border-border bg-bg-surface-alt rounded-lg border border-dashed px-4 py-6 text-center text-sm">
          مشخصه‌ای اضافه نشده است.
        </p>
      ) : (
        <ul className="flex flex-col gap-4" aria-labelledby={listId}>
          <span id={listId} className="sr-only">
            فهرست مشخصات محصول
          </span>
          {specs.map((spec, index) => (
            <li
              key={`spec-${index}`}
              className="border-border bg-bg-surface-alt/60 rounded-xl border p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-text-primary flex items-center gap-2 text-sm font-semibold">
                  <List className="text-pishnam-gold-600 size-4 shrink-0" aria-hidden="true" />
                  مشخصه {index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSpecs((prev) =>
                      prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })),
                    )
                  }
                  className="text-pishnam-danger cursor-pointer"
                  aria-label={`حذف مشخصه ${index + 1}`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  حذف
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`prod-spec-key-fa-${index}`}>کلید (فارسی) *</Label>
                  <Input
                    id={`prod-spec-key-fa-${index}`}
                    value={spec.keyFa}
                    onChange={(e) => update(index, { keyFa: e.target.value })}
                    placeholder="وزن"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5" dir="ltr">
                  <Label htmlFor={`prod-spec-key-en-${index}`}>Key (English) *</Label>
                  <Input
                    id={`prod-spec-key-en-${index}`}
                    value={spec.keyEn}
                    onChange={(e) => update(index, { keyEn: e.target.value })}
                    placeholder="Weight"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`prod-spec-val-fa-${index}`}>مقدار (فارسی) *</Label>
                  <Input
                    id={`prod-spec-val-fa-${index}`}
                    value={spec.valueFa}
                    onChange={(e) => update(index, { valueFa: e.target.value })}
                    placeholder="۳۵۰ گرم"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5" dir="ltr">
                  <Label htmlFor={`prod-spec-val-en-${index}`}>Value (English) *</Label>
                  <Input
                    id={`prod-spec-val-en-${index}`}
                    value={spec.valueEn}
                    onChange={(e) => update(index, { valueEn: e.target.value })}
                    placeholder="350 g"
                    required
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
