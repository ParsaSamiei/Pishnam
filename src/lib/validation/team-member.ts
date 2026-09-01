import { z } from "zod";

export const teamMemberSchema = z.object({
  nameFa: z.string().trim().min(2, "نام فارسی الزامی است.").max(120),
  nameEn: z.string().trim().min(2, "نام انگلیسی الزامی است.").max(120),
  roleFa: z.string().trim().min(2, "سمت (فارسی) الزامی است.").max(120),
  roleEn: z.string().trim().min(2, "سمت (انگلیسی) الزامی است.").max(120),
  photo: z.string().trim().min(1, "تصویر الزامی است."),
  bioFa: z.string().trim().max(1000).optional().or(z.literal("")),
  bioEn: z.string().trim().max(1000).optional().or(z.literal("")),
  resume: z.string().trim().optional().or(z.literal("")),
  collaborationStartDate: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? new Date(val) : null)),
  isAlumni: z.coerce.boolean(),
  isVisible: z.coerce.boolean(),
  order: z.coerce.number().int().min(0).default(0),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;
