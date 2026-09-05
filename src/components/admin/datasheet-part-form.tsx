"use client";

import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  DatasheetDocumentsFields,
  type DatasheetDocumentDraft,
} from "@/components/admin/datasheet-documents-fields";
import {
  DatasheetVideosFields,
  type DatasheetVideoDraft,
} from "@/components/admin/datasheet-videos-fields";
import {
  DatasheetImagesFields,
  type DatasheetImageDraft,
} from "@/components/admin/datasheet-images-fields";
import {
  DatasheetCodeFields,
  type DatasheetCodeDraft,
} from "@/components/admin/datasheet-code-fields";
import type { DatasheetPartFormState } from "@/app/admin/(dashboard)/datasheets/actions";

interface DatasheetPartFormProps {
  action: (
    prevState: DatasheetPartFormState,
    formData: FormData,
  ) => Promise<DatasheetPartFormState>;
  defaultValues?: {
    parentId?: string | null;
    slug: string;
    image: string;
    titleFa: string;
    titleEn: string;
    excerptFa: string | null;
    excerptEn: string | null;
    bodyFa: string | null;
    bodyEn: string | null;
    order: number;
    active: boolean;
    documents?: DatasheetDocumentDraft[];
    videos?: DatasheetVideoDraft[];
    images?: DatasheetImageDraft[];
    codeSamples?: DatasheetCodeDraft[];
  };
  parentSlug?: string | null;
  variant?: boolean;
  submitLabel: string;
}

const initialState: DatasheetPartFormState = { status: "idle" };

export function DatasheetPartForm({
  action,
  defaultValues,
  parentSlug,
  variant = false,
  submitLabel,
}: DatasheetPartFormProps) {
  const { state, formAction, isPending, formKey, field, checked } = usePreservedFormAction(
    action,
    initialState,
  );

  const publicPath = variant
    ? `/downloads/datasheets/${parentSlug || "..."}/${defaultValues?.slug || "..."}`
    : `/downloads/datasheets/${defaultValues?.slug || "..."}`;

  return (
    <form key={formKey} action={formAction} className="flex max-w-3xl flex-col gap-5">
      {defaultValues?.parentId ? (
        <input type="hidden" name="parentId" value={defaultValues.parentId} />
      ) : null}

      <ImageUploadField
        name="image"
        label="تصویر قطعه"
        field="datasheetPart.image"
        defaultValue={field("image", defaultValues?.image)}
        required
        error={state.errors?.image}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">نامک (slug) *</Label>
        <Input
          id="slug"
          name="slug"
          dir="ltr"
          placeholder={variant ? "16x2" : "lcd"}
          defaultValue={field("slug", defaultValues?.slug)}
          required
          aria-invalid={Boolean(state.errors?.slug)}
        />
        {state.errors?.slug && <p className="text-pishnam-danger text-xs">{state.errors.slug}</p>}
        <p className="text-text-secondary text-xs" dir="ltr">
          {publicPath}
        </p>
      </div>

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
          <Label htmlFor="excerptFa">چکیده (فارسی)</Label>
          <Textarea
            id="excerptFa"
            name="excerptFa"
            rows={3}
            defaultValue={field("excerptFa", defaultValues?.excerptFa ?? "")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="excerptEn">Excerpt (English)</Label>
          <Textarea
            id="excerptEn"
            name="excerptEn"
            dir="ltr"
            rows={3}
            defaultValue={field("excerptEn", defaultValues?.excerptEn ?? "")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>متن توضیحات (فارسی)</Label>
        <RichTextEditor
          name="bodyFa"
          defaultValue={field("bodyFa", defaultValues?.bodyFa ?? "")}
          error={state.errors?.bodyFa}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Body (English)</Label>
        <RichTextEditor
          name="bodyEn"
          defaultValue={field("bodyEn", defaultValues?.bodyEn ?? "")}
          error={state.errors?.bodyEn}
        />
      </div>

      <div className="flex flex-col gap-1.5 sm:max-w-40">
        <Label htmlFor="order">ترتیب نمایش</Label>
        <Input
          id="order"
          name="order"
          type="number"
          min={0}
          defaultValue={field("order", defaultValues?.order ?? 0)}
        />
      </div>

      <label className="text-text-primary flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={checked("active", defaultValues?.active ?? true)}
          className="border-border accent-pishnam-gold-500 size-4 rounded"
        />
        نمایش در مرکز دانلود
      </label>

      <DatasheetDocumentsFields
        defaultDocuments={defaultValues?.documents}
        preservedJson={state.values?.documentsJson}
        error={state.errors?.documentsJson}
      />
      <DatasheetVideosFields
        defaultVideos={defaultValues?.videos}
        preservedJson={state.values?.videosJson}
        error={state.errors?.videosJson}
      />
      <DatasheetImagesFields
        defaultImages={defaultValues?.images}
        preservedJson={state.values?.imagesJson}
        error={state.errors?.imagesJson}
      />
      <DatasheetCodeFields
        defaultSamples={defaultValues?.codeSamples}
        preservedJson={state.values?.codeJson}
        error={state.errors?.codeJson}
      />

      {state.errors?.parentId && (
        <p className="text-pishnam-danger text-sm" role="alert">
          {state.errors.parentId}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="cursor-pointer">
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
