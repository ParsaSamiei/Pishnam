import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  GraduationCap,
  CalendarDays,
  Trophy,
  Users,
  HelpCircle,
  Video,
  Download,
  Newspaper,
  Briefcase,
  Inbox,
  UserCog,
  Images,
  Package,
  FileArchive,
  MapPin,
  MessageSquare,
  Medal,
  Layers,
  Tags,
  ImageIcon,
  LayoutGrid,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Hidden from the sidebar for the `editor` role -- see docs/06-admin-panel.md
   * ("editor: content CRUD, no user/role management"). The page and its
   * server actions enforce this too (requireOwnerSession); hiding the nav
   * entry is a UX nicety, not the actual access boundary. */
  ownerOnly?: boolean;
}

// One entry per content type from prisma/schema.prisma, per
// docs/06-admin-panel.md ("one admin section per content type").
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/leads", label: "درخواست‌ها", icon: Inbox },
  { href: "/admin/feedback", label: "انتقادات و پیشنهادات", icon: MessageSquare },
  { href: "/admin/hero-slides", label: "تصاویر صفحه اصلی", icon: Images },
  { href: "/admin/contact", label: "تماس با ما", icon: MapPin },
  { href: "/admin/courses", label: "دوره‌ها", icon: GraduationCap },
  { href: "/admin/classes", label: "کلاس‌های حضوری", icon: CalendarDays },
  { href: "/admin/achievements", label: "افتخارات", icon: Trophy },
  { href: "/admin/team", label: "اعضای تیم", icon: Users },
  { href: "/admin/faqs", label: "سوالات متداول", icon: HelpCircle },
  { href: "/admin/videos", label: "ویدیوها", icon: Video },
  { href: "/admin/software", label: "نرم‌افزار و افزونه‌ها", icon: Package },
  { href: "/admin/software-releases", label: "فایل‌های نرم‌افزار", icon: FileArchive },
  { href: "/admin/competitions", label: "مسابقات", icon: Medal },
  { href: "/admin/leagues", label: "لیگ‌ها", icon: Layers },
  { href: "/admin/poster-categories", label: "دسته‌بندی پوستر", icon: Tags },
  { href: "/admin/posters", label: "پوسترها", icon: ImageIcon },
  { href: "/admin/download-sections", label: "بخش‌های مرکز دانلود", icon: LayoutGrid },
  { href: "/admin/downloads", label: "فایل‌های دانلود", icon: Download },
  { href: "/admin/articles", label: "اخبار", icon: Newspaper },
  { href: "/admin/jobs", label: "فرصت‌های شغلی", icon: Briefcase },
  { href: "/admin/users", label: "کاربران مدیر", icon: UserCog, ownerOnly: true },
];
