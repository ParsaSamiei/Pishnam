"use client";

import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { CourseVideoFields, type CourseVideoSource } from "@/components/admin/course-video-fields";
import {
  CourseDocumentsFields,
  type CourseDocumentDraft,
} from "@/components/admin/course-documents-fields";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { TIERS, TIER_LABELS } from "@/lib/tier-labels";
import type { CourseFormState } from "@/app/admin/(dashboard)/courses/actions";

interface CourseFormProps {
  action: (prevState: CourseFormState, formData: FormData) => Promise<CourseFormState>;
  defaultValues?: {
    slug: string;
    tier: string;
    topicTags: string[];
    coverImage: string;
    aparatUrl: string | null;
    hostedVideo: string | null;
    videoThumbnail: string | null;
    videoSource?: CourseVideoSource;
    order: number;
    active: boolean;
    titleFa: string;
    excerptFa: string;
    bodyFa: string;
    prerequisitesFa: string | null;
    pastResultsFa: string | null;
    learningOutcomesFa: string;
    titleEn: string;
    excerptEn: string;
    bodyEn: string;
    prerequisitesEn: string | null;
    pastResultsEn: string | null;
    learningOutcomesEn: string;
    documents?: CourseDocumentDraft[];
  };
  submitLabel: string;
}

const initialState: CourseFormState = { status: "idle" };

export function CourseForm({ action, defaultValues, submitLabel }: CourseFormProps) {
  const { state, formAction, isPending, formKey, field, checked } = usePreservedFormAction(
    action,
    initialState,
  );

  const inferredVideoSource: CourseVideoSource =
    defaultValues?.videoSource ??
    (defaultValues?.hostedVideo ? "hosted" : defaultValues?.aparatUrl ? "aparat" : "none");

  return (
    <form key={formKey} action={formAction} className="flex max-w-3xl flex-col gap-6">
      <ImageUploadField
        name="coverImage"
        label="تصویر شاخص"
        field="course.coverImage"
        defaultValue={field("coverImage", defaultValues?.coverImage)}
        required
        error={state.errors?.coverImage}
      />

      <CourseVideoFields
        defaultSource={field("videoSource", inferredVideoSource) as CourseVideoSource}
        aparatUrl={field("aparatUrl", defaultValues?.aparatUrl ?? "")}
        hostedVideo={field("hostedVideo", defaultValues?.hostedVideo ?? "")}
        videoThumbnail={field("videoThumbnail", defaultValues?.videoThumbnail ?? "")}
        errors={{
          aparatUrl: state.errors?.aparatUrl,
          hostedVideo: state.errors?.hostedVideo,
          videoThumbnail: state.errors?.videoThumbnail,
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">نامک (slug) *</Label>
          <Input
            id="slug"
            name="slug"
            dir="ltr"
            placeholder="rescue-line-basics"
            defaultValue={field("slug", defaultValues?.slug)}
            required
            aria-invalid={Boolean(state.errors?.slug)}
          />
          {state.errors?.slug && <p className="text-pishnam-danger text-xs">{state.errors.slug}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tier">مقطع تحصیلی *</Label>
          <NativeSelect
            id="tier"
            name="tier"
            defaultValue={field("tier", defaultValues?.tier ?? TIERS[0])}
            required
          >
            {TIERS.map((tierValue) => (
              <option key={tierValue} value={tierValue}>
                {TIER_LABELS.fa[tierValue]}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="topicTags">برچسب‌های موضوعی (با کاما جدا کنید)</Label>
          <Input
            id="topicTags"
            name="topicTags"
            dir="ltr"
            placeholder="electronics, rescue-line"
            defaultValue={field("topicTags", defaultValues?.topicTags.join(", "))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="order">ترتیب نمایش</Label>
          <Input
            id="order"
            name="order"
            type="number"
            min={0}
            defaultValue={field("order", defaultValues?.order ?? 0)}
          />
        </div>
      </div>

      <label className="text-text-primary flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={checked("active", defaultValues?.active ?? true)}
          className="border-border accent-pishnam-gold-500 size-4 rounded"
        />
        نمایش عمومی این دوره
      </label>

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
            <Label htmlFor="richtext-bodyFa">متن کامل دوره *</Label>
            <RichTextEditor
              name="bodyFa"
              defaultValue={field("bodyFa", defaultValues?.bodyFa)}
              error={state.errors?.bodyFa}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prerequisitesFa">پیش‌نیازها</Label>
            <Textarea
              id="prerequisitesFa"
              name="prerequisitesFa"
              rows={2}
              defaultValue={field("prerequisitesFa", defaultValues?.prerequisitesFa ?? "")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="learningOutcomesFa">آنچه در این دوره به‌دست می‌آورید</Label>
            <Textarea
              id="learningOutcomesFa"
              name="learningOutcomesFa"
              rows={4}
              placeholder={
                "هر دستاورد در یک خط\nمثال: ساخت ربات خط‌یاب کامل\nمثال: آمادگی شرکت در مسابقات"
              }
              defaultValue={field("learningOutcomesFa", defaultValues?.learningOutcomesFa ?? "")}
            />
            <p className="text-text-secondary text-xs">اختیاری — هر مورد را در یک خط بنویسید.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pastResultsFa">نتایج سال‌های گذشته</Label>
            <Textarea
              id="pastResultsFa"
              name="pastResultsFa"
              rows={4}
              placeholder="مثال: در سه سال اخیر، تیم‌های این دوره موفق به کسب مقام در مسابقات کشوری شده‌اند..."
              defaultValue={field("pastResultsFa", defaultValues?.pastResultsFa ?? "")}
            />
            <p className="text-text-secondary text-xs">
              اختیاری — متن آزاد درباره افتخارات و نتایج دوره‌های پیشین.
            </p>
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
            <Label htmlFor="richtext-bodyEn">Full course body *</Label>
            <RichTextEditor
              name="bodyEn"
              defaultValue={field("bodyEn", defaultValues?.bodyEn)}
              error={state.errors?.bodyEn}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prerequisitesEn">Prerequisites</Label>
            <Textarea
              id="prerequisitesEn"
              name="prerequisitesEn"
              rows={2}
              defaultValue={field("prerequisitesEn", defaultValues?.prerequisitesEn ?? "")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="learningOutcomesEn">What you will achieve</Label>
            <Textarea
              id="learningOutcomesEn"
              name="learningOutcomesEn"
              rows={4}
              placeholder={"One outcome per line\nExample: Build a complete line-follower robot"}
              defaultValue={field("learningOutcomesEn", defaultValues?.learningOutcomesEn ?? "")}
            />
            <p className="text-text-secondary text-xs">Optional — one outcome per line.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pastResultsEn">Results from previous years</Label>
            <Textarea
              id="pastResultsEn"
              name="pastResultsEn"
              rows={4}
              placeholder="Optional narrative of past competition results and alumni outcomes..."
              defaultValue={field("pastResultsEn", defaultValues?.pastResultsEn ?? "")}
            />
            <p className="text-text-secondary text-xs">
              Optional free-text track record for this course.
            </p>
          </div>
        </div>
      </div>

      <CourseDocumentsFields
        defaultDocuments={defaultValues?.documents ?? []}
        preservedJson={state.values?.documentsJson}
        error={state.errors?.documentsJson}
      />

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
