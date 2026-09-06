"use server";

import type { AdminFormState } from "@/lib/form-state";
import { formActionError } from "@/lib/form-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { teamMemberSchema } from "@/lib/validation/team-member";
import { requireAdminSession, formErrorFromIssues } from "@/lib/actions/admin-guard";

export type TeamMemberFormState = AdminFormState;

function parseTeamMemberForm(formData: FormData) {
  return teamMemberSchema.safeParse({
    ...Object.fromEntries(formData),
    tagIds: formData.getAll("tagIds"),
  });
}

async function revalidateTeamPages(tagSlugs?: string[]) {
  revalidatePath("/admin/team");
  revalidatePath("/admin/team-tags");
  revalidatePath("/about-us/team");
  revalidatePath("/en/about-us/team");

  const slugs =
    tagSlugs ??
    (
      await prisma.teamTag.findMany({
        where: { active: true },
        select: { slug: true },
      })
    ).map((tag) => tag.slug);

  for (const slug of slugs) {
    revalidatePath(`/about-us/team/${slug}`);
    revalidatePath(`/en/about-us/team/${slug}`);
  }
}

async function assertTagIdsExist(tagIds: string[]) {
  const count = await prisma.teamTag.count({
    where: { id: { in: tagIds } },
  });
  return count === tagIds.length;
}

export async function createTeamMember(
  _prevState: TeamMemberFormState,
  formData: FormData,
): Promise<TeamMemberFormState> {
  await requireAdminSession();

  const parsed = parseTeamMemberForm(formData);
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { tagIds, bioFa, bioEn, resume, ...rest } = parsed.data;
  if (!(await assertTagIdsExist(tagIds))) {
    return formActionError({ tagIds: "یکی از دسته‌بندی‌ها معتبر نیست." }, formData);
  }

  await prisma.teamMember.create({
    data: {
      ...rest,
      bioFa: bioFa || null,
      bioEn: bioEn || null,
      resume: resume || null,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  const tags = await prisma.teamTag.findMany({
    where: { id: { in: tagIds } },
    select: { slug: true },
  });
  await revalidateTeamPages(tags.map((tag) => tag.slug));
  redirect("/admin/team");
}

export async function updateTeamMember(
  id: string,
  _prevState: TeamMemberFormState,
  formData: FormData,
): Promise<TeamMemberFormState> {
  await requireAdminSession();

  const parsed = parseTeamMemberForm(formData);
  if (!parsed.success) {
    return formErrorFromIssues(parsed.error.issues, formData);
  }

  const { tagIds, bioFa, bioEn, resume, ...rest } = parsed.data;
  if (!(await assertTagIdsExist(tagIds))) {
    return formActionError({ tagIds: "یکی از دسته‌بندی‌ها معتبر نیست." }, formData);
  }

  const previousTags = await prisma.teamMemberTag.findMany({
    where: { memberId: id },
    include: { tag: { select: { slug: true } } },
  });

  await prisma.$transaction([
    prisma.teamMemberTag.deleteMany({ where: { memberId: id } }),
    prisma.teamMember.update({
      where: { id },
      data: {
        ...rest,
        bioFa: bioFa || null,
        bioEn: bioEn || null,
        resume: resume || null,
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    }),
  ]);

  const nextTags = await prisma.teamTag.findMany({
    where: { id: { in: tagIds } },
    select: { slug: true },
  });
  const slugs = Array.from(
    new Set([...previousTags.map((row) => row.tag.slug), ...nextTags.map((tag) => tag.slug)]),
  );
  await revalidateTeamPages(slugs);
  redirect("/admin/team");
}

export async function deleteTeamMember(id: string): Promise<void> {
  await requireAdminSession();
  const tags = await prisma.teamMemberTag.findMany({
    where: { memberId: id },
    include: { tag: { select: { slug: true } } },
  });
  await prisma.teamMember.delete({ where: { id } });
  await revalidateTeamPages(tags.map((row) => row.tag.slug));
}
