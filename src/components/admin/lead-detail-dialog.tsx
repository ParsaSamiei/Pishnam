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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LeadTypeLabel } from "@/components/admin/lead-status-badge";
import { formatDate } from "@/lib/format";
import { updateLead } from "@/app/admin/(dashboard)/leads/actions";

interface LeadDetailDialogProps {
  lead: {
    id: string;
    type: string;
    name: string;
    phone: string | null;
    email: string | null;
    message: string | null;
    metadata: unknown;
    status: string;
    note: string | null;
    createdAt: Date;
  };
  trigger: React.ReactNode;
}

export function LeadDetailDialog({ lead, trigger }: LeadDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateLead(formData);
      setOpen(false);
    });
  }

  const metadataEntries =
    lead.metadata && typeof lead.metadata === "object"
      ? Object.entries(lead.metadata as Record<string, string>)
      : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button type="button" onClick={() => setOpen(true)} className="contents">
        {trigger}
      </button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{lead.name}</DialogTitle>
          <DialogDescription>
            <LeadTypeLabel type={lead.type} /> · {formatDate(lead.createdAt, "fa")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 text-sm">
          {lead.phone && (
            <div>
              <span className="text-text-secondary">تلفن: </span>
              <span dir="ltr">{lead.phone}</span>
            </div>
          )}
          {lead.email && (
            <div>
              <span className="text-text-secondary">ایمیل: </span>
              <span dir="ltr">{lead.email}</span>
            </div>
          )}
          {lead.message && (
            <div>
              <p className="text-text-secondary">پیام:</p>
              <p className="bg-bg-surface-alt mt-1 rounded-md p-3 whitespace-pre-line">
                {lead.message}
              </p>
            </div>
          )}
          {metadataEntries.length > 0 && (
            <div className="flex flex-col gap-1">
              {metadataEntries.map(([key, value]) => (
                <div key={key}>
                  <span className="text-text-secondary">{key}: </span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <form action={handleSubmit} className="border-border flex flex-col gap-3 border-t pt-4">
          <input type="hidden" name="id" value={lead.id} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`status-${lead.id}`}>وضعیت</Label>
            <NativeSelect id={`status-${lead.id}`} name="status" defaultValue={lead.status}>
              <option value="NEW">جدید</option>
              <option value="CONTACTED">در حال پیگیری</option>
              <option value="CLOSED">بسته‌شده</option>
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`note-${lead.id}`}>یادداشت داخلی</Label>
            <Textarea id={`note-${lead.id}`} name="note" rows={3} defaultValue={lead.note ?? ""} />
          </div>
          <Button type="submit" disabled={isPending} className="self-end">
            {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
            ذخیره
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
