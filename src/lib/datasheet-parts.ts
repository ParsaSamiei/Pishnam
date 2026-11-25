import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const datasheetContentInclude = {
  documents: {
    where: { active: true },
    orderBy: [{ order: "asc" as const }, { createdAt: "asc" as const }],
  },
  videos: {
    where: { active: true },
    orderBy: [{ order: "asc" as const }, { createdAt: "asc" as const }],
  },
  images: {
    where: { active: true },
    orderBy: [{ order: "asc" as const }, { createdAt: "asc" as const }],
  },
  codeSamples: {
    where: { active: true },
    orderBy: [{ order: "asc" as const }, { createdAt: "asc" as const }],
  },
} satisfies Prisma.DatasheetPartInclude;

export type DatasheetPartWithContent = Prisma.DatasheetPartGetPayload<{
  include: typeof datasheetContentInclude;
}>;

export function datasheetPublicPath(part: {
  slug: string;
  parent?: { slug: string } | null;
}): string {
  if (part.parent) {
    return `/downloads/datasheets/${part.parent.slug}/${part.slug}`;
  }
  return `/downloads/datasheets/${part.slug}`;
}

export async function getTopLevelDatasheetPart(slug: string) {
  return prisma.datasheetPart.findFirst({
    where: { slug, parentId: null, active: true },
    include: {
      ...datasheetContentInclude,
      children: {
        where: { active: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          slug: true,
          image: true,
          titleFa: true,
          titleEn: true,
          excerptFa: true,
          excerptEn: true,
        },
      },
    },
  });
}

export async function getDatasheetVariant(parentSlug: string, variantSlug: string) {
  const parent = await prisma.datasheetPart.findFirst({
    where: { slug: parentSlug, parentId: null, active: true },
    select: { id: true, slug: true, titleFa: true, titleEn: true },
  });
  if (!parent) return null;

  const variant = await prisma.datasheetPart.findFirst({
    where: { slug: variantSlug, parentId: parent.id, active: true },
    include: datasheetContentInclude,
  });
  if (!variant) return null;

  return { parent, variant };
}

export async function findDatasheetSlugConflict(opts: {
  slug: string;
  parentId: string | null;
  excludeId?: string;
}) {
  return prisma.datasheetPart.findFirst({
    where: {
      slug: opts.slug,
      parentId: opts.parentId,
      ...(opts.excludeId ? { id: { not: opts.excludeId } } : {}),
    },
    select: { id: true },
  });
}
