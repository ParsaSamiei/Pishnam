"use client";

import type { ReactNode } from "react";
import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EnFieldLabel } from "@/components/admin/en-field-label";
import type { HomepageContentFormState } from "@/app/admin/(dashboard)/homepage-content/actions";
import type { HomepageContentCopy } from "@/lib/validation/homepage-content";

interface HomepageContentFormProps {
  action: (
    prevState: HomepageContentFormState,
    formData: FormData,
  ) => Promise<HomepageContentFormState>;
  defaultValues: HomepageContentCopy;
}

const initialState: HomepageContentFormState = { status: "idle" };

type FieldFn = ReturnType<typeof usePreservedFormAction<HomepageContentFormState>>["field"];
type Errors = Record<string, string> | undefined;

function FieldError({ errors, name }: { errors: Errors; name: string }) {
  if (!errors?.[name]) return null;
  return <p className="text-pishnam-danger text-xs">{errors[name]}</p>;
}

function BilingualInput({
  nameFa,
  nameEn,
  labelFa,
  labelEn,
  field,
  errors,
  defaultFa,
  defaultEn,
}: {
  nameFa: string;
  nameEn: string;
  labelFa: string;
  labelEn: string;
  field: FieldFn;
  errors: Errors;
  defaultFa: string;
  defaultEn: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={nameFa}>{labelFa}</Label>
        <Input
          id={nameFa}
          name={nameFa}
          defaultValue={field(nameFa, defaultFa)}
          aria-invalid={Boolean(errors?.[nameFa])}
        />
        <FieldError errors={errors} name={nameFa} />
      </div>
      <div className="flex flex-col gap-1.5">
        <EnFieldLabel htmlFor={nameEn} sourceName={nameFa} targetName={nameEn}>
          {labelEn}
        </EnFieldLabel>
        <Input
          id={nameEn}
          name={nameEn}
          dir="ltr"
          defaultValue={field(nameEn, defaultEn)}
          aria-invalid={Boolean(errors?.[nameEn])}
        />
        <FieldError errors={errors} name={nameEn} />
      </div>
    </div>
  );
}

function BilingualTextarea({
  nameFa,
  nameEn,
  labelFa,
  labelEn,
  field,
  errors,
  defaultFa,
  defaultEn,
  rows = 3,
}: {
  nameFa: string;
  nameEn: string;
  labelFa: string;
  labelEn: string;
  field: FieldFn;
  errors: Errors;
  defaultFa: string;
  defaultEn: string;
  rows?: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={nameFa}>{labelFa}</Label>
        <Textarea
          id={nameFa}
          name={nameFa}
          rows={rows}
          defaultValue={field(nameFa, defaultFa)}
          aria-invalid={Boolean(errors?.[nameFa])}
        />
        <FieldError errors={errors} name={nameFa} />
      </div>
      <div className="flex flex-col gap-1.5">
        <EnFieldLabel htmlFor={nameEn} sourceName={nameFa} targetName={nameEn}>
          {labelEn}
        </EnFieldLabel>
        <Textarea
          id={nameEn}
          name={nameEn}
          dir="ltr"
          rows={rows}
          defaultValue={field(nameEn, defaultEn)}
          aria-invalid={Boolean(errors?.[nameEn])}
        />
        <FieldError errors={errors} name={nameEn} />
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-border bg-bg-surface flex flex-col gap-4 rounded-lg border p-5">
      <h2 className="text-text-primary text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function SectionHeadingFields({
  prefix,
  defaults,
  field,
  errors,
}: {
  prefix: string;
  defaults: {
    titleFa: string;
    titleEn: string;
    subtitleFa: string;
    subtitleEn: string;
    viewAllFa: string;
    viewAllEn: string;
  };
  field: FieldFn;
  errors: Errors;
}) {
  return (
    <>
      <BilingualInput
        nameFa={`${prefix}.titleFa`}
        nameEn={`${prefix}.titleEn`}
        labelFa="عنوان (فارسی)"
        labelEn="Title (English)"
        field={field}
        errors={errors}
        defaultFa={defaults.titleFa}
        defaultEn={defaults.titleEn}
      />
      <BilingualTextarea
        nameFa={`${prefix}.subtitleFa`}
        nameEn={`${prefix}.subtitleEn`}
        labelFa="توضیح (فارسی)"
        labelEn="Subtitle (English)"
        field={field}
        errors={errors}
        defaultFa={defaults.subtitleFa}
        defaultEn={defaults.subtitleEn}
        rows={2}
      />
      <BilingualInput
        nameFa={`${prefix}.viewAllFa`}
        nameEn={`${prefix}.viewAllEn`}
        labelFa="لینک مشاهده همه (فارسی)"
        labelEn="View-all link (English)"
        field={field}
        errors={errors}
        defaultFa={defaults.viewAllFa}
        defaultEn={defaults.viewAllEn}
      />
    </>
  );
}

