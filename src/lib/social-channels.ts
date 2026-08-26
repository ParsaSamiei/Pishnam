/** Fixed set of Pishnam social channels editable via /admin/contact. */
export const SOCIAL_CHANNELS = [
  {
    id: "telegram",
    field: "telegramUrl",
    labelFa: "تلگرام",
    labelEn: "Telegram",
    placeholder: "https://t.me/pishnam",
  },
  {
    id: "bale",
    field: "baleUrl",
    labelFa: "بله",
    labelEn: "Bale",
    placeholder: "https://ble.ir/pishnam",
  },
  {
    id: "youtube",
    field: "youtubeUrl",
    labelFa: "یوتیوب",
    labelEn: "YouTube",
    placeholder: "https://www.youtube.com/@pishnam",
  },
  {
    id: "aparat",
    field: "aparatUrl",
    labelFa: "آپارات",
    labelEn: "Aparat",
    placeholder: "https://www.aparat.com/pishnam",
  },
  {
    id: "instagram",
    field: "instagramUrl",
    labelFa: "اینستاگرام",
    labelEn: "Instagram",
    placeholder: "https://www.instagram.com/pishnam",
  },
] as const;

export type SocialChannelId = (typeof SOCIAL_CHANNELS)[number]["id"];
export type SocialChannelField = (typeof SOCIAL_CHANNELS)[number]["field"];

export interface SocialLink {
  id: SocialChannelId;
  href: string;
  labelFa: string;
  labelEn: string;
}

/** Social URL fields that may appear on contact settings (or any settings bag). */
export type SocialChannelUrls = {
  [K in SocialChannelField]?: string | null;
} & {
  // Index signature so full ContactSettings rows remain assignable even when
  // the type checker hasn't picked up newly added social columns yet.
  [key: string]: unknown;
};

/** Returns only channels that have a non-empty URL set. */
export function getSocialLinks(settings: SocialChannelUrls | null | undefined): SocialLink[] {
  if (!settings) return [];
  return SOCIAL_CHANNELS.flatMap((channel) => {
    const value = settings[channel.field];
    const href = typeof value === "string" ? value.trim() : "";
    if (!href) return [];
    return [
      {
        id: channel.id,
        href,
        labelFa: channel.labelFa,
        labelEn: channel.labelEn,
      },
    ];
  });
}
