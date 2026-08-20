import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Bootstraps the very first admin account. There is no public sign-up
  // anywhere in the app (see docs/06-admin-panel.md), so this is the only
  // way an AdminUser row ever gets created for a fresh install.
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      "Skipping admin bootstrap: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create the first admin account.",
    );
    return;
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user ${email} already exists, skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({
    data: { email, passwordHash, role: "owner" },
  });

  console.log(`Created owner admin account: ${email}`);
  console.log("Change this password after first login -- there is no self-service reset flow yet.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