function AudienceCardFields({
  prefix,
  label,
  defaults,
  field,
  errors,
}: {
  prefix: string;
  label: string;
  defaults: {
    titleFa: string;
    titleEn: string;
    descriptionFa: string;
    descriptionEn: string;
    ctaFa: string;
    ctaEn: string;
  };
  field: FieldFn;
  errors: Errors;
}) {
  return (
    <div className="border-border flex flex-col gap-4 rounded-md border border-dashed p-4">
      <h3 className="text-text-primary text-sm font-semibold">{label}</h3>
      <BilingualInput
        nameFa={`${prefix}.titleFa`}
        nameEn={`${prefix}.titleEn`}
        labelFa="عنوان (فارسی)"
        labelEn="Title (English)"
        field={field}
        errors={errors}
        defaultFa={defaults.titleFa}
        defaultEn={defaults.titleEn}
      />
      <BilingualTextarea
        nameFa={`${prefix}.descriptionFa`}
        nameEn={`${prefix}.descriptionEn`}
        labelFa="توضیح (فارسی)"
        labelEn="Description (English)"
        field={field}
        errors={errors}
        defaultFa={defaults.descriptionFa}
        defaultEn={defaults.descriptionEn}
        rows={3}
      />
      <BilingualInput
        nameFa={`${prefix}.ctaFa`}
        nameEn={`${prefix}.ctaEn`}
        labelFa="دکمه (فارسی)"
        labelEn="CTA (English)"
        field={field}
        errors={errors}
        defaultFa={defaults.ctaFa}
        defaultEn={defaults.ctaEn}
      />
    </div>
  );
}

function RelatedSiteFields({
  prefix,
  label,
  defaults,
  field,
  errors,
}: {
  prefix: string;
  label: string;
  defaults: {
    eyebrowFa: string;
    eyebrowEn: string;
    titleFa: string;
    titleEn: string;
    descriptionFa: string;
    descriptionEn: string;
    ctaFa: string;
    ctaEn: string;
  };
  field: FieldFn;
  errors: Errors;
}) {
  return (
    <div className="border-border flex flex-col gap-4 rounded-md border border-dashed p-4">
      <h3 className="text-text-primary text-sm font-semibold">{label}</h3>
      <BilingualInput
        nameFa={`${prefix}.eyebrowFa`}
        nameEn={`${prefix}.eyebrowEn`}
        labelFa="برچسب (فارسی)"
        labelEn="Eyebrow (English)"
        field={field}
        errors={errors}
        defaultFa={defaults.eyebrowFa}
        defaultEn={defaults.eyebrowEn}
      />
      <BilingualInput
        nameFa={`${prefix}.titleFa`}
        nameEn={`${prefix}.titleEn`}
        labelFa="عنوان (فارسی)"
        labelEn="Title (English)"
        field={field}
        errors={errors}
        defaultFa={defaults.titleFa}
        defaultEn={defaults.titleEn}
      />
      <BilingualTextarea
        nameFa={`${prefix}.descriptionFa`}
        nameEn={`${prefix}.descriptionEn`}
        labelFa="توضیح (فارسی)"
        labelEn="Description (English)"
        field={field}
        errors={errors}
        defaultFa={defaults.descriptionFa}
        defaultEn={defaults.descriptionEn}
        rows={3}
      />
      <BilingualInput
        nameFa={`${prefix}.ctaFa`}
        nameEn={`${prefix}.ctaEn`}
        labelFa="دکمه (فارسی)"
        labelEn="CTA (English)"
        field={field}
        errors={errors}
        defaultFa={defaults.ctaFa}
        defaultEn={defaults.ctaEn}
      />
    </div>
  );
}

