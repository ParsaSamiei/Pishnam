# Pishnam — Database Schema

## Stack

- **PostgreSQL** + **Prisma ORM**, running in Docker alongside the Next.js app.
- Content volume is small (dozens of items per type) — no need for a separate search engine;
  Postgres full-text search (`tsvector`) is sufficient if/when search is added.
- No payments, no user progress-tracking in v1 — schema intentionally excludes those.

## Prisma schema (draft)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Locale {
  fa
  en
}

enum Tier {
  ELEMENTARY   // ابتدایی
  MIDDLE       // متوسطه اول
  HIGH_SCHOOL  // متوسطه دوم
  COMPETITIVE  // پیشرفته / تیم مسابقات
}

enum LeadType {
  ENROLL
  CLASS_SEAT
  SPONSOR
  SCHOOL
  JOB_APPLICATION
  GENERAL_CONTACT
}

enum LeadStatus {
  NEW
  CONTACTED
  CLOSED
}

enum DownloadCategory {
  SOFTWARE              // نرم‌افزار و افزونه‌ها (includes former "MBlock plugin" category)
  DATASHEETS            // دیتاشیت و مستندات فنی
  BOOKS                 // کتاب و منابع آموزشی
  POSTERS               // پوستر مسابقات رباتیک
  COMPONENT_LIBRARIES   // کتابخانه قطعات CAD (merges former SolidWorks/Altium categories)
}

enum ResourceSource {
  HOSTED    // file uploaded to Pishnam's own storage
  EXTERNAL  // link out to a third-party site (e.g. official tool page)
}

// Every content model with FA/EN text uses either:
//  (a) parallel fields (titleFa/titleEn) for simple models, or
//  (b) a Translation join table for rich-text-heavy models.
// See i18n doc for rationale. Course/Article use (b); simpler models use (a).

model Course {
  id            String    @id @default(cuid())
  slug          String    @unique
  tier          Tier
  topicTags     String[]  // ["electronics","rescue-line", ...]
  coverImage    String
  order         Int       @default(0)
  active        Boolean   @default(true)
  translations  CourseTranslation[]
  classSessions ClassSession[]
  achievements  Achievement[] @relation("CourseAchievements")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model CourseTranslation {
  id           String  @id @default(cuid())
  course       Course  @relation(fields: [courseId], references: [id])
  courseId     String
  locale       Locale
  title        String
  excerpt      String
  body         String  // rich text (stored as HTML or MDX string)
  prerequisites String?

  @@unique([courseId, locale])
}

model ClassSession { // confirmed for v1
  id        String   @id @default(cuid())
  course    Course   @relation(fields: [courseId], references: [id])
  courseId  String
  weekday   Int      // 0-6
  startTime String   // "16:00"
  endTime   String
  location  String
  capacityNote String?
  active    Boolean  @default(true)
}

model Achievement {
  id            String   @id @default(cuid())
  titleFa       String
  titleEn       String
  competition   String   // e.g. "RoboCup"
  year          Int
  result        String   // e.g. "1st place, Rescue Line"
  photo         String
  courses       Course[] @relation("CourseAchievements")
  featured      Boolean  @default(false)
  createdAt     DateTime @default(now())
}

model TeamMember {
  id       String  @id @default(cuid())
  nameFa   String
  nameEn   String
  roleFa   String
  roleEn   String
  photo    String
  bioFa    String?
  bioEn    String?
  order    Int     @default(0)
}

model Faq {
  id         String @id @default(cuid())
  category   String
  questionFa String
  questionEn String
  answerFa   String
  answerEn   String
  order      Int    @default(0)
}

model VideoEntry {
  id          String   @id @default(cuid())
  titleFa     String
  titleEn     String
  aparatUrl   String
  thumbnail   String?
  tierTags    Tier[]
  topicTags   String[]
  publishedAt DateTime
}

model DownloadResource {
  id            String           @id @default(cuid())
  category      DownloadCategory
  source        ResourceSource   // HOSTED or EXTERNAL — set per resource, both allowed
  cadTool       String?          // e.g. "SolidWorks" | "Altium" — only used for
                                  // COMPONENT_LIBRARIES category, replaces old separate categories
  titleFa       String
  titleEn       String
  descriptionFa String?
  descriptionEn String?
  fileUrl       String           // hosted file path OR external URL, per `source`
  fileSizeBytes Int?             // only relevant when source = HOSTED
  createdAt     DateTime         @default(now())
}

model Article {
  id           String   @id @default(cuid())
  slug         String   @unique
  coverImage   String
  tags         String[]
  publishedAt  DateTime
  translations ArticleTranslation[]
}

model ArticleTranslation {
  id        String  @id @default(cuid())
  article   Article @relation(fields: [articleId], references: [id])
  articleId String
  locale    Locale
  title     String
  excerpt   String
  body      String

  @@unique([articleId, locale])
}

model JobPosting {
  id           String   @id @default(cuid())
  titleFa      String
  titleEn      String
  descriptionFa String
  descriptionEn String
  active       Boolean  @default(true)
  expiresAt    DateTime?
  createdAt    DateTime @default(now())
}

model Lead {
  id        String     @id @default(cuid())
  type      LeadType
  name      String
  phone     String?
  email     String?
  message   String?
  metadata  Json?      // e.g. { courseSlug, tier } for enroll leads
  status    LeadStatus @default(NEW)
  createdAt DateTime   @default(now())
}

// Admin auth (custom admin, not public accounts — see admin panel doc)
model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         String   @default("editor") // "owner" | "editor"
  createdAt    DateTime @default(now())
}

