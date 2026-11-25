import { z } from "zod";
import { TEAM_MEMBER_GENDERS } from "@/lib/team-member-photo";

export const teamMemberSchema = z.object({
  nameFa: z.string().trim().min(2, "نام فارسی الزامی است.").max(120),
  nameEn: z.string().trim().min(2, "نام انگلیسی الزامی است.").max(120),
  roleFa: z.string().trim().min(2, "سمت (فارسی) الزامی است.").max(120),
  roleEn: z.string().trim().min(2, "سمت (انگلیسی) الزامی است.").max(120),
  gender: z.enum(TEAM_MEMBER_GENDERS, { message: "جنسیت الزامی است." }),
  photo: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || null),
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
  tagIds: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => (Array.isArray(val) ? val : val ? [val] : []))
    .pipe(z.array(z.string().min(1)).min(1, "حداقل یک دسته‌بندی الزامی است.")),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;
