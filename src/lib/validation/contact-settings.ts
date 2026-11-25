import { z } from "zod";
import { MAX_CONTACT_ADDRESSES, MAX_CONTACT_BRANCH_NAME_LENGTH } from "@/lib/contact-addresses";
import { toGoogleMapsEmbedUrl } from "@/lib/google-maps";
import { IRANIAN_PHONE_HINT_FA, parseIranianPhone } from "@/lib/phone";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? val : null));

const optionalHttpsUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((val, ctx) => {
    if (!val) return null;
    if (val.length > 500) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "لینک خیلی طولانی است." });
      return z.NEVER;
    }
    let parsed: URL;
    try {
      parsed = new URL(val);
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "لینک معتبر نیست." });
      return z.NEVER;
    }
    if (parsed.protocol !== "https:") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "لینک باید با https:// شروع شود.",
      });
      return z.NEVER;
    }
    return parsed.toString();
  });

const optionalMapEmbedUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((val, ctx) => {
    if (!val) return null;
    const embedUrl = toGoogleMapsEmbedUrl(val);
    if (!embedUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "کد یا لینک نقشه گوگل معتبر نیست. از Share → Embed a map کد iframe را کپی کنید.",
      });
      return z.NEVER;
    }
    if (embedUrl.length > 4000) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "لینک نقشه خیلی طولانی است." });
      return z.NEVER;
    }
    return embedUrl;
  });

/** Shared by the site-wide phone list and each branch's own phones. */
const phoneNumbersSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((val) => {
    const list = Array.isArray(val) ? val : val ? [val] : [];
    return list.map((s) => s.trim()).filter(Boolean);
  })
  .pipe(
    z
      .array(
        z.string().transform((val, ctx) => {
          const parsed = parseIranianPhone(val);
          if (!parsed) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `شماره تلفن معتبر نیست. قالب مجاز: ${IRANIAN_PHONE_HINT_FA}`,
            });
            return z.NEVER;
          }
          return parsed;
        }),
      )
      .max(10, "حداکثر ۱۰ شماره می‌توانید ثبت کنید."),
  );

export const contactAddressSchema = z.object({
  nameFa: optionalText(MAX_CONTACT_BRANCH_NAME_LENGTH),
  nameEn: optionalText(MAX_CONTACT_BRANCH_NAME_LENGTH),
  addressFa: optionalText(500),
  addressEn: optionalText(500),
  postalCode: optionalText(20),
  phones: phoneNumbersSchema.default([]),
  mapEmbedUrl: optionalMapEmbedUrl,
});

/**
 * The admin form submits parallel repeated fields (`addressFa`, `addressEn`,
 * …); the server action zips them into objects of this shape before parsing.
 * Blank rows are dropped so adding a row and leaving it empty is harmless.
 */
export const contactAddressesSchema = z
  .array(contactAddressSchema)
  .transform((rows) =>
    rows.filter(
      (row) =>
        row.nameFa ||
        row.nameEn ||
        row.addressFa ||
        row.addressEn ||
        row.postalCode ||
        row.mapEmbedUrl ||
        row.phones.length > 0,
    ),
  )
  .superRefine((rows, ctx) => {
    if (rows.length > MAX_CONTACT_ADDRESSES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `حداکثر ${MAX_CONTACT_ADDRESSES} آدرس می‌توانید ثبت کنید.`,
      });
    }
  });

export const contactSettingsSchema = z.object({
  phones: phoneNumbersSchema,
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? val : null))
    .pipe(z.string().email("ایمیل معتبر نیست.").nullable()),
  footerTaglineFa: optionalText(300),
  footerTaglineEn: optionalText(300),
  addresses: contactAddressesSchema.default([]),
  telegramUrl: optionalHttpsUrl,
  baleUrl: optionalHttpsUrl,
  youtubeUrl: optionalHttpsUrl,
  aparatUrl: optionalHttpsUrl,
  instagramUrl: optionalHttpsUrl,
});

export type ContactSettingsFormValues = z.infer<typeof contactSettingsSchema>;
