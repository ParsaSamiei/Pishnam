"use client";

import { useActionState, useId, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContactSettingsFormState } from "@/app/admin/(dashboard)/contact/actions";

interface ContactSettingsFormProps {
  action: (
    prevState: ContactSettingsFormState,
    formData: FormData,
  ) => Promise<ContactSettingsFormState>;
  defaultValues?: {
    phones: string[];
    email: string | null;
    addressFa: string | null;
    addressEn: string | null;
    mapEmbedUrl: string | null;
  };
}

const initialState: ContactSettingsFormState = { status: "idle" };

export function ContactSettingsForm({ action, defaultValues }: ContactSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const phoneIdPrefix = useId();
  const [phoneRows, setPhoneRows] = useState(() => {
    const values = defaultValues?.phones.length ? defaultValues.phones : [""];
    return values.map((value, index) => ({ id: `${phoneIdPrefix}-${index}`, value }));
  });

  function addPhone() {
    setPhoneRows((current) => [
      ...current,
      { id: `${phoneIdPrefix}-${current.length}-${Date.now()}`, value: "" },
    ]);
  }

  function removePhone(id: string) {
    setPhoneRows((current) =>
      current.length <= 1
        ? [{ id: `${phoneIdPrefix}-0`, value: "" }]
        : current.filter((row) => row.id !== id),
    );
  }

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <fieldset className="flex flex-col gap-3">
        <legend className="text-text-primary text-sm font-semibold">شماره‌های تلفن</legend>
        <p className="text-text-secondary text-xs">
          می‌توانید چند شماره ثبت کنید. فیلدهای خالی هنگام ذخیره نادیده گرفته می‌شوند.
        </p>
        {phoneRows.map((row, index) => (
          <div key={row.id} className="flex items-start gap-2">
            <Input
              name="phones"
              type="tel"
              dir="ltr"
              placeholder="+98 21 0000 0000"
              defaultValue={row.value}
              aria-label={`شماره تلفن ${index + 1}`}
              aria-invalid={Boolean(state.errors?.phones)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removePhone(row.id)}
              aria-label={`حذف شماره ${index + 1}`}
              className="shrink-0 cursor-pointer"
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        ))}
        {state.errors?.phones && (
          <p className="text-pishnam-danger text-xs">{state.errors.phones}</p>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPhone}
          disabled={phoneRows.length >= 10}
          className="w-fit cursor-pointer"
        >
          <Plus aria-hidden="true" />
          افزودن شماره
        </Button>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">ایمیل</Label>
        <Input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          placeholder="info@pishnam.ir"
          defaultValue={defaultValues?.email ?? ""}
          aria-invalid={Boolean(state.errors?.email)}
        />
        {state.errors?.email && <p className="text-pishnam-danger text-xs">{state.errors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="addressFa">آدرس (فارسی)</Label>
        <Textarea
          id="addressFa"
          name="addressFa"
          rows={3}
          defaultValue={defaultValues?.addressFa ?? ""}
          aria-invalid={Boolean(state.errors?.addressFa)}
        />
        {state.errors?.addressFa && (
          <p className="text-pishnam-danger text-xs">{state.errors.addressFa}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="addressEn">Address (English)</Label>
        <Textarea
          id="addressEn"
          name="addressEn"
          dir="ltr"
          rows={3}
          defaultValue={defaultValues?.addressEn ?? ""}
          aria-invalid={Boolean(state.errors?.addressEn)}
        />
        {state.errors?.addressEn && (
          <p className="text-pishnam-danger text-xs">{state.errors.addressEn}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mapEmbedUrl">نقشه گوگل (Embed)</Label>
        <Textarea
          id="mapEmbedUrl"
          name="mapEmbedUrl"
          dir="ltr"
          rows={4}
          placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'
          defaultValue={defaultValues?.mapEmbedUrl ?? ""}
          aria-invalid={Boolean(state.errors?.mapEmbedUrl)}
        />
        <p className="text-text-secondary text-xs">
          در گوگل مپ روی Share و سپس Embed a map بزنید و کد iframe را اینجا بچسبانید. لینک معمولی
          نقشه کار نمی‌کند.
        </p>
        {state.errors?.mapEmbedUrl && (
          <p className="text-pishnam-danger text-xs">{state.errors.mapEmbedUrl}</p>
        )}
      </div>

      {defaultValues?.mapEmbedUrl ? (
        <div className="border-border overflow-hidden rounded-md border">
          <iframe
            src={defaultValues.mapEmbedUrl}
            title="پیش‌نمایش نقشه"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-56 w-full border-0"
          />
        </div>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="cursor-pointer">
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          ذخیره اطلاعات تماس
        </Button>
      </div>
    </form>
  );
}
