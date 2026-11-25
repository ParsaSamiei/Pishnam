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
    approved: boolean;
    likeCount: number;
    dislikeCount: number;
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

        <p className="text-text-secondary text-xs">
          رأی عمومی: {feedback.likeCount} موافق · {feedback.dislikeCount} مخالف
        </p>

        <form action={handleSubmit} className="border-border flex flex-col gap-3 border-t pt-4">
          <input type="hidden" name="id" value={feedback.id} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`read-${feedback.id}`}>وضعیت خواندن</Label>
            <NativeSelect
              id={`read-${feedback.id}`}
              name="read"
              defaultValue={feedback.read ? "true" : "false"}
            >
              <option value="false">خوانده‌نشده</option>
              <option value="true">خوانده‌شده</option>
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`approved-${feedback.id}`}>نمایش عمومی</Label>
            <NativeSelect
              id={`approved-${feedback.id}`}
              name="approved"
              defaultValue={feedback.approved ? "true" : "false"}
            >
              <option value="false">منتشر نشده</option>
              <option value="true">منتشر شده</option>
            </NativeSelect>
            <p className="text-text-secondary text-xs">
              در صورت انتشار، پیام در صفحه انتقادات و پیشنهادات برای همه نمایش داده می‌شود.
            </p>
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
