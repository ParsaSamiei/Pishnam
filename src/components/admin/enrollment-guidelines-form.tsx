"use client";

import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { EnrollmentGuidelinesFormState } from "@/app/admin/(dashboard)/enrollment-guidelines/actions";

interface EnrollmentGuidelinesFormProps {
  action: (
    prevState: EnrollmentGuidelinesFormState,
    formData: FormData,
  ) => Promise<EnrollmentGuidelinesFormState>;
  defaultValues?: {
    active: boolean;
    titleFa: string;
    titleEn: string;
    introFa: string;
    introEn: string;
    bodyFa: string;
    bodyEn: string;
  };
}

const initialState: EnrollmentGuidelinesFormState = { status: "idle" };

export function EnrollmentGuidelinesForm({ action, defaultValues }: EnrollmentGuidelinesFormProps) {
  const { state, formAction, isPending, formKey, field } = usePreservedFormAction(
    action,
    initialState,
  );

  return (
    <form key={formKey} action={formAction} className="flex max-w-3xl flex-col gap-5">
      <div className="border-border bg-bg-surface flex items-start gap-3 rounded-md border p-4">
        <input
          id="active"
          name="active"
          type="checkbox"
          defaultChecked={defaultValues?.active ?? true}
          className="border-border text-pishnam-steel-600 mt-1 size-4 rounded"
        />
        <div className="flex flex-col gap-1">
          <Label htmlFor="active" className="cursor-pointer font-semibold">
            نمایش راهنما قبل از فرم ثبت‌نام
          </Label>
          <p className="text-text-secondary text-xs">
            وقتی فعال است و متن بدنه پر شده باشد، کاربر باید راهنما را بخواند و تأیید کند.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titleFa">عنوان (فارسی)</Label>
          <Input
            id="titleFa"
            name="titleFa"
            defaultValue={field("titleFa", defaultValues?.titleFa ?? "راهنمای ثبت‌نام")}
            aria-invalid={Boolean(state.errors?.titleFa)}
          />
          {state.errors?.titleFa && (
            <p className="text-pishnam-danger text-xs">{state.errors.titleFa}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titleEn">Title (English)</Label>
          <Input
            id="titleEn"
            name="titleEn"
            dir="ltr"
            defaultValue={field("titleEn", defaultValues?.titleEn ?? "Before you apply")}
            aria-invalid={Boolean(state.errors?.titleEn)}
          />
          {state.errors?.titleEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.titleEn}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="introFa">مقدمه کوتاه (فارسی)</Label>
        <Textarea
          id="introFa"
          name="introFa"
          rows={2}
          defaultValue={field(
            "introFa",
            defaultValues?.introFa ??
              "لطفاً موارد زیر را با دقت بخوانید تا از شرایط کلاس‌ها و قوانین پیشنام آگاه شوید.",
          )}
          aria-invalid={Boolean(state.errors?.introFa)}
        />
        {state.errors?.introFa && (
          <p className="text-pishnam-danger text-xs">{state.errors.introFa}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="introEn">Short intro (English)</Label>
        <Textarea
          id="introEn"
          name="introEn"
          dir="ltr"
          rows={2}
          defaultValue={field(
            "introEn",
            defaultValues?.introEn ??
              "Please read the following so you know what to expect from Pishnam classes and how we work together.",
          )}
          aria-invalid={Boolean(state.errors?.introEn)}
        />
        {state.errors?.introEn && (
          <p className="text-pishnam-danger text-xs">{state.errors.introEn}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>متن راهنما (فارسی)</Label>
        <RichTextEditor
          name="bodyFa"
          defaultValue={field("bodyFa", defaultValues?.bodyFa ?? "")}
          error={state.errors?.bodyFa}
        />
        <p className="text-text-secondary text-xs">
          از سرتیتر (H2/H3) برای بخش‌بندی و از فهرست شماره‌دار برای قوانین استفاده کنید.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Guidelines body (English)</Label>
        <RichTextEditor
          name="bodyEn"
          defaultValue={field("bodyEn", defaultValues?.bodyEn ?? "")}
          error={state.errors?.bodyEn}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="cursor-pointer">
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          ذخیره راهنما
        </Button>
      </div>
    </form>
  );
}
