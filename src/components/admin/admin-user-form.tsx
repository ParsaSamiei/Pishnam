"use client";

import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { AdminUserFormState } from "@/app/admin/(dashboard)/users/actions";

interface AdminUserFormProps {
  action: (prevState: AdminUserFormState, formData: FormData) => Promise<AdminUserFormState>;
}

const initialState: AdminUserFormState = { status: "idle" };

export function AdminUserForm({ action }: AdminUserFormProps) {
  const { state, formAction, isPending, formKey, field } = usePreservedFormAction(
    action,
    initialState,
  );

  return (
    <form key={formKey} action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">ایمیل *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          defaultValue={field("email")}
          required
          aria-invalid={Boolean(state.errors?.email)}
        />
        {state.errors?.email && <p className="text-pishnam-danger text-xs">{state.errors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">رمز عبور *</Label>
        <Input
          id="password"
          name="password"
          type="password"
          dir="ltr"
          defaultValue={field("password")}
          required
          aria-invalid={Boolean(state.errors?.password)}
        />
        {state.errors?.password && (
          <p className="text-pishnam-danger text-xs">{state.errors.password}</p>
        )}
        <p className="text-text-secondary text-xs">
          حداقل ۸ کاراکتر. بعد از ساخت حساب، آن را به کاربر بدهید.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role">نقش *</Label>
        <NativeSelect id="role" name="role" defaultValue={field("role", "editor")} required>
          <option value="editor">ویرایشگر (editor) — مدیریت محتوا</option>
          <option value="owner">مالک (owner) — دسترسی کامل + مدیریت کاربران</option>
        </NativeSelect>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          ساخت حساب
        </Button>
      </div>
    </form>
  );
}
