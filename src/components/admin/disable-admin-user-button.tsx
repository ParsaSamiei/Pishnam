"use client";

import { useState, useTransition } from "react";
import { Ban, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DisableAdminUserButtonProps {
  disabled: boolean;
  itemLabel: string;
  onToggle: (disabled: boolean) => Promise<void | { error?: string }>;
}

export function DisableAdminUserButton({
  disabled,
  itemLabel,
  onToggle,
}: DisableAdminUserButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const nextDisabled = !disabled;

  function handleConfirm() {
    startTransition(async () => {
      const result = await onToggle(nextDisabled);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className={
          disabled
            ? "text-pishnam-steel-600 hover:bg-pishnam-steel-600/10"
            : "text-text-secondary hover:bg-bg-surface-alt"
        }
        onClick={() => setOpen(true)}
        aria-label={disabled ? `فعال‌سازی ${itemLabel}` : `غیرفعال‌سازی ${itemLabel}`}
      >
        {disabled ? (
          <CheckCircle2 className="size-4" aria-hidden="true" />
        ) : (
          <Ban className="size-4" aria-hidden="true" />
        )}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {disabled ? `فعال‌سازی ${itemLabel}` : `غیرفعال‌سازی ${itemLabel}`}
          </DialogTitle>
          <DialogDescription>
            {disabled
              ? `با فعال‌سازی، «${itemLabel}» می‌تواند دوباره وارد پنل مدیریت شود.`
              : `با غیرفعال‌سازی، «${itemLabel}» تا زمان فعال‌سازی مجدد نمی‌تواند وارد پنل شود. این کار قابل بازگشت است.`}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="text-pishnam-danger text-sm font-medium">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            انصراف
          </Button>
          <Button
            variant={disabled ? "default" : "secondary"}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
            {disabled ? "فعال‌سازی" : "غیرفعال‌سازی"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
