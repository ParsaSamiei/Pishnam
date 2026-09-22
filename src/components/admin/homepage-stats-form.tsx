"use client";

import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnFieldLabel } from "@/components/admin/en-field-label";
import type { HomepageStatsFormState } from "@/app/admin/(dashboard)/homepage-stats/actions";
import { DEFAULT_HOMEPAGE_STATS_LABELS } from "@/lib/validation/homepage-stats";

interface HomepageStatsFormProps {
  action: (
    prevState: HomepageStatsFormState,
    formData: FormData,
  ) => Promise<HomepageStatsFormState>;
  defaultValues?: {
    boysEnrolled: number;
    girlsEnrolled: number;
    achievements: number;
    boysLabelFa: string;
    boysLabelEn: string;
    girlsLabelFa: string;
    girlsLabelEn: string;
    achievementsLabelFa: string;
    achievementsLabelEn: string;
  };
}

const initialState: HomepageStatsFormState = { status: "idle" };

export function HomepageStatsForm({ action, defaultValues }: HomepageStatsFormProps) {
  const { state, formAction, isPending, formKey, field } = usePreservedFormAction(
    action,
    initialState,
  );

  const labels = {
    boysLabelFa: defaultValues?.boysLabelFa ?? DEFAULT_HOMEPAGE_STATS_LABELS.boysLabelFa,
    boysLabelEn: defaultValues?.boysLabelEn ?? DEFAULT_HOMEPAGE_STATS_LABELS.boysLabelEn,
    girlsLabelFa: defaultValues?.girlsLabelFa ?? DEFAULT_HOMEPAGE_STATS_LABELS.girlsLabelFa,
    girlsLabelEn: defaultValues?.girlsLabelEn ?? DEFAULT_HOMEPAGE_STATS_LABELS.girlsLabelEn,
    achievementsLabelFa:
      defaultValues?.achievementsLabelFa ?? DEFAULT_HOMEPAGE_STATS_LABELS.achievementsLabelFa,
    achievementsLabelEn:
      defaultValues?.achievementsLabelEn ?? DEFAULT_HOMEPAGE_STATS_LABELS.achievementsLabelEn,
  };

  return (
    <form key={formKey} action={formAction} className="flex max-w-2xl flex-col gap-8">
      <fieldset className="flex flex-col gap-5">
        <legend className="text-text-primary text-sm font-semibold">پسران ثبت‌نام‌شده</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="boysEnrolled">تعداد</Label>
          <Input
            id="boysEnrolled"
            name="boysEnrolled"
            type="number"
            inputMode="numeric"
            min={0}
            max={999999}
            step={1}
            dir="ltr"
            defaultValue={field("boysEnrolled", String(defaultValues?.boysEnrolled ?? 0))}
            aria-invalid={Boolean(state.errors?.boysEnrolled)}
          />
          {state.errors?.boysEnrolled ? (
            <p className="text-pishnam-danger text-xs">{state.errors.boysEnrolled}</p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="boysLabelFa">برچسب (فارسی)</Label>
            <Input
              id="boysLabelFa"
              name="boysLabelFa"
              defaultValue={field("boysLabelFa", labels.boysLabelFa)}
              aria-invalid={Boolean(state.errors?.boysLabelFa)}
            />
            {state.errors?.boysLabelFa ? (
              <p className="text-pishnam-danger text-xs">{state.errors.boysLabelFa}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <EnFieldLabel htmlFor="boysLabelEn" sourceName="boysLabelFa" targetName="boysLabelEn">
              برچسب (انگلیسی)
            </EnFieldLabel>
            <Input
              id="boysLabelEn"
              name="boysLabelEn"
              dir="ltr"
              defaultValue={field("boysLabelEn", labels.boysLabelEn)}
              aria-invalid={Boolean(state.errors?.boysLabelEn)}
            />
            {state.errors?.boysLabelEn ? (
              <p className="text-pishnam-danger text-xs">{state.errors.boysLabelEn}</p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="text-text-primary text-sm font-semibold">دختران ثبت‌نام‌شده</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="girlsEnrolled">تعداد</Label>
          <Input
            id="girlsEnrolled"
            name="girlsEnrolled"
            type="number"
            inputMode="numeric"
            min={0}
            max={999999}
            step={1}
            dir="ltr"
            defaultValue={field("girlsEnrolled", String(defaultValues?.girlsEnrolled ?? 0))}
            aria-invalid={Boolean(state.errors?.girlsEnrolled)}
          />
          {state.errors?.girlsEnrolled ? (
            <p className="text-pishnam-danger text-xs">{state.errors.girlsEnrolled}</p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="girlsLabelFa">برچسب (فارسی)</Label>
            <Input
              id="girlsLabelFa"
              name="girlsLabelFa"
              defaultValue={field("girlsLabelFa", labels.girlsLabelFa)}
              aria-invalid={Boolean(state.errors?.girlsLabelFa)}
            />
            {state.errors?.girlsLabelFa ? (
              <p className="text-pishnam-danger text-xs">{state.errors.girlsLabelFa}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <EnFieldLabel
              htmlFor="girlsLabelEn"
              sourceName="girlsLabelFa"
              targetName="girlsLabelEn"
            >
              برچسب (انگلیسی)
            </EnFieldLabel>
            <Input
              id="girlsLabelEn"
              name="girlsLabelEn"
              dir="ltr"
              defaultValue={field("girlsLabelEn", labels.girlsLabelEn)}
              aria-invalid={Boolean(state.errors?.girlsLabelEn)}
            />
            {state.errors?.girlsLabelEn ? (
              <p className="text-pishnam-danger text-xs">{state.errors.girlsLabelEn}</p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="text-text-primary text-sm font-semibold">افتخارات</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="achievements">تعداد</Label>
          <Input
            id="achievements"
            name="achievements"
            type="number"
            inputMode="numeric"
            min={0}
            max={999999}
            step={1}
            dir="ltr"
            defaultValue={field("achievements", String(defaultValues?.achievements ?? 0))}
            aria-invalid={Boolean(state.errors?.achievements)}
          />
          {state.errors?.achievements ? (
            <p className="text-pishnam-danger text-xs">{state.errors.achievements}</p>
          ) : (
            <p className="text-text-secondary text-xs">
              روی سایت با پسوند «+» نمایش داده می‌شود (مثلاً ۱٬۲۰۰+).
            </p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="achievementsLabelFa">برچسب (فارسی)</Label>
            <Input
              id="achievementsLabelFa"
              name="achievementsLabelFa"
              defaultValue={field("achievementsLabelFa", labels.achievementsLabelFa)}
              aria-invalid={Boolean(state.errors?.achievementsLabelFa)}
            />
            {state.errors?.achievementsLabelFa ? (
              <p className="text-pishnam-danger text-xs">{state.errors.achievementsLabelFa}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <EnFieldLabel
              htmlFor="achievementsLabelEn"
              sourceName="achievementsLabelFa"
              targetName="achievementsLabelEn"
            >
              برچسب (انگلیسی)
            </EnFieldLabel>
            <Input
              id="achievementsLabelEn"
              name="achievementsLabelEn"
              dir="ltr"
              defaultValue={field("achievementsLabelEn", labels.achievementsLabelEn)}
              aria-invalid={Boolean(state.errors?.achievementsLabelEn)}
            />
            {state.errors?.achievementsLabelEn ? (
              <p className="text-pishnam-danger text-xs">{state.errors.achievementsLabelEn}</p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        ذخیره آمار
      </Button>
    </form>
  );
}
