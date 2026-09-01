"use client";

import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { ArticleFormState } from "@/app/admin/(dashboard)/articles/actions";

interface ArticleFormProps {
  action: (prevState: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
  defaultValues?: {
    slug: string;
    coverImage: string;
    tags: string[];
    publishedAt: Date;
    titleFa: string;
    excerptFa: string;
    bodyFa: string;
    titleEn: string;
    excerptEn: string;
    bodyEn: string;
  };
  submitLabel: string;
}

const initialState: ArticleFormState = { status: "idle" };

export function ArticleForm({ action, defaultValues, submitLabel }: ArticleFormProps) {
  const { state, formAction, isPending, formKey, field } = usePreservedFormAction(
    action,
    initialState,
  );

  return (
    <form key={formKey} action={formAction} className="flex max-w-3xl flex-col gap-6">
      <ImageUploadField
        name="coverImage"
        label="تصویر شاخص"
        field="article.coverImage"
        defaultValue={field("coverImage", defaultValues?.coverImage)}
        required
        error={state.errors?.coverImage}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="slug">نامک (slug) *</Label>
          <Input
            id="slug"
            name="slug"
            dir="ltr"
            placeholder="robocup-2026-results"
            defaultValue={field("slug", defaultValues?.slug)}
            required
            aria-invalid={Boolean(state.errors?.slug)}
          />
          {state.errors?.slug && <p className="text-pishnam-danger text-xs">{state.errors.slug}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="publishedAt">تاریخ انتشار *</Label>
          <Input
            id="publishedAt"
            name="publishedAt"
            type="date"
            dir="ltr"
            defaultValue={field("publishedAt", defaultValues?.publishedAt)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tags">برچسب‌ها (با کاما جدا کنید)</Label>
        <Input
          id="tags"
          name="tags"
          dir="ltr"
          defaultValue={field("tags", defaultValues?.tags.join(", "))}
        />
      </div>

      <div className="border-border border-t pt-6">
        <h2 className="text-pishnam-steel-600 mb-4 text-sm font-bold">نسخه فارسی</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="titleFa">عنوان *</Label>
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
            <Label htmlFor="excerptFa">چکیده *</Label>
            <Textarea
              id="excerptFa"
              name="excerptFa"
              rows={2}
              defaultValue={field("excerptFa", defaultValues?.excerptFa)}
              required
              aria-invalid={Boolean(state.errors?.excerptFa)}
            />
            {state.errors?.excerptFa && (
              <p className="text-pishnam-danger text-xs">{state.errors.excerptFa}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="richtext-bodyFa">متن کامل *</Label>
            <RichTextEditor
              name="bodyFa"
              defaultValue={field("bodyFa", defaultValues?.bodyFa)}
              error={state.errors?.bodyFa}
            />
          </div>
        </div>
      </div>

      <div className="border-border border-t pt-6">
        <h2 className="text-pishnam-steel-600 mb-4 text-sm font-bold">English version</h2>
        <div className="flex flex-col gap-4" dir="ltr">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="titleEn">Title *</Label>
            <Input
              id="titleEn"
              name="titleEn"
              defaultValue={field("titleEn", defaultValues?.titleEn)}
              required
              aria-invalid={Boolean(state.errors?.titleEn)}
            />
            {state.errors?.titleEn && (
              <p className="text-pishnam-danger text-xs">{state.errors.titleEn}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="excerptEn">Excerpt *</Label>
            <Textarea
              id="excerptEn"
              name="excerptEn"
              rows={2}
              defaultValue={field("excerptEn", defaultValues?.excerptEn)}
              required
              aria-invalid={Boolean(state.errors?.excerptEn)}
            />
            {state.errors?.excerptEn && (
              <p className="text-pishnam-danger text-xs">{state.errors.excerptEn}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="richtext-bodyEn">Full body *</Label>
            <RichTextEditor
              name="bodyEn"
              defaultValue={field("bodyEn", defaultValues?.bodyEn)}
              error={state.errors?.bodyEn}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
