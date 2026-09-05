"use client";

import { useId, useState } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { FileUploadField } from "@/components/admin/file-upload-field";
import { COURSE_DOCUMENT_ACCEPT } from "@/lib/upload-policies";

export type CourseDocumentDraft = {
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  source: "HOSTED" | "EXTERNAL";
  fileUrl: string;
  fileSizeBytes: number | null;
  order: number;
  active: boolean;
};

function emptyDocument(order: number): CourseDocumentDraft {
  return {
    titleFa: "",
    titleEn: "",
    descriptionFa: "",
    descriptionEn: "",
    source: "HOSTED",
    fileUrl: "",
    fileSizeBytes: null,
    order,
    active: true,
  };
}

function parsePreservedDocuments(
  raw: string | undefined,
  fallback: CourseDocumentDraft[],
): CourseDocumentDraft[] {
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map((item, index) => {
      const doc = item as Partial<CourseDocumentDraft>;
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
        active: doc.active !== false,
      };
    });
  } catch {
    return fallback;
  }
}

interface CourseDocumentsFieldsProps {
  defaultDocuments?: CourseDocumentDraft[];
  preservedJson?: string;
  error?: string;
}

export function CourseDocumentsFields({
  defaultDocuments = [],
  preservedJson,
  error,
}: CourseDocumentsFieldsProps) {
  const listId = useId();
  const [documents, setDocuments] = useState<CourseDocumentDraft[]>(() =>
    parsePreservedDocuments(preservedJson, defaultDocuments),
  );

  function updateDocument(index: number, patch: Partial<CourseDocumentDraft>) {
    setDocuments((prev) => prev.map((doc, i) => (i === index ? { ...doc, ...patch } : doc)));
  }

  function removeDocument(index: number) {
    setDocuments((prev) =>
      prev.filter((_, i) => i !== index).map((doc, i) => ({ ...doc, order: i })),
    );
  }

  function addDocument() {
    setDocuments((prev) => [...prev, emptyDocument(prev.length)]);
  }

  return (
    <div className="border-border border-t pt-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-pishnam-steel-600 text-sm font-bold">اسناد مرتبط با دوره</h2>
          <p className="text-text-secondary mt-1 text-xs">
            اختیاری — فایل‌ها یا لینک‌هایی که فقط در صفحه همین دوره نمایش داده می‌شوند.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDocument}
          className="cursor-pointer"
        >
          <Plus className="size-4" aria-hidden="true" />
          افزودن سند
        </Button>
      </div>

      <input type="hidden" name="documentsJson" value={JSON.stringify(documents)} />

      {documents.length === 0 ? (
        <p className="text-text-secondary border-border bg-bg-surface-alt rounded-lg border border-dashed px-4 py-6 text-center text-sm">
          سندی اضافه نشده است.
        </p>
      ) : (
        <ul className="flex flex-col gap-4" aria-labelledby={listId}>
          <span id={listId} className="sr-only">
            فهرست اسناد دوره
          </span>
          {documents.map((doc, index) => (
            <li
              key={`doc-${index}`}
              className="border-border bg-bg-surface-alt/60 rounded-xl border p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-text-primary flex items-center gap-2 text-sm font-semibold">
                  <FileText className="text-pishnam-gold-600 size-4 shrink-0" aria-hidden="true" />
                  سند {index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(index)}
                  className="text-pishnam-danger cursor-pointer"
                  aria-label={`حذف سند ${index + 1}`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  حذف
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`doc-title-fa-${index}`}>عنوان فارسی *</Label>
                  <Input
                    id={`doc-title-fa-${index}`}
                    value={doc.titleFa}
                    onChange={(e) => updateDocument(index, { titleFa: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5" dir="ltr">
                  <Label htmlFor={`doc-title-en-${index}`}>English title *</Label>
                  <Input
                    id={`doc-title-en-${index}`}
                    value={doc.titleEn}
                    onChange={(e) => updateDocument(index, { titleEn: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`doc-desc-fa-${index}`}>توضیح فارسی</Label>
                  <Textarea
                    id={`doc-desc-fa-${index}`}
                    rows={2}
                    value={doc.descriptionFa}
                    onChange={(e) => updateDocument(index, { descriptionFa: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5" dir="ltr">
                  <Label htmlFor={`doc-desc-en-${index}`}>English description</Label>
                  <Textarea
                    id={`doc-desc-en-${index}`}
                    rows={2}
                    value={doc.descriptionEn}
                    onChange={(e) => updateDocument(index, { descriptionEn: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`doc-source-${index}`}>نوع منبع *</Label>
                  <NativeSelect
                    id={`doc-source-${index}`}
                    value={doc.source}
                    onChange={(e) =>
                      updateDocument(index, {
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
                  <Label htmlFor={`doc-order-${index}`}>ترتیب</Label>
                  <Input
                    id={`doc-order-${index}`}
                    type="number"
                    min={0}
                    value={doc.order}
                    onChange={(e) => updateDocument(index, { order: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="mt-3">
                {doc.source === "HOSTED" ? (
                  <FileUploadField
                    name={`doc-file-${index}`}
                    label="فایل سند"
                    policy="course.document"
                    accept={COURSE_DOCUMENT_ACCEPT}
                    field="course.document"
                    defaultValue={doc.fileUrl}
                    required
                    onUploaded={({ relativePath, sizeBytes }) =>
                      updateDocument(index, {
                        fileUrl: relativePath,
                        fileSizeBytes: sizeBytes,
                      })
                    }
                  />
                ) : (
                  <div className="flex flex-col gap-1.5" dir="ltr">
                    <Label htmlFor={`doc-url-${index}`}>External URL *</Label>
                    <Input
                      id={`doc-url-${index}`}
                      type="url"
                      placeholder="https://..."
                      value={doc.fileUrl}
                      onChange={(e) => updateDocument(index, { fileUrl: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Keep file URL in the JSON even when FileUploadField's own input name is unused */}
              {!doc.fileUrl && doc.source === "HOSTED" ? (
                <p className="text-pishnam-danger mt-2 text-xs">
                  آپلود فایل برای این سند الزامی است.
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
