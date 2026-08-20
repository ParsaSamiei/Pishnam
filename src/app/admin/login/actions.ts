"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export async function loginAction(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    // NextAuth's signIn() throws a redirect internally on *success* -- that
    // must propagate, not be swallowed here. Only AuthError subtypes (real
    // auth failures) should be turned into a user-facing message.
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "ایمیل یا رمز عبور اشتباه است.";
        default:
          return "مشکلی در ورود پیش آمد. دوباره تلاش کنید.";
      }
    }
    throw error;
  }
}
