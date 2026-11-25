"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  /**
   * May optionally return `{ error }` for a business-rule rejection (e.g.
   * "can't delete the last owner") that the user needs to see -- the dialog
   * stays open and shows it instead of closing as if nothing happened.
   * Existing callers that just return void/undefined are unaffected.
   */
  onDelete: () => Promise<void | { error?: string }>;
  itemLabel: string;
}

export function DeleteButton({ onDelete, itemLabel }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await onDelete();
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
        className="text-pishnam-danger hover:bg-pishnam-danger/10"
        onClick={() => setOpen(true)}
        aria-label={`حذف ${itemLabel}`}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>حذف {itemLabel}</DialogTitle>
          <DialogDescription>
            این عملیات غیرقابل بازگشت است. آیا از حذف «{itemLabel}» اطمینان دارید؟
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
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
            حذف
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
