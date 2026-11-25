import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware wrappers -- use these instead of next/link and next/navigation
// everywhere under app/[locale]/** so links automatically carry the current
// locale prefix (or lack thereof, for fa).
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
