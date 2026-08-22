import { z } from "zod";

const optionalName = z
  .string()
  .trim()
  .max(120, "نام خیلی طولانی است.")
  .optional()
  .or(z.literal(""))
  .transform((val) => (val ? val : null))
  .pipe(z.string().min(2, "نام باید حداقل ۲ حرف باشد.").max(120).nullable());

export const feedbackFormSchema = z.object({
  name: optionalName,
  message: z.string().trim().min(8, "متن باید حداقل ۸ حرف باشد.").max(4000, "متن خیلی طولانی است."),
});

export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;
