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
│   └── /downloads/[category]                            [content type: DownloadResource]
│       categories (renamed/consolidated from the old WP site):
│         - software        نرم‌افزار و افزونه‌ها      (Software & Plugins — merges old
│                                                        "software" + "MBlock plugin" categories)
│         - datasheets       دیتاشیت و مستندات فنی      (Datasheets & Technical Docs)
│         - books            کتاب و منابع آموزشی        (Books & Learning Resources)
│         - posters          پوستر مسابقات رباتیک       (Competition Posters)
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
| Type | Key fields |
|---|---|
| Course | title, slug, tier/age range, topic tags, cover image, description (rich text), prerequisites, related achievements, order/priority |
| ClassSession | course/tier ref, weekday, time, location, capacity note, active flag |
| Achievement | title, competition name, year, result/rank, photo, related course tags |
| TeamMember | name, role, photo, bio (short) |
| FAQ | question, answer, category |
| VideoEntry | title, Aparat embed URL/ID, tier/topic tags, thumbnail (can pull from Aparat) |
| DownloadResource | title, category, file URL or external link, description |
| Article (blog) | title, slug, cover image, body (rich text), tags, published date |
| JobPosting | title, description, requirements, active flag, expiry date |
| Lead/Inquiry submissions | type (enroll/class-seat/sponsor/school/job), form fields, submitted date, status (new/contacted/closed) |

## Confirmed decisions
- "کلاس‌های حضوری" (offline classes/schedule) is in scope for v1.
