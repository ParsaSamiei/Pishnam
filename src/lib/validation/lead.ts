import { z } from "zod";
import { IRANIAN_PHONE_HINT_EN, IRANIAN_PHONE_HINT_FA, parseIranianPhone } from "@/lib/phone";

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

export type LeadFormLocale = "fa" | "en";

const LEAD_FORM_COPY = {
  fa: {
    nameMin: "نام باید حداقل ۲ حرف باشد.",
    phoneMax: "شماره تماس خیلی طولانی است.",
    phoneInvalid: `شماره تماس معتبر نیست. قالب مجاز: ${IRANIAN_PHONE_HINT_FA}`,
    emailInvalid: "ایمیل معتبر نیست.",
    messageMax: "توضیحات خیلی طولانی است.",
    phoneRequired: "لطفاً شماره تماس را وارد کنید.",
    phoneOrEmail: "لطفاً شماره تماس یا ایمیل را وارد کنید.",
  },
  en: {
    nameMin: "Name must be at least 2 characters.",
    phoneMax: "Phone number is too long.",
    phoneInvalid: `Enter a valid phone number: ${IRANIAN_PHONE_HINT_EN}`,
    emailInvalid: "Please enter a valid email address.",
    messageMax: "Message is too long.",
    phoneRequired: "Please enter your phone number.",
    phoneOrEmail: "Please enter a phone number or email address.",
  },
} as const;

const PHONE_REQUIRED_TYPES = new Set<LeadTypeValue>(["ENROLL", "CLASS_SEAT"]);

export function createLeadFormSchema(locale: LeadFormLocale = "fa") {
  const copy = LEAD_FORM_COPY[locale];

  return z
    .object({
      type: z.enum(LEAD_TYPES),
      name: z.string().trim().min(2, copy.nameMin).max(120),
      phone: z
        .string()
        .trim()
        .max(20, copy.phoneMax)
        .optional()
        .or(z.literal(""))
        .transform((val, ctx) => {
          if (!val) return "";
          const parsed = parseIranianPhone(val);
          if (!parsed) {
            ctx.addIssue({ code: "custom", message: copy.phoneInvalid });
            return z.NEVER;
          }
          return parsed;
        }),
      email: z.string().trim().email(copy.emailInvalid).max(200).optional().or(z.literal("")),
      message: z.string().trim().max(2000, copy.messageMax).optional().or(z.literal("")),
    })
    .superRefine((data, ctx) => {
      if (PHONE_REQUIRED_TYPES.has(data.type)) {
        if (!data.phone) {
          ctx.addIssue({ code: "custom", message: copy.phoneRequired, path: ["phone"] });
        }
        return;
      }

      if (!data.phone && !data.email) {
        ctx.addIssue({ code: "custom", message: copy.phoneOrEmail, path: ["phone"] });
      }
    });
}

export const leadFormSchema = createLeadFormSchema("fa");

export type LeadFormValues = z.infer<typeof leadFormSchema>;
