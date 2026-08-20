"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { WEEKDAY_LABELS } from "@/lib/format";
import type { ClassSessionFormState } from "@/app/admin/(dashboard)/classes/actions";

interface ClassSessionFormProps {
  action: (prevState: ClassSessionFormState, formData: FormData) => Promise<ClassSessionFormState>;
  courses: { id: string; title: string }[];
  defaultValues?: {
    courseId: string;
    weekday: number;
    startTime: string;
    endTime: string;
    location: string;
    capacityNote: string | null;
    active: boolean;
  };
  submitLabel: string;
}

const initialState: ClassSessionFormState = { status: "idle" };

export function ClassSessionForm({
  action,
  courses,
  defaultValues,
  submitLabel,
}: ClassSessionFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="courseId">دوره *</Label>
        <NativeSelect
          id="courseId"
          name="courseId"
          defaultValue={defaultValues?.courseId}
          required
          aria-invalid={Boolean(state.errors?.courseId)}
        >
          <option value="" disabled>
            انتخاب کنید...
          </option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </NativeSelect>
        {state.errors?.courseId && (
          <p className="text-pishnam-danger text-xs">{state.errors.courseId}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="weekday">روز هفته *</Label>
        <NativeSelect
          id="weekday"
          name="weekday"
          defaultValue={defaultValues?.weekday ?? 0}
          required
        >
          {WEEKDAY_LABELS.fa.map((label, index) => (
            <option key={label} value={index}>
              {label}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startTime">ساعت شروع *</Label>
          <Input
            id="startTime"
            name="startTime"
            type="time"
            dir="ltr"
            defaultValue={defaultValues?.startTime}
            required
            aria-invalid={Boolean(state.errors?.startTime)}
          />
          {state.errors?.startTime && (
            <p className="text-pishnam-danger text-xs">{state.errors.startTime}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endTime">ساعت پایان *</Label>
          <Input
            id="endTime"
            name="endTime"
            type="time"
            dir="ltr"
            defaultValue={defaultValues?.endTime}
            required
            aria-invalid={Boolean(state.errors?.endTime)}
          />
          {state.errors?.endTime && (
            <p className="text-pishnam-danger text-xs">{state.errors.endTime}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location">محل برگزاری *</Label>
        <Input
          id="location"
          name="location"
          defaultValue={defaultValues?.location}
          required
          aria-invalid={Boolean(state.errors?.location)}
        />
        {state.errors?.location && (
          <p className="text-pishnam-danger text-xs">{state.errors.location}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="capacityNote">یادداشت ظرفیت (اختیاری)</Label>
        <Input
          id="capacityNote"
          name="capacityNote"
          placeholder="۲ جای خالی باقی مانده"
          defaultValue={defaultValues?.capacityNote ?? ""}
        />
      </div>

      <label className="text-text-primary flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={defaultValues?.active ?? true}
          className="border-border accent-pishnam-gold-500 size-4 rounded"
        />
        نمایش در برنامه عمومی
      </label>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
