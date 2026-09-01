"use client";

import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { FileUploadField } from "@/components/admin/file-upload-field";
import type { TeamMemberFormState } from "@/app/admin/(dashboard)/team/actions";

interface TeamMemberFormProps {
  action: (prevState: TeamMemberFormState, formData: FormData) => Promise<TeamMemberFormState>;
  defaultValues?: {
    nameFa: string;
    nameEn: string;
    roleFa: string;
    roleEn: string;
    photo: string;
    bioFa: string | null;
    bioEn: string | null;
    resume: string | null;
    collaborationStartDate: Date | null;
    isAlumni: boolean;
    isVisible: boolean;
    order: number;
  };
  submitLabel: string;
}

const initialState: TeamMemberFormState = { status: "idle" };

export function TeamMemberForm({ action, defaultValues, submitLabel }: TeamMemberFormProps) {
  const { state, formAction, isPending, formKey, field, checked } = usePreservedFormAction(
    action,
    initialState,
  );

  return (
    <form key={formKey} action={formAction} className="flex max-w-2xl flex-col gap-5">
      <ImageUploadField
        name="photo"
        label="تصویر"
        field="teamMember.photo"
        defaultValue={field("photo", defaultValues?.photo)}
        required
        error={state.errors?.photo}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nameFa">نام (فارسی) *</Label>
          <Input
            id="nameFa"
            name="nameFa"
            defaultValue={field("nameFa", defaultValues?.nameFa)}
            required
          />
          {state.errors?.nameFa && (
            <p className="text-pishnam-danger text-xs">{state.errors.nameFa}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nameEn">Name (English) *</Label>
          <Input
            id="nameEn"
            name="nameEn"
            dir="ltr"
            defaultValue={field("nameEn", defaultValues?.nameEn)}
            required
          />
          {state.errors?.nameEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.nameEn}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="roleFa">سمت (فارسی) *</Label>
          <Input
            id="roleFa"
            name="roleFa"
            defaultValue={field("roleFa", defaultValues?.roleFa)}
            required
          />
          {state.errors?.roleFa && (
            <p className="text-pishnam-danger text-xs">{state.errors.roleFa}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="roleEn">Role (English) *</Label>
          <Input
            id="roleEn"
            name="roleEn"
            dir="ltr"
            defaultValue={field("roleEn", defaultValues?.roleEn)}
            required
          />
          {state.errors?.roleEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.roleEn}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bioFa">بیوگرافی (فارسی)</Label>
          <Textarea
            id="bioFa"
            name="bioFa"
            rows={3}
            defaultValue={field("bioFa", defaultValues?.bioFa ?? "")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bioEn">Bio (English)</Label>
          <Textarea
            id="bioEn"
            name="bioEn"
            dir="ltr"
            rows={3}
            defaultValue={field("bioEn", defaultValues?.bioEn ?? "")}
          />
        </div>
      </div>

      <FileUploadField
        name="resume"
        label="رزومه (PDF)"
        policy="teamMember.resume"
        accept=".pdf,application/pdf"
        field="teamMember.resume"
        defaultValue={field("resume", defaultValues?.resume ?? undefined)}
        error={state.errors?.resume}
      />

      <div className="border-border grid gap-4 border-t pt-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="collaborationStartDate">تاریخ شروع همکاری</Label>
          <Input
            id="collaborationStartDate"
            name="collaborationStartDate"
            type="date"
            dir="ltr"
            defaultValue={field(
              "collaborationStartDate",
              defaultValues?.collaborationStartDate ?? undefined,
            )}
          />
          {state.errors?.collaborationStartDate && (
            <p className="text-pishnam-danger text-xs">{state.errors.collaborationStartDate}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 sm:w-40">
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

      <div className="border-border flex flex-col gap-3 border-t pt-5">
        <p className="text-pishnam-steel-600 text-sm font-bold">وضعیت نمایش</p>
        <label className="text-text-primary flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isVisible"
            defaultChecked={checked("isVisible", defaultValues?.isVisible ?? true)}
            className="border-border accent-pishnam-gold-500 size-4 rounded"
          />
          نمایش در سایت عمومی
        </label>
        <label className="text-text-primary flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isAlumni"
            defaultChecked={checked("isAlumni", defaultValues?.isAlumni ?? false)}
            className="border-border accent-pishnam-gold-500 size-4 rounded"
          />
          عضو پیشین (فارغ‌التحصیل / alumni)
        </label>
        <p className="text-text-secondary text-xs">
          برای اعضایی که پیشنام را ترک کرده‌اند، «عضو پیشین» را فعال کنید. اگر «نمایش در سایت» خاموش
          باشد، در صفحه پرسنل دیده نمی‌شوند.
        </p>
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