export function HomepageContentForm({ action, defaultValues }: HomepageContentFormProps) {
  const { state, formAction, isPending, formKey, field } = usePreservedFormAction(
    action,
    initialState,
  );
  const errors = state.errors;
  const d = defaultValues;

  return (
    <form key={formKey} action={formAction} className="flex max-w-4xl flex-col gap-6">
      <SectionCard title="هیرو">
        <BilingualInput
          nameFa="hero.eyebrowFa"
          nameEn="hero.eyebrowEn"
          labelFa="برچسب (فارسی)"
          labelEn="Eyebrow (English)"
          field={field}
          errors={errors}
          defaultFa={d.hero.eyebrowFa}
          defaultEn={d.hero.eyebrowEn}
        />
        <BilingualInput
          nameFa="hero.titlePrefixFa"
          nameEn="hero.titlePrefixEn"
          labelFa="عنوان — قبل از تاکید (فارسی)"
          labelEn="Title prefix (English)"
          field={field}
          errors={errors}
          defaultFa={d.hero.titlePrefixFa}
          defaultEn={d.hero.titlePrefixEn}
        />
        <BilingualInput
          nameFa="hero.titleAccentFa"
          nameEn="hero.titleAccentEn"
          labelFa="عنوان — بخش طلایی (فارسی)"
          labelEn="Title accent (English)"
          field={field}
          errors={errors}
          defaultFa={d.hero.titleAccentFa}
          defaultEn={d.hero.titleAccentEn}
        />
        <BilingualInput
          nameFa="hero.titleSuffixFa"
          nameEn="hero.titleSuffixEn"
          labelFa="عنوان — بعد از تاکید (فارسی)"
          labelEn="Title suffix (English)"
          field={field}
          errors={errors}
          defaultFa={d.hero.titleSuffixFa}
          defaultEn={d.hero.titleSuffixEn}
        />
        <BilingualTextarea
          nameFa="hero.subtitleFa"
          nameEn="hero.subtitleEn"
          labelFa="زیرعنوان (فارسی)"
          labelEn="Subtitle (English)"
          field={field}
          errors={errors}
          defaultFa={d.hero.subtitleFa}
          defaultEn={d.hero.subtitleEn}
          rows={4}
        />
        <BilingualInput
          nameFa="hero.ctaPrimaryFa"
          nameEn="hero.ctaPrimaryEn"
          labelFa="دکمه اصلی (فارسی)"
          labelEn="Primary CTA (English)"
          field={field}
          errors={errors}
          defaultFa={d.hero.ctaPrimaryFa}
          defaultEn={d.hero.ctaPrimaryEn}
        />
        <BilingualInput
          nameFa="hero.ctaSecondaryFa"
          nameEn="hero.ctaSecondaryEn"
          labelFa="دکمه فرعی (فارسی)"
          labelEn="Secondary CTA (English)"
          field={field}
          errors={errors}
          defaultFa={d.hero.ctaSecondaryFa}
          defaultEn={d.hero.ctaSecondaryEn}
        />
      </SectionCard>

      <SectionCard title="مخاطبان">
        <BilingualInput
          nameFa="audiences.titleFa"
          nameEn="audiences.titleEn"
          labelFa="عنوان بخش (فارسی)"
          labelEn="Section title (English)"
          field={field}
          errors={errors}
          defaultFa={d.audiences.titleFa}
          defaultEn={d.audiences.titleEn}
        />
        <BilingualTextarea
          nameFa="audiences.subtitleFa"
          nameEn="audiences.subtitleEn"
          labelFa="توضیح بخش (فارسی)"
          labelEn="Section subtitle (English)"
          field={field}
          errors={errors}
          defaultFa={d.audiences.subtitleFa}
          defaultEn={d.audiences.subtitleEn}
          rows={2}
        />
        <AudienceCardFields
          prefix="audiences.parents"
          label="دانش‌آموزان و والدین"
          defaults={d.audiences.parents}
          field={field}
          errors={errors}
        />
        <AudienceCardFields
          prefix="audiences.schools"
          label="مدارس"
          defaults={d.audiences.schools}
          field={field}
          errors={errors}
        />
        <AudienceCardFields
          prefix="audiences.sponsors"
          label="حامیان"
          defaults={d.audiences.sponsors}
          field={field}
          errors={errors}
        />
      </SectionCard>

      <SectionCard title="افتخارات">
        <SectionHeadingFields
          prefix="achievements"
          defaults={d.achievements}
          field={field}
          errors={errors}
        />
      </SectionCard>

      <SectionCard title="پیشنام در رسانه">
        <SectionHeadingFields
          prefix="mediaMentions"
          defaults={d.mediaMentions}
          field={field}
          errors={errors}
        />
      </SectionCard>

      <SectionCard title="اخبار">
        <SectionHeadingFields prefix="news" defaults={d.news} field={field} errors={errors} />
      </SectionCard>

      <SectionCard title="ویدیوها">
        <SectionHeadingFields prefix="videos" defaults={d.videos} field={field} errors={errors} />
      </SectionCard>

      <SectionCard title="گالری">
        <SectionHeadingFields prefix="gallery" defaults={d.gallery} field={field} errors={errors} />
      </SectionCard>

      <SectionCard title="مرکز دانلود">
        <SectionHeadingFields
          prefix="downloads"
          defaults={d.downloads}
          field={field}
          errors={errors}
        />
      </SectionCard>

      <SectionCard title="سایت‌های مرتبط">
        <BilingualInput
          nameFa="related.titleFa"
          nameEn="related.titleEn"
          labelFa="عنوان بخش (فارسی)"
          labelEn="Section title (English)"
          field={field}
          errors={errors}
          defaultFa={d.related.titleFa}
          defaultEn={d.related.titleEn}
        />
        <BilingualTextarea
          nameFa="related.subtitleFa"
          nameEn="related.subtitleEn"
          labelFa="توضیح بخش (فارسی)"
          labelEn="Section subtitle (English)"
          field={field}
          errors={errors}
          defaultFa={d.related.subtitleFa}
          defaultEn={d.related.subtitleEn}
          rows={2}
        />
        <RelatedSiteFields
          prefix="related.pishcup"
          label="پیشکاپ"
          defaults={d.related.pishcup}
          field={field}
          errors={errors}
        />
        <RelatedSiteFields
          prefix="related.pishtalk"
          label="پیشتاک"
          defaults={d.related.pishtalk}
          field={field}
          errors={errors}
        />
      </SectionCard>

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        ذخیره متن صفحه اصلی
      </Button>
    </form>
  );
}
