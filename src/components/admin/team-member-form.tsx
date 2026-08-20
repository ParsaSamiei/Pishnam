"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
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
    order: number;
  };
  submitLabel: string;
}

const initialState: TeamMemberFormState = { status: "idle" };

export function TeamMemberForm({ action, defaultValues, submitLabel }: TeamMemberFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <ImageUploadField
        name="photo"
        label="تصویر"
        field="teamMember.photo"
        defaultValue={defaultValues?.photo}
        required
        error={state.errors?.photo}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nameFa">نام (فارسی) *</Label>
          <Input id="nameFa" name="nameFa" defaultValue={defaultValues?.nameFa} required />
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
            defaultValue={defaultValues?.nameEn}
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
          <Input id="roleFa" name="roleFa" defaultValue={defaultValues?.roleFa} required />
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
            defaultValue={defaultValues?.roleEn}
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
          <Textarea id="bioFa" name="bioFa" rows={3} defaultValue={defaultValues?.bioFa ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bioEn">Bio (English)</Label>
          <Textarea
            id="bioEn"
            name="bioEn"
            dir="ltr"
            rows={3}
            defaultValue={defaultValues?.bioEn ?? ""}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 sm:w-40">
        <Label htmlFor="order">ترتیب نمایش</Label>
        <Input
          id="order"
          name="order"
          type="number"
          min={0}
          defaultValue={defaultValues?.order ?? 0}
        />
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
