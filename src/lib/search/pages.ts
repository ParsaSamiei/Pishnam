/**
 * Every public static route the catalog should list even before the visitor
 * types. Titles stay in both languages so a Persian page still matches an
 * English query (and the other way around).
 */
export type SearchPageDef = {
  href: string;
  titleFa: string;
  titleEn: string;
  keywords: string;
};

export const SEARCH_PAGES: SearchPageDef[] = [
  {
    href: "/",
    titleFa: "خانه",
    titleEn: "Home",
    keywords: "صفحه اصلی homepage pishnam پیشنام",
  },
  {
    href: "/about-us",
    titleFa: "درباره ما",
    titleEn: "About us",
    keywords: "تاریخچه ماموریت history mission about",
  },
  {
    href: "/about-us/achievements",
    titleFa: "افتخارات و جوایز",
    titleEn: "Achievements",
    keywords: "جوایز مسابقات robocup awards trophies",
  },
  {
    href: "/about-us/team",
    titleFa: "پرسنل",
    titleEn: "Team",
    keywords: "مربیان staff coaches instructors alumni",
  },
  {
    href: "/about-us/faq",
    titleFa: "سوالات متداول",
    titleEn: "FAQ",
    keywords: "پرسش سوالات frequently asked questions",
  },
  {
    href: "/courses",
    titleFa: "دوره‌ها",
    titleEn: "Courses",
    keywords: "آموزش سطوح کلاس رباتیک catalog tiers",
  },
  {
    href: "/classes",
    titleFa: "کلاس‌های حضوری",
    titleEn: "In-Person Classes",
    keywords: "برنامه هفتگی schedule timetable حضوری",
  },
  {
    href: "/gallery",
    titleFa: "گالری",
    titleEn: "Gallery",
    keywords: "عکس ویدیو photos videos",
  },
  {
    href: "/videos",
    titleFa: "ویدیوهای آموزشی",
    titleEn: "Educational Videos",
    keywords: "آپارات aparat lessons tutorials",
  },
  {
    href: "/downloads",
    titleFa: "مرکز دانلود",
    titleEn: "Download Center",
    keywords: "فایل نرم‌افزار دیتاشیت files resources",
  },
  {
    href: "/downloads/software",
    titleFa: "نرم‌افزار و افزونه‌ها",
    titleEn: "Software & Plugins",
    keywords: "mblock arduino ide windows macos",
  },
  {
    href: "/downloads/datasheets",
    titleFa: "دیتاشیت و مستندات",
    titleEn: "Datasheets & Docs",
    keywords: "قطعه lcd srf05 ماژول parts modules",
  },
  {
    href: "/downloads/posters",
    titleFa: "پوستر مسابقات",
    titleEn: "Competition Posters",
    keywords: "لیگ robocup league پوستر",
  },
  {
    href: "/downloads/books",
    titleFa: "کتاب و منابع آموزشی",
    titleEn: "Books & Resources",
    keywords: "pdf کتاب ebook",
  },
  {
    href: "/downloads/component-libraries",
    titleFa: "کتابخانه قطعات CAD",
    titleEn: "CAD Part Libraries",
    keywords: "solidworks altium cad footprint",
  },
  {
    href: "/blog",
    titleFa: "اخبار و مجله",
    titleEn: "News",
    keywords: "مقاله blog news articles",
  },
  {
    href: "/press",
    titleFa: "پیشنام در رسانه",
    titleEn: "Pishnam in the Media",
    keywords: "خبر مطبوعات coverage press",
  },
  {
    href: "/sponsors",
    titleFa: "حامیان",
    titleEn: "Sponsors",
    keywords: "اسپانسر حمایت sponsorship",
  },
  {
    href: "/schools",
    titleFa: "مدارس و همکاری‌ها",
    titleEn: "Schools",
    keywords: "مدرسه partnership B2B",
  },
  {
    href: "/careers",
    titleFa: "فرصت‌های شغلی",
    titleEn: "Careers",
    keywords: "کارآموزی استخدام intern job hiring",
  },
  {
    href: "/contact-us",
    titleFa: "تماس با ما",
    titleEn: "Contact us",
    keywords: "آدرس تلفن email phone address",
  },
  {
    href: "/feedback",
    titleFa: "انتقادات و پیشنهادات",
    titleEn: "Feedback & Suggestions",
    keywords: "نظر پیشنهاد criticism",
  },
  {
    href: "/enroll",
    titleFa: "ثبت‌نام",
    titleEn: "Enroll",
    keywords: "ثبت نام enrollment application فرم",
  },
  {
    href: "/privacy",
    titleFa: "حریم خصوصی",
    titleEn: "Privacy",
    keywords: "privacy policy سیاست",
  },
  {
    href: "/terms",
    titleFa: "قوانین و مقررات",
    titleEn: "Terms",
    keywords: "terms conditions قوانین",
  },
];
