export const TEAM_MEMBER_GENDERS = ["MALE", "FEMALE"] as const;

export type TeamMemberGender = (typeof TEAM_MEMBER_GENDERS)[number];

export const TEAM_MEMBER_PLACEHOLDERS: Record<TeamMemberGender, string> = {
  MALE: "/team/placeholder-male.svg",
  FEMALE: "/team/placeholder-female.svg",
};

/** Uploaded photo when set; otherwise the آقا / خانم placeholder for that gender. */
export function resolveTeamMemberPhoto(
  photo: string | null | undefined,
  gender: TeamMemberGender,
): string {
  const trimmed = photo?.trim();
  return trimmed || TEAM_MEMBER_PLACEHOLDERS[gender];
}
