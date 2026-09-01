"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { loginAction } from "./actions";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const { state, formAction, isPending, formKey, field } = usePreservedFormAction(loginAction, {
    status: "idle",
  });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="redirectTo" value={callbackUrl} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">ایمیل</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={field("email")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">رمز عبور</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="pe-10"
            defaultValue={field("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-text-secondary hover:text-text-primary absolute end-3 top-1/2 -translate-y-1/2"
            aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {state.message && (
        <p role="alert" className="text-pishnam-danger text-sm font-medium">
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending} className="mt-2">
        {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
        ورود
      </Button>
    </form>
  );
}
