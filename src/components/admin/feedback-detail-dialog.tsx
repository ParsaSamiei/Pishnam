"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";
import { updateFeedback } from "@/app/admin/(dashboard)/feedback/actions";

interface FeedbackDetailDialogProps {
  feedback: {
    id: string;
    name: string | null;
    message: string;
    read: boolean;
    createdAt: Date;
  };
  trigger: React.ReactNode;
}

export function FeedbackDetailDialog({ feedback, trigger }: FeedbackDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const displayName = feedback.name?.trim() || "ناشناس";

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateFeedback(formData);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button type="button" onClick={() => setOpen(true)} className="contents cursor-pointer">
        {trigger}
      </button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{displayName}</DialogTitle>
          <DialogDescription>{formatDate(feedback.createdAt, "fa")}</DialogDescription>
        </DialogHeader>

        <div>
          <p className="text-text-secondary text-sm">متن:</p>
          <p className="bg-bg-surface-alt mt-1 rounded-md p-3 text-sm whitespace-pre-line">
            {feedback.message}
          </p>
        </div>

        <form action={handleSubmit} className="border-border flex flex-col gap-3 border-t pt-4">
          <input type="hidden" name="id" value={feedback.id} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`read-${feedback.id}`}>وضعیت</Label>
            <NativeSelect
              id={`read-${feedback.id}`}
              name="read"
              defaultValue={feedback.read ? "true" : "false"}
            >
              <option value="false">خوانده‌نشده</option>
              <option value="true">خوانده‌شده</option>
            </NativeSelect>
          </div>
          <Button type="submit" disabled={isPending} className="cursor-pointer self-end">
            {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            ذخیره
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
