import type { LucideIcon } from "lucide-react";
import { AppWindow, Apple, Terminal, Globe, Smartphone, Package } from "lucide-react";
import type { AppLocale } from "./i18n/routing";

// Mirrors `enum SoftwarePlatform` in prisma/schema.prisma. One SoftwareRelease
// row per platform under a SoftwareProduct -- e.g. the same app can have a
// Windows row, a macOS row, and a Linux row, each with its own file/link.
export const SOFTWARE_PLATFORMS = [
  { value: "WINDOWS", icon: AppWindow, labelFa: "ویندوز", labelEn: "Windows" },
  { value: "MACOS", icon: Apple, labelFa: "مک", labelEn: "macOS" },
  { value: "LINUX", icon: Terminal, labelFa: "لینوکس", labelEn: "Linux" },
  { value: "WEB", icon: Globe, labelFa: "وب", labelEn: "Web" },
  { value: "ANDROID", icon: Smartphone, labelFa: "اندروید", labelEn: "Android" },
  { value: "IOS", icon: Apple, labelFa: "iOS", labelEn: "iOS" },
  { value: "OTHER", icon: Package, labelFa: "سایر", labelEn: "Other" },
] as const satisfies {
  value: string;
  icon: LucideIcon;
  labelFa: string;
  labelEn: string;
}[];

export type SoftwarePlatformValue = (typeof SOFTWARE_PLATFORMS)[number]["value"];

export function getSoftwarePlatform(value: string) {
  return SOFTWARE_PLATFORMS.find((platform) => platform.value === value);
}

export function softwarePlatformLabel(value: string, locale: AppLocale): string {
  const platform = getSoftwarePlatform(value);
  if (!platform) return value;
  return locale === "fa" ? platform.labelFa : platform.labelEn;
}
