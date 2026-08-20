import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "ایمیل", type: "email" },
        password: { label: "رمز عبور", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const adminUser = await prisma.adminUser.findUnique({ where: { email } });
        if (!adminUser) return null;

        const passwordValid = await bcrypt.compare(password, adminUser.passwordHash);
        if (!passwordValid) return null;

        return {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
        };
      },
    }),
  ],
});
