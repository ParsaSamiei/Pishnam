import type { HomepageContentCopy } from "@/lib/validation/homepage-content";

/**
 * Seed / fallback copy — mirrors the previous `home.*` strings in
 * src/messages/{fa,en}.json so the public site stays unchanged until an admin
 * edits `/admin/homepage-content`.
 */
export const DEFAULT_HOMEPAGE_CONTENT: HomepageContentCopy = {
  hero: {
    eyebrowFa: "پژوهشگران رباتیک پیشنام",
    eyebrowEn: "Pishnam Robotics Researchers",
    titlePrefixFa: "از اولین مدار الکترونیکی تا ",
    titlePrefixEn: "From your first circuit to a ",
    titleAccentFa: "رباتی آماده مسابقه",
    titleAccentEn: "competition-ready robot",
    titleSuffixFa: "",
    titleSuffixEn: "",
    subtitleFa:
      "آموزش پیشرونده رباتیک، الکترونیک و هوش مصنوعی برای دانش‌آموزان از دبستان تا دبیرستان — با تیمی که در مسابقات ملی و بین‌المللی روبوکاپ نتیجه گرفته است.",
    subtitleEn:
      "Progressive robotics, electronics, and AI education for students from elementary school through high school — taught by a team with national and international RoboCup results.",
    ctaPrimaryFa: "مشاهده دوره‌ها",
    ctaPrimaryEn: "Browse courses",
    ctaSecondaryFa: "ثبت‌نام کنید",
    ctaSecondaryEn: "Enroll now",
  },
  audiences: {
    titleFa: "از کجا شروع کنیم؟",
    titleEn: "Where should you start?",
    subtitleFa: "متناسب با نقش خودتان مسیر مناسب را انتخاب کنید.",
    subtitleEn: "Pick the path that matches your role.",
    parents: {
      titleFa: "برای دانش‌آموزان و والدین",
      titleEn: "For Students & Parents",
      descriptionFa:
        "دوره‌ها و سطوح آموزشی را ببینید، زمان کلاس‌های حضوری را بررسی کنید و ثبت‌نام را شروع کنید.",
      descriptionEn:
        "Browse courses and tiers, check in-person class times, and start the enrollment process.",
      ctaFa: "مشاهده دوره‌ها و ثبت‌نام",
      ctaEn: "Browse courses & enroll",
    },
    schools: {
      titleFa: "برای مدارس",
      titleEn: "For Schools",
      descriptionFa:
        "برگزاری دوره‌های رباتیک در مدرسه شما — با تیمی که سابقه اجرای برنامه‌های آموزشی مشترک دارد.",
      descriptionEn:
        "Bring robotics programs into your school with a team that has a track record of running shared curricula.",
      ctaFa: "همکاری با مدارس",
      ctaEn: "Partner with us",
    },
    sponsors: {
      titleFa: "برای حامیان",
      titleEn: "For Sponsors",
      descriptionFa:
        "افتخارات و نتایج تیم پیشنام در مسابقات را ببینید و از فرصت‌های حمایت مطلع شوید.",
      descriptionEn:
        "See Pishnam's competition achievements and learn about sponsorship opportunities.",
      ctaFa: "حمایت از پیشنام",
      ctaEn: "Support Pishnam",
    },
  },
  achievements: {
    titleFa: "افتخارات پیشنام",
    titleEn: "Achievements",
    subtitleFa: "نتایج دانش‌آموزان ما در مسابقات ملی و بین‌المللی روبوکاپ.",
    subtitleEn: "Our students' results at national and international RoboCup competitions.",
    viewAllFa: "مشاهده همه افتخارات",
    viewAllEn: "View all achievements",
  },
  mediaMentions: {
    titleFa: "پیشنام در رسانه",
    titleEn: "Pishnam in the Media",
    subtitleFa: "گزارش‌ها و خبرهای رسانه‌ای درباره کار و دستاوردهای پیشنام.",
    subtitleEn: "Press reports and news coverage about Pishnam's work and achievements.",
    viewAllFa: "مشاهده همه گزارش‌های رسانه‌ای",
    viewAllEn: "View all press coverage",
  },
  news: {
    titleFa: "اخبار و مجله",
    titleEn: "News & Magazine",
    subtitleFa: "تازه‌ترین خبرها و یادداشت‌های آموزشی پیشنام.",
    subtitleEn: "The latest news and educational notes from Pishnam.",
    viewAllFa: "مشاهده همه اخبار",
    viewAllEn: "View all news",
  },
  videos: {
    titleFa: "ویدیوهای آموزشی",
    titleEn: "Educational Videos",
    subtitleFa: "گزیده‌ای از محتوای آموزشی پیشنام در آپارات، دسته‌بندی‌شده بر اساس سطح و موضوع.",
    subtitleEn: "A curated selection of Pishnam's Aparat content, organized by tier and topic.",
    viewAllFa: "مشاهده همه ویدیوها",
    viewAllEn: "View all videos",
  },
  gallery: {
    titleFa: "گالری تصاویر",
    titleEn: "Photo Gallery",
    subtitleFa: "لحظه‌هایی از کارگاه‌ها، مسابقات و فعالیت‌های تیم پیشنام.",
    subtitleEn: "Moments from workshops, competitions, and team activities at Pishnam.",
    viewAllFa: "مشاهده همه تصاویر",
    viewAllEn: "View all photos",
  },
  downloads: {
    titleFa: "مرکز دانلود",
    titleEn: "Download Center",
    subtitleFa:
      "نرم‌افزار، دیتاشیت، کتاب، پوستر مسابقات و کتابخانه قطعات — همه رایگان و بدون نیاز به ثبت‌نام.",
    subtitleEn:
      "Software, datasheets, books, competition posters, and part libraries — all free, no sign-up required.",
    viewAllFa: "مشاهده مرکز دانلود",
    viewAllEn: "Browse download center",
  },
  related: {
    titleFa: "فراتر از کلاس",
    titleEn: "Beyond the classroom",
    subtitleFa: "در اکوسیستم پیشنام رقابت کنید و متصل بمانید — یک تیم، دو مقصد.",
    subtitleEn:
      "Compete and connect across the Pishnam ecosystem — the same team, two destinations.",
    pishcup: {
      eyebrowFa: "مسابقه",
      eyebrowEn: "Competition",
      titleFa: "پیشکاپ",
      titleEn: "PishCup",
      descriptionFa: "میدان رقابت رباتیک پیشنام — لیگ‌ها، فصل‌ها و مسیر رسیدن به سکو.",
      descriptionEn:
        "Pishnam's robotics competition arena — leagues, seasons, and the path to the podium.",
      ctaFa: "ورود به پیشکاپ",
      ctaEn: "Open PishCup",
    },
    pishtalk: {
      eyebrowFa: "جامعه",
      eyebrowEn: "Community",
      titleFa: "پیشتاک",
      titleEn: "Pishtalk",
      descriptionFa:
        "خانه‌ای برای مهندسان هوش مصنوعی و رباتیک — ایده‌ها را به اشتراک بگذارید و با هم رشد کنید.",
      descriptionEn:
        "A home for AI and robotics engineers — share ideas, ask questions, grow together.",
      ctaFa: "ورود به پیشتاک",
      ctaEn: "Open Pishtalk",
    },
  },
};
