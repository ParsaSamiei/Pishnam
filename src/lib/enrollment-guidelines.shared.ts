import type { EnrollmentGuidelines } from "@prisma/client";

/** Fixed primary key for the one EnrollmentGuidelines row. */
export const ENROLLMENT_GUIDELINES_ID = "default";

/** Cache tag invalidated when admin updates enrollment guidelines. */
export const ENROLLMENT_GUIDELINES_CACHE_TAG = "enrollment-guidelines";

export function isEnrollmentGuidelinesGateActive(
  guidelines: EnrollmentGuidelines | null,
  locale: "fa" | "en",
): guidelines is EnrollmentGuidelines {
  if (!guidelines?.active) return false;
  const body = locale === "fa" ? guidelines.bodyFa : guidelines.bodyEn;
  return body.replace(/<[^>]*>/g, "").trim().length > 0;
}

export function getEnrollmentGuidelinesVersion(guidelines: { updatedAt: Date | string }): string {
  const updatedAt = guidelines.updatedAt;
  if (updatedAt instanceof Date) {
    return updatedAt.toISOString();
  }
  return new Date(updatedAt).toISOString();
}
