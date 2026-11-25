import { cn } from "@/lib/utils";

// Typed as a plain string union rather than importing Prisma's generated
// `LeadStatus` enum -- keeps this component decoupled from whether the
// Prisma client has been generated, and the two stay in sync trivially
// since this mirrors the `enum LeadStatus` block in prisma/schema.prisma.
type LeadStatus = "NEW" | "CONTACTED" | "CLOSED";

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "جدید",
  CONTACTED: "در حال پیگیری",
  CLOSED: "بسته‌شده",
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: "bg-pishnam-gold-500/15 text-pishnam-gold-600",
  CONTACTED: "bg-pishnam-steel-600/15 text-pishnam-steel-600",
  CLOSED: "bg-bg-surface-alt text-text-secondary",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

const TYPE_LABELS: Record<string, string> = {
  ENROLL: "ثبت‌نام دوره",
  CLASS_SEAT: "درخواست جای خالی کلاس",
  SPONSOR: "حمایت مالی",
  SCHOOL: "همکاری با مدرسه",
  JOB_APPLICATION: "درخواست شغلی",
  GENERAL_CONTACT: "تماس عمومی",
};

export function LeadTypeLabel({ type }: { type: string }) {
  return <>{TYPE_LABELS[type] ?? type}</>;
}
