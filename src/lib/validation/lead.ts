import { z } from "zod";

// Mirrors `enum LeadType` in prisma/schema.prisma.
export const LEAD_TYPES = [
  "ENROLL",
  "CLASS_SEAT",
  "SPONSOR",
  "SCHOOL",
  "JOB_APPLICATION",
  "GENERAL_CONTACT",
] as const;
export type LeadTypeValue = (typeof LEAD_TYPES)[number];

export const leadFormSchema = z
  .object({
    type: z.enum(LEAD_TYPES),
    name: z.string().trim().min(2, "نام باید حداقل ۲ حرف باشد.").max(120),
    phone: z.string().trim().max(20, "شماره تماس خیلی طولانی است.").optional().or(z.literal("")),
    email: z.string().trim().email("ایمیل معتبر نیست.").max(200).optional().or(z.literal("")),
    message: z.string().trim().max(2000, "توضیحات خیلی طولانی است.").optional().or(z.literal("")),
  })
  .refine((data) => Boolean(data.phone) || Boolean(data.email), {
    message: "لطفاً شماره تماس یا ایمیل را وارد کنید.",
    path: ["phone"],
  });

export type LeadFormValues = z.infer<typeof leadFormSchema>;
