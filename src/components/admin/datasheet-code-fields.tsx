"use client";

import { useId, useState } from "react";
import { Code2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { FileUploadField } from "@/components/admin/file-upload-field";
import { DATASHEET_CODE_ACCEPT } from "@/lib/upload-policies";
import { DATASHEET_LANGUAGES, DATASHEET_LANGUAGE_LABELS } from "@/lib/datasheet-languages";

export type DatasheetCodeDraft = {
  titleFa: string;
  titleEn: string;
  language: string;
  code: string;
  notesFa: string;
  notesEn: string;
  source: "HOSTED" | "EXTERNAL" | "";
  fileUrl: string;
  fileSizeBytes: number | null;
  order: number;
};

function emptyCode(order: number): DatasheetCodeDraft {
  return {
    titleFa: "",
    titleEn: "",
    language: "arduino",
    code: "",
    notesFa: "",
    notesEn: "",
    source: "",
    fileUrl: "",
    fileSizeBytes: null,
    order,
  };
}

function parsePreserved(
  raw: string | undefined,
  fallback: DatasheetCodeDraft[],
): DatasheetCodeDraft[] {
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map((item, index) => {
      const sample = item as Partial<DatasheetCodeDraft>;
      const source =
        sample.source === "EXTERNAL" ? "EXTERNAL" : sample.source === "HOSTED" ? "HOSTED" : "";
      return {
        titleFa: String(sample.titleFa ?? ""),
        titleEn: String(sample.titleEn ?? ""),
        language: String(sample.language ?? "arduino"),
        code: String(sample.code ?? ""),
        notesFa: String(sample.notesFa ?? ""),
        notesEn: String(sample.notesEn ?? ""),
        source,
        fileUrl: String(sample.fileUrl ?? ""),
        fileSizeBytes:
          typeof sample.fileSizeBytes === "number" && Number.isFinite(sample.fileSizeBytes)
            ? sample.fileSizeBytes
            : null,
        order: typeof sample.order === "number" ? sample.order : index,
      };
    });
  } catch {
    return fallback;
  }
}

interface DatasheetCodeFieldsProps {
  defaultSamples?: DatasheetCodeDraft[];
  preservedJson?: string;
  error?: string;
}

