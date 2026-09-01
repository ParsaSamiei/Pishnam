"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { formActionErrorWithMessage, type PreservedFormState } from "@/lib/form-state";

export type LoginFormState = PreservedFormState;

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    // NextAuth's signIn() throws a redirect internally on *success* -- that
    // must propagate, not be swallowed here. Only AuthError subtypes (real
    // auth failures) should be turned into a user-facing message.
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return formActionErrorWithMessage("ایمیل یا رمز عبور اشتباه است.", formData);
        default:
          return formActionErrorWithMessage("مشکلی در ورود پیش آمد. دوباره تلاش کنید.", formData);
      }
    }
    throw error;
  }

  return { status: "idle" };
}
