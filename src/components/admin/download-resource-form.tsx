"use client";

import { useState } from "react";
import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { FileUploadField } from "@/components/admin/file-upload-field";
import { DOWNLOAD_CATEGORIES } from "@/lib/download-categories";
import { DOWNLOAD_ACCEPT, type UploadPolicyKey } from "@/lib/upload-policies";
import type { DownloadResourceFormState } from "@/app/admin/(dashboard)/downloads/actions";

interface DownloadResourceFormProps {
  action: (
    prevState: DownloadResourceFormState,
    formData: FormData,
  ) => Promise<DownloadResourceFormState>;
  defaultValues?: {
    category: string;
    source: string;
    cadTool: string | null;
    titleFa: string;
    titleEn: string;
    descriptionFa: string | null;
    descriptionEn: string | null;
    fileUrl: string;
    fileSizeBytes: number | null;
  };
  submitLabel: string;
}

const CATEGORY_POLICY: Record<string, { policy: UploadPolicyKey; accept: string }> = {
  DATASHEETS: { policy: "download.datasheet", accept: DOWNLOAD_ACCEPT },
  BOOKS: { policy: "download.book", accept: DOWNLOAD_ACCEPT },
  COMPONENT_LIBRARIES: { policy: "download.componentLibrary", accept: DOWNLOAD_ACCEPT },
};

const initialState: DownloadResourceFormState = { status: "idle" };

type DownloadResourceFormFieldsProps = Omit<DownloadResourceFormProps, "action"> & {
  state: DownloadResourceFormState;
  field: ReturnType<typeof usePreservedFormAction<DownloadResourceFormState>>["field"];
  isPending: boolean;
};

function DownloadResourceFormFields({
  defaultValues,
  submitLabel,
  state,
  field,
  isPending,
}: DownloadResourceFormFieldsProps) {
  const [category, setCategory] = useState(() =>
    field("category", defaultValues?.category ?? "DATASHEETS"),
  );
  const [source, setSource] = useState(() => field("source", defaultValues?.source ?? "HOSTED"));
  const [fileSizeBytes, setFileSizeBytes] = useState(() =>
    Number(field("fileSizeBytes", defaultValues?.fileSizeBytes ?? 0)),
  );

  const uploadConfig = CATEGORY_POLICY[category] ?? CATEGORY_POLICY.DATASHEETS!;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">دسته‌بندی *</Label>
          <NativeSelect
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {DOWNLOAD_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.labelFa}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="source">نوع منبع *</Label>
          <NativeSelect
            id="source"
            name="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
          >
            <option value="HOSTED">فایل آپلودی</option>
            <option value="EXTERNAL">لینک خارجی</option>
          </NativeSelect>
        </div>
      </div>

      {category === "COMPONENT_LIBRARIES" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cadTool">نرم‌افزار CAD</Label>
          <Input
            id="cadTool"
            name="cadTool"
            placeholder="SolidWorks, Altium, ..."
            defaultValue={field("cadTool", defaultValues?.cadTool ?? "")}
          />
        </div>
      )}

      {source === "HOSTED" ? (
        <>
          <FileUploadField
            name="fileUrl"
            label="فایل *"
            policy={uploadConfig.policy}
            accept={uploadConfig.accept}
            field={`download.${category.toLowerCase()}`}
            defaultValue={field(
              "fileUrl",
              defaultValues?.source === "HOSTED" ? defaultValues.fileUrl : undefined,
            )}
            required
            error={state.errors?.fileUrl}
            onUploaded={(result) => setFileSizeBytes(result.sizeBytes)}
          />
          <input type="hidden" name="fileSizeBytes" value={fileSizeBytes} />
        </>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fileUrl">آدرس لینک خارجی *</Label>
          <Input
            id="fileUrl"
            name="fileUrl"
            dir="ltr"
            placeholder="https://..."
            defaultValue={field(
              "fileUrl",
              defaultValues?.source === "EXTERNAL" ? defaultValues.fileUrl : undefined,
            )}
            required
            aria-invalid={Boolean(state.errors?.fileUrl)}
          />
          {state.errors?.fileUrl && (
            <p className="text-pishnam-danger text-xs">{state.errors.fileUrl}</p>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titleFa">عنوان (فارسی) *</Label>
          <Input
            id="titleFa"
            name="titleFa"
            defaultValue={field("titleFa", defaultValues?.titleFa)}
            required
            aria-invalid={Boolean(state.errors?.titleFa)}
          />
          {state.errors?.titleFa && (
            <p className="text-pishnam-danger text-xs">{state.errors.titleFa}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titleEn">Title (English) *</Label>
          <Input
            id="titleEn"
            name="titleEn"
            dir="ltr"
            defaultValue={field("titleEn", defaultValues?.titleEn)}
            required
            aria-invalid={Boolean(state.errors?.titleEn)}
          />
          {state.errors?.titleEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.titleEn}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descriptionFa">توضیحات (فارسی)</Label>
          <Textarea
            id="descriptionFa"
            name="descriptionFa"
            rows={3}
            defaultValue={field("descriptionFa", defaultValues?.descriptionFa ?? "")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descriptionEn">Description (English)</Label>
          <Textarea
            id="descriptionEn"
            name="descriptionEn"
            dir="ltr"
            rows={3}
            defaultValue={field("descriptionEn", defaultValues?.descriptionEn ?? "")}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </>
  );
}

export function DownloadResourceForm({
  action,
  defaultValues,
  submitLabel,
}: DownloadResourceFormProps) {
  const { state, formAction, isPending, formKey, field } = usePreservedFormAction(
    action,
    initialState,
  );

  return (
    <form key={formKey} action={formAction} className="flex max-w-2xl flex-col gap-5">
      <DownloadResourceFormFields
        key={formKey}
        defaultValues={defaultValues}
        submitLabel={submitLabel}
        state={state}
        field={field}
        isPending={isPending}
      />
    </form>
  );
}