export function DatasheetCodeFields({
  defaultSamples = [],
  preservedJson,
  error,
}: DatasheetCodeFieldsProps) {
  const listId = useId();
  const [samples, setSamples] = useState<DatasheetCodeDraft[]>(() =>
    parsePreserved(preservedJson, defaultSamples),
  );

  function update(index: number, patch: Partial<DatasheetCodeDraft>) {
    setSamples((prev) => prev.map((sample, i) => (i === index ? { ...sample, ...patch } : sample)));
  }

  return (
    <div className="border-border border-t pt-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-pishnam-steel-600 text-sm font-bold">نمونه کد</h2>
          <p className="text-text-secondary mt-1 text-xs">
            اختیاری — متن نمونه روی صفحه، فایل قابل دانلود، یا هر دو.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSamples((prev) => [...prev, emptyCode(prev.length)])}
          className="cursor-pointer"
        >
          <Plus className="size-4" aria-hidden="true" />
          افزودن نمونه کد
        </Button>
      </div>

      <input type="hidden" name="codeJson" value={JSON.stringify(samples)} />

      {samples.length === 0 ? (
        <p className="text-text-secondary border-border bg-bg-surface-alt rounded-lg border border-dashed px-4 py-6 text-center text-sm">
          نمونه کدی اضافه نشده است.
        </p>
      ) : (
        <ul className="flex flex-col gap-4" aria-labelledby={listId}>
          <span id={listId} className="sr-only">
            فهرست نمونه کدها
          </span>
          {samples.map((sample, index) => (
            <li
              key={`code-${index}`}
              className="border-border bg-bg-surface-alt/60 rounded-xl border p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-text-primary flex items-center gap-2 text-sm font-semibold">
                  <Code2 className="text-pishnam-gold-600 size-4 shrink-0" aria-hidden="true" />
                  نمونه {index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSamples((prev) =>
                      prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })),
                    )
                  }
                  className="text-pishnam-danger cursor-pointer"
                  aria-label={`حذف نمونه کد ${index + 1}`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  حذف
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`ds-code-title-fa-${index}`}>عنوان فارسی *</Label>
                  <Input
                    id={`ds-code-title-fa-${index}`}
                    value={sample.titleFa}
                    onChange={(e) => update(index, { titleFa: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5" dir="ltr">
                  <Label htmlFor={`ds-code-title-en-${index}`}>English title *</Label>
                  <Input
                    id={`ds-code-title-en-${index}`}
                    value={sample.titleEn}
                    onChange={(e) => update(index, { titleEn: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`ds-code-lang-${index}`}>زبان *</Label>
                  <NativeSelect
                    id={`ds-code-lang-${index}`}
                    value={sample.language}
                    onChange={(e) => update(index, { language: e.target.value })}
                  >
                    {DATASHEET_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {DATASHEET_LANGUAGE_LABELS[lang].fa}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`ds-code-file-source-${index}`}>فایل همراه (اختیاری)</Label>
                  <NativeSelect
                    id={`ds-code-file-source-${index}`}
                    value={sample.source}
                    onChange={(e) =>
                      update(index, {
                        source:
                          e.target.value === "EXTERNAL"
                            ? "EXTERNAL"
                            : e.target.value === "HOSTED"
                              ? "HOSTED"
                              : "",
                        fileUrl: "",
                        fileSizeBytes: null,
                      })
                    }
                  >
                    <option value="">بدون فایل</option>
                    <option value="HOSTED">آپلود فایل</option>
                    <option value="EXTERNAL">لینک خارجی</option>
                  </NativeSelect>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-1.5" dir="ltr">
                <Label htmlFor={`ds-code-body-${index}`}>Code</Label>
                <Textarea
                  id={`ds-code-body-${index}`}
                  rows={8}
                  className="font-mono text-sm"
                  value={sample.code}
                  onChange={(e) => update(index, { code: e.target.value })}
                  spellCheck={false}
                />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`ds-code-notes-fa-${index}`}>یادداشت فارسی</Label>
                  <Textarea
                    id={`ds-code-notes-fa-${index}`}
                    rows={2}
                    value={sample.notesFa}
                    onChange={(e) => update(index, { notesFa: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5" dir="ltr">
                  <Label htmlFor={`ds-code-notes-en-${index}`}>English notes</Label>
                  <Textarea
                    id={`ds-code-notes-en-${index}`}
                    rows={2}
                    value={sample.notesEn}
                    onChange={(e) => update(index, { notesEn: e.target.value })}
                  />
                </div>
              </div>

              {sample.source === "HOSTED" ? (
                <div className="mt-3">
                  <FileUploadField
                    name={`ds-code-file-${index}`}
                    label="فایل نمونه کد"
                    policy="datasheet.code"
                    accept={DATASHEET_CODE_ACCEPT}
                    field="datasheet.codeFile"
                    defaultValue={sample.fileUrl}
                    onUploaded={({ relativePath, sizeBytes }) =>
                      update(index, { fileUrl: relativePath, fileSizeBytes: sizeBytes })
                    }
                  />
                </div>
              ) : null}

              {sample.source === "EXTERNAL" ? (
                <div className="mt-3 flex flex-col gap-1.5" dir="ltr">
                  <Label htmlFor={`ds-code-url-${index}`}>External URL</Label>
                  <Input
                    id={`ds-code-url-${index}`}
                    type="url"
                    placeholder="https://..."
                    value={sample.fileUrl}
                    onChange={(e) => update(index, { fileUrl: e.target.value })}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-pishnam-danger mt-2 text-xs">{error}</p>}
    </div>
  );
}
