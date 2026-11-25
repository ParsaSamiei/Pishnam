import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { EnrollmentGuidelines } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ENROLLMENT_GUIDELINES_CACHE_TAG,
  ENROLLMENT_GUIDELINES_ID,
} from "@/lib/enrollment-guidelines.shared";

export {
  ENROLLMENT_GUIDELINES_CACHE_TAG,
  ENROLLMENT_GUIDELINES_ID,
  getEnrollmentGuidelinesVersion,
  isEnrollmentGuidelinesGateActive,
} from "@/lib/enrollment-guidelines.shared";

const loadEnrollmentGuidelines = unstable_cache(
  async (): Promise<EnrollmentGuidelines | null> => {
    return prisma.enrollmentGuidelines.findUnique({ where: { id: ENROLLMENT_GUIDELINES_ID } });
  },
  ["enrollment-guidelines"],
  { tags: [ENROLLMENT_GUIDELINES_CACHE_TAG], revalidate: 3600 },
);

export const getEnrollmentGuidelines = cache(loadEnrollmentGuidelines);
