"use client";

import { useId, useState } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { FileUploadField } from "@/components/admin/file-upload-field";
import { DOWNLOAD_ACCEPT } from "@/lib/upload-policies";

export type DatasheetDocumentDraft = {
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  source: "HOSTED" | "EXTERNAL";
  fileUrl: string;
  fileSizeBytes: number | null;
  order: number;
};

function emptyDocument(order: number): DatasheetDocumentDraft {
  return {
    titleFa: "",
    titleEn: "",
    descriptionFa: "",
    descriptionEn: "",
    source: "HOSTED",
    fileUrl: "",
    fileSizeBytes: null,
    order,
  };
}

function parsePreserved(
  raw: string | undefined,
  fallback: DatasheetDocumentDraft[],
): DatasheetDocumentDraft[] {
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map((item, index) => {
      const doc = item as Partial<DatasheetDocumentDraft>;
      return {
        titleFa: String(doc.titleFa ?? ""),
        titleEn: String(doc.titleEn ?? ""),
        descriptionFa: String(doc.descriptionFa ?? ""),
        descriptionEn: String(doc.descriptionEn ?? ""),
        source: doc.source === "EXTERNAL" ? "EXTERNAL" : "HOSTED",
        fileUrl: String(doc.fileUrl ?? ""),
        fileSizeBytes:
          typeof doc.fileSizeBytes === "number" && Number.isFinite(doc.fileSizeBytes)
            ? doc.fileSizeBytes
            : null,
        order: typeof doc.order === "number" ? doc.order : index,
      };
    });
  } catch {
    return fallback;
  }
}

interface DatasheetDocumentsFieldsProps {
  defaultDocuments?: DatasheetDocumentDraft[];
  preservedJson?: string;
  error?: string;
}

export function DatasheetDocumentsFields({
  defaultDocuments = [],
  preservedJson,
  error,
}: DatasheetDocumentsFieldsProps) {
  const listId = useId();
  const [documents, setDocuments] = useState<DatasheetDocumentDraft[]>(() =>
    parsePreserved(preservedJson, defaultDocuments),
  );

  function update(index: number, patch: Partial<DatasheetDocumentDraft>) {
    setDocuments((prev) => prev.map((doc, i) => (i === index ? { ...doc, ...patch } : doc)));
  }

  return (
    <div className="border-border border-t pt-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-pishnam-steel-600 text-sm font-bold">دیتاشیت و فایل‌ها</h2>
          <p className="text-text-secondary mt-1 text-xs">
            اختیاری — PDF دیتاشیت، شماتیک یا هر فایل مرتبط با همین قطعه.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDocuments((prev) => [...prev, emptyDocument(prev.length)])}
          className="cursor-pointer"
        >
          <Plus className="size-4" aria-hidden="true" />
          افزودن فایل
        </Button>
      </div>

      <input type="hidden" name="documentsJson" value={JSON.stringify(documents)} />

      {documents.length === 0 ? (
        <p className="text-text-secondary border-border bg-bg-surface-alt rounded-lg border border-dashed px-4 py-6 text-center text-sm">
          فایلی اضافه نشده است.
        </p>
      ) : (
        <ul className="flex flex-col gap-4" aria-labelledby={listId}>
          <span id={listId} className="sr-only">
            فهرست فایل‌های قطعه
          </span>
          {documents.map((doc, index) => (
            <li
              key={`doc-${index}`}
              className="border-border bg-bg-surface-alt/60 rounded-xl border p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-text-primary flex items-center gap-2 text-sm font-semibold">
                  <FileText className="text-pishnam-gold-600 size-4 shrink-0" aria-hidden="true" />
                  فایل {index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDocuments((prev) =>
                      prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })),
                    )
                  }
                  className="text-pishnam-danger cursor-pointer"
                  aria-label={`حذف فایل ${index + 1}`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  حذف
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`ds-doc-title-fa-${index}`}>عنوان فارسی *</Label>
                  <Input
                    id={`ds-doc-title-fa-${index}`}
                    value={doc.titleFa}
                    onChange={(e) => update(index, { titleFa: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5" dir="ltr">
                  <Label htmlFor={`ds-doc-title-en-${index}`}>English title *</Label>
                  <Input
                    id={`ds-doc-title-en-${index}`}
                    value={doc.titleEn}
                    onChange={(e) => update(index, { titleEn: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`ds-doc-desc-fa-${index}`}>توضیح فارسی</Label>
                  <Textarea
                    id={`ds-doc-desc-fa-${index}`}
                    rows={2}
                    value={doc.descriptionFa}
                    onChange={(e) => update(index, { descriptionFa: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5" dir="ltr">
                  <Label htmlFor={`ds-doc-desc-en-${index}`}>English description</Label>
                  <Textarea
                    id={`ds-doc-desc-en-${index}`}
                    rows={2}
                    value={doc.descriptionEn}
                    onChange={(e) => update(index, { descriptionEn: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`ds-doc-source-${index}`}>نوع منبع *</Label>
                  <NativeSelect
                    id={`ds-doc-source-${index}`}
                    value={doc.source}
                    onChange={(e) =>
                      update(index, {
                        source: e.target.value === "EXTERNAL" ? "EXTERNAL" : "HOSTED",
                        fileUrl: "",
                        fileSizeBytes: null,
                      })
                    }
                  >
                    <option value="HOSTED">فایل آپلودشده</option>
                    <option value="EXTERNAL">لینک خارجی</option>
                  </NativeSelect>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`ds-doc-order-${index}`}>ترتیب</Label>
                  <Input
                    id={`ds-doc-order-${index}`}
                    type="number"
                    min={0}
                    value={doc.order}
                    onChange={(e) => update(index, { order: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="mt-3">
                {doc.source === "HOSTED" ? (
                  <FileUploadField
                    name={`ds-doc-file-${index}`}
                    label="فایل"
                    policy="download.datasheet"
                    accept={DOWNLOAD_ACCEPT}
                    field="datasheet.document"
                    defaultValue={doc.fileUrl}
                    required
                    onUploaded={({ relativePath, sizeBytes }) =>
                      update(index, { fileUrl: relativePath, fileSizeBytes: sizeBytes })
                    }
                  />
                ) : (
                  <div className="flex flex-col gap-1.5" dir="ltr">
                    <Label htmlFor={`ds-doc-url-${index}`}>External URL *</Label>
                    <Input
                      id={`ds-doc-url-${index}`}
                      type="url"
                      placeholder="https://..."
                      value={doc.fileUrl}
                      onChange={(e) => update(index, { fileUrl: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-pishnam-danger mt-2 text-xs">{error}</p>}
    </div>
  );
}
