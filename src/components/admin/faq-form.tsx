"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FaqFormState } from "@/app/admin/(dashboard)/faqs/actions";

interface FaqFormProps {
  action: (prevState: FaqFormState, formData: FormData) => Promise<FaqFormState>;
  defaultValues?: {
    category: string;
    questionFa: string;
    questionEn: string;
    answerFa: string;
    answerEn: string;
    order: number;
  };
  submitLabel: string;
}

const initialState: FaqFormState = { status: "idle" };

export function FaqForm({ action, defaultValues, submitLabel }: FaqFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">دسته‌بندی *</Label>
          <Input
            id="category"
            name="category"
            placeholder="ثبت‌نام"
            defaultValue={defaultValues?.category}
            required
          />
          {state.errors?.category && (
            <p className="text-pishnam-danger text-xs">{state.errors.category}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="order">ترتیب نمایش</Label>
          <Input
            id="order"
            name="order"
            type="number"
            min={0}
            defaultValue={defaultValues?.order ?? 0}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="questionFa">سوال (فارسی) *</Label>
        <Input
          id="questionFa"
          name="questionFa"
          defaultValue={defaultValues?.questionFa}
          required
        />
        {state.errors?.questionFa && (
          <p className="text-pishnam-danger text-xs">{state.errors.questionFa}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="answerFa">پاسخ (فارسی) *</Label>
        <Textarea
          id="answerFa"
          name="answerFa"
          rows={3}
          defaultValue={defaultValues?.answerFa}
          required
        />
        {state.errors?.answerFa && (
          <p className="text-pishnam-danger text-xs">{state.errors.answerFa}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="questionEn">Question (English) *</Label>
        <Input
          id="questionEn"
          name="questionEn"
          dir="ltr"
          defaultValue={defaultValues?.questionEn}
          required
        />
        {state.errors?.questionEn && (
          <p className="text-pishnam-danger text-xs">{state.errors.questionEn}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="answerEn">Answer (English) *</Label>
        <Textarea
          id="answerEn"
          name="answerEn"
          dir="ltr"
          rows={3}
          defaultValue={defaultValues?.answerEn}
          required
        />
        {state.errors?.answerEn && (
          <p className="text-pishnam-danger text-xs">{state.errors.answerEn}</p>
        )}
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
