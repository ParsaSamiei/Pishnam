import { z } from "zod";

const ROLES = ["owner", "editor"] as const;

export const createAdminUserSchema = z.object({
  email: z.string().trim().email("ایمیل معتبر نیست.").max(200),
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.").max(200),
  role: z.enum(ROLES),
});

export type CreateAdminUserFormValues = z.infer<typeof createAdminUserSchema>;
