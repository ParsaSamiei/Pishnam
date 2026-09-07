"use client";

import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HomepageStatsFormState } from "@/app/admin/(dashboard)/homepage-stats/actions";

interface HomepageStatsFormProps {
  action: (
    prevState: HomepageStatsFormState,
    formData: FormData,
  ) => Promise<HomepageStatsFormState>;
  defaultValues?: {
    boysEnrolled: number;
    girlsEnrolled: number;
    achievements: number;
  };
}

const initialState: HomepageStatsFormState = { status: "idle" };

export function HomepageStatsForm({ action, defaultValues }: HomepageStatsFormProps) {
  const { state, formAction, isPending, formKey, field } = usePreservedFormAction(
    action,
    initialState,
  );

  return (
    <form key={formKey} action={formAction} className="flex max-w-xl flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="boysEnrolled">پسران ثبت‌نام‌شده</Label>
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="girlsEnrolled">دختران ثبت‌نام‌شده</Label>
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="achievements">افتخارات</Label>
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

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        ذخیره آمار
      </Button>
    </form>
  );
}