// Slides in the homepage hero carousel, ordered low to high. Zero rows is a
// valid state — the hero falls back to its line-art board.
model HeroSlide {
  id        String   @id @default(cuid())
  image     String   // /uploads/<uuid>.webp
  altFa     String?  // blank falls back to the `home.hero.imageAlt` message
  altEn     String?
  order     Int      @default(0)
  createdAt DateTime @default(now())

  @@index([order])
}
```

## Notes

- **No `User` model for students/parents in v1** — no accounts, no auth for the public. All
  visitor interaction is via `Lead` (forms), which is enough given "no purchase or progress
  tracking for now."
- **Media**: `coverImage`/`photo`/`fileUrl` fields store paths — **using local disk storage for
  now** (see `05-frontend-architecture.md` for the volume setup), not S3/object storage. Revisit
  object storage (Cloudflare R2, MinIO, AWS S3) in a future version if the server moves to
  multiple instances, storage size becomes a problem, or backups need to be offloaded — migration
  is low-effort later since these are just file paths, no schema change required.
- **Download center is fully public** — `DownloadResource` has no gating/lead-capture requirement;
  every resource is directly downloadable/linkable regardless of `source`. Because some resources
  are `HOSTED` (real files, potentially large — installers, part libraries) and others are
  `EXTERNAL` (links out), size hosted files appropriately in mind on the local volume rather than
  the app's own writable layer, and validate `fileUrl` differently depending on `source` (uploaded
  path vs. a well-formed external URL) in the admin form.
- **Search**: if/when free-text site search is added, use Postgres `tsvector` columns on
  `CourseTranslation`, `ArticleTranslation`, `Faq` rather than adding a new service.
- **Hero slides are a collection, not settings** — `HeroSlide` is an ordered table managed from
  `/admin/hero-slides` like any other content type, rather than image columns on a settings
  singleton. "How many photos does the hero show?" is a question a table answers and a fixed set of
  columns cannot; it also means adding a fourth photo needs no schema change. Alt text lives on the
  slide because only whoever uploaded a photo can describe it. Zero rows renders the hero's own
  fallback, so nothing has to be seeded.
- **Migrations**: use `prisma migrate` from day one, committed to the repo, so schema evolves
  with version history.
