# Pishnam — Information Architecture

## Design principle: audience-first homepage

Unlike the current WordPress site (one long undifferentiated homepage feed), the new homepage
should surface **distinct entry points per audience** near the top, above the general content
feed:

- "برای دانش‌آموزان و والدین" (For students & parents) → courses/tiers, enrollment.
- "برای مدارس" (For schools) → partnership info, contact.
- "برای حامیان" (For sponsors) → achievements, sponsorship inquiry.
  Then below: achievements highlight, latest news/blog, video hub teaser, downloads teaser — same
  spirit as current site, restructured.

## Sitemap (v1)

```
/ (fa)  |  /en (English root)
│
├── درباره پیشنام            about
│   ├── تاریخچه و ماموریت     history/mission
│   ├── افتخارات و جوایز      achievements            [content type: Achievement]
│   ├── پرسنل                 team                      [content type: TeamMember]
│   └── سوالات متداول         faq                       [content type: FAQ]
│
├── دوره‌ها و سطوح            courses (catalog, filter by tier/age/topic)
│   └── /courses/[slug]                                  [content type: Course]
│       (each course page: description, tier/age range, prerequisites,
│        what students build, related achievements, enroll CTA)
│
├── کلاس‌های حضوری            classes/schedule           [content type: ClassSession]  — CONFIRMED for v1
│   day/time, location, tier, "request a seat" form
│
├── ثبت‌نام                   enroll
│   (general enrollment form; pre-fills course/tier if arrived via a course page)
│
├── ویدیوهای آموزشی           videos                     [content type: VideoEntry]
│   (curated links/embeds to Pishnam's Aparat content, organized by tier/topic —
│    not a raw unfiltered feed)
│
├── مرکز دانلود               downloads (grouped by category)
│   ├── /downloads/software                          [content type: SoftwareProduct]
│   │   نرم‌افزار و افزونه‌ها (Software & Plugins) — each app/plugin has its own picture
│   │   and its own page (/downloads/software/[slug]) listing every platform-specific
│   │   file or link for it (e.g. Windows build, macOS build), each with its own version
│   │   label, size/link, and notes  [content type: SoftwareRelease, child of SoftwareProduct]
│   │   (previously a flat DownloadResource category — split out because a single
│   │   flat row can't represent "one app, several platform builds")
│   ├── /downloads/datasheets                         [content type: DatasheetPart]
│   │   دیتاشیت و مستندات فنی — each part (LCD, SRF05, …) has its own page. A part
│   │   can stand alone (module page with text, PDFs, videos, photos, example code)
│   │   or be a family that lists variants at /downloads/datasheets/[slug]/[variant]
│   │   (e.g. LCD → 16×2, graphical LCD). Previously a flat DownloadResource list.
│   ├── /downloads/posters                           [content type: CompetitionPoster]
│   │   پوستر مسابقات رباتیک — filtered by competition → league → poster category
│   │   (admin-managed taxonomy; previously a flat DownloadResource POSTERS category)
│   └── /downloads/[category]                        [content type: DownloadResource]
│       remaining flat, single-file-per-item categories (renamed/consolidated from the
│       old WP site):
│         - books            کتاب و منابع آموزشی        (Books & Learning Resources)
│         - component-libraries  کتابخانه قطعات CAD     (Component Libraries — merges old
│                                                        "SolidWorks library" + "Altium library"
│                                                        into one category, distinguished by a
│                                                        `cadTool` tag on each resource instead of
│                                                        two separate top-level categories)
│       fully open/public — no gating or lead capture required to download
│       each resource can be either a hosted file (uploaded to storage) or an external link
│       (e.g. manufacturer site, official tool download page) — see schema doc
│
├── اخبار و مجله              blog / news
│   └── /blog/[slug]                                      [content type: Article]
│
├── حامیان و اسپانسرها        sponsors
│   (recognition of current sponsors + "become a sponsor" inquiry form)
│
├── مدارس و همکاری‌ها          schools / partnerships
│   (B2B pitch + inquiry form)
│
├── فرصت‌های شغلی و کارآموزی   careers                    [content type: JobPosting]
│
├── تماس با ما                contact
│
└── (footer utility, not top-nav)
    ├── حریم خصوصی            privacy
    └── قوانین و مقررات       terms
```

## Navigation structure recommendation

Restructure the current 5-item deep mega-menu into **top-level groups that match audience intent**,
max 2 levels deep:

Primary nav: `درباره ما` · `دوره‌ها` · `کلاس‌های حضوری` · `ویدیوها` · `مرکز دانلود` · `اخبار` ·
`تماس`
Persistent header CTAs: `ثبت‌نام` (primary/yellow button), language switch (FA/EN), search.
Secondary/footer nav: sponsors, schools, careers, privacy/terms — important but not primary-nav
traffic drivers.

This cuts the original ~5 mega-menus with 8–15 items each down to something scannable, while still
reachable via footer/search for less-common needs (e.g. part libraries, old competition posters).

## Content types requiring admin CRUD

| Type                     | Key fields                                                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Course                   | title, slug, tier/age range, topic tags, cover image, description (rich text), prerequisites, related achievements, order/priority            |
| ClassSession             | course/tier ref, weekday, time, location, capacity note, active flag                                                                          |
| Achievement              | title, competition name, year, result/rank, photo, related course tags                                                                        |
| TeamMember               | name, role, photo, bio (short)                                                                                                                |
| FAQ                      | question, answer, category                                                                                                                    |
| VideoEntry               | title, Aparat embed URL/ID, tier/topic tags, thumbnail (can pull from Aparat)                                                                 |
| DownloadResource         | title, category (datasheets/books/component-libraries), file URL or external link, description                                                |
| Competition              | slug, title, optional year, active/order — parent of leagues                                                                                  |
| League                   | competition ref, slug, title, active/order — parent of poster categories                                                                      |
| PosterCategory           | league ref, slug, title, active/order — groups posters within a league                                                                        |
| CompetitionPoster        | category ref, preview image, title, description, file URL or external link, active/order                                                      |
| SoftwareProduct          | slug, picture, title, description, order/active — one per app/plugin, has its own public page                                                 |
| SoftwareRelease          | product ref, platform (Windows/macOS/Linux/Web/Android/iOS/Other), version label, file URL or external link, size, per-release notes          |
| DatasheetPart            | slug, picture, title, excerpt, rich-text body, optional parent (variant of a family), order/active — public page with docs/videos/photos/code |
| DatasheetDocument        | part ref, FA/EN title/description, hosted file or external link                                                                               |
| DatasheetVideo           | part ref, FA/EN title, Aparat embed or hosted video, thumbnail                                                                                |
| DatasheetImage           | part ref, image, FA/EN caption                                                                                                                |
| DatasheetCodeSample      | part ref, FA/EN title, language, inline code, optional downloadable file                                                                      |
| Article (blog)           | title, slug, cover image, body (rich text), tags, published date                                                                              |
| JobPosting               | title, description, requirements, active flag, expiry date                                                                                    |
| Lead/Inquiry submissions | type (enroll/class-seat/sponsor/school/job), form fields, submitted date, status (new/contacted/closed)                                       |
| Feedback                 | optional name, message, submitted date, read flag — criticisms & suggestions from `/contact-us`                                               |

## Confirmed decisions

- "کلاس‌های حضوری" (offline classes/schedule) is in scope for v1.
