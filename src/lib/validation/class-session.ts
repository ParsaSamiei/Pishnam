import { z } from "zod";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const classSessionSchema = z.object({
  courseId: z.string().trim().min(1, "انتخاب دوره الزامی است."),
  weekday: z.coerce.number().int().min(0, "روز هفته معتبر نیست.").max(6, "روز هفته معتبر نیست."),
  startTime: z.string().trim().regex(TIME_REGEX, "ساعت شروع باید به‌صورت HH:MM باشد."),
  endTime: z.string().trim().regex(TIME_REGEX, "ساعت پایان باید به‌صورت HH:MM باشد."),
  location: z.string().trim().min(2, "محل برگزاری الزامی است.").max(200),
  capacityNote: z.string().trim().max(200).optional().or(z.literal("")),
  active: z.coerce.boolean(),
});

export type ClassSessionFormValues = z.infer<typeof classSessionSchema>;
