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
  // SOFTWARE used to live here; it now has its own SoftwareProduct/
  // SoftwareRelease models below (see there for why).
  // POSTERS moved to CompetitionPoster under Competition → League → PosterCategory.
  DATASHEETS            // دیتاشیت و مستندات فنی
  BOOKS                 // کتاب و منابع آموزشی
  COMPONENT_LIBRARIES   // کتابخانه قطعات CAD (merges former SolidWorks/Altium categories)
}

enum ResourceSource {
  HOSTED    // file uploaded to Pishnam's own storage
  EXTERNAL  // link out to a third-party site (e.g. official tool page)
}

enum SoftwarePlatform {
  WINDOWS
  MACOS
  LINUX
  WEB
  ANDROID
  IOS
  OTHER
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

// Competition posters used to be flat DownloadResource rows (category =
// POSTERS). They now follow Competition → League → PosterCategory →
// CompetitionPoster so admins can manage categories per competition and
// league, and the public /downloads/posters page can group accordingly.
model Competition {
  id      String  @id @default(cuid())
  slug    String  @unique
  titleFa String
  titleEn String
  year    Int?
  order   Int     @default(0)
  active  Boolean @default(true)
  leagues League[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model League {
  id            String      @id @default(cuid())
  competition   Competition @relation(fields: [competitionId], references: [id], onDelete: Cascade)
  competitionId String
  slug          String
  titleFa       String
  titleEn       String
  order         Int         @default(0)
  active        Boolean     @default(true)
  categories    PosterCategory[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([competitionId, slug])
}

model PosterCategory {
  id       String @id @default(cuid())
  league   League @relation(fields: [leagueId], references: [id], onDelete: Cascade)
  leagueId String
  slug     String
  titleFa  String
  titleEn  String
  order    Int    @default(0)
  active   Boolean @default(true)
  posters  CompetitionPoster[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([leagueId, slug])
}

model CompetitionPoster {
  id            String         @id @default(cuid())
  category      PosterCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId    String
  titleFa       String
  titleEn       String
  descriptionFa String?
  descriptionEn String?
  previewImage  String
  source        ResourceSource
  fileUrl       String
  fileSizeBytes Int?
  order         Int            @default(0)
  active        Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

// A single app or plugin in the download center (e.g. "mBlock", "Arduino IDE
// driver pack") — gets its own public page at /downloads/software/[slug].
// Split out of DownloadResource because one flat row can't hold both a
// picture and several platform-specific files under the same product.
model SoftwareProduct {
  id            String   @id @default(cuid())
  slug          String   @unique
  image         String   // admin-uploaded cover picture, shown on the grid and the product page
  titleFa       String
  titleEn       String
  descriptionFa String?
  descriptionEn String?
  order         Int      @default(0)
  active        Boolean  @default(true)
  releases      SoftwareRelease[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// One downloadable file or link for a SoftwareProduct, scoped to a specific
// platform/version — e.g. "Windows, v2.3.1" and "macOS, v2.3.1" are two rows
// under the same product, each with its own file/link and notes.
model SoftwareRelease {
  id            String           @id @default(cuid())
  product       SoftwareProduct  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId     String
  platform      SoftwarePlatform
  versionLabel  String           // e.g. "v2.3.1", "Build 114"
  source        ResourceSource   // same HOSTED/EXTERNAL convention as DownloadResource
  fileUrl       String
  fileSizeBytes Int?
  notesFa       String?          // requirements, changelog, install notes for this specific release
  notesEn       String?
  order         Int              @default(0)
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

// Public "انتقادات و پیشنهادات" from /contact-us. Name is optional.
model Feedback {
  id        String   @id @default(cuid())
  name      String?
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}

// Admin auth (custom admin, not public accounts — see admin panel doc)
model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         String   @default("editor") // "owner" | "editor"
  createdAt    DateTime @default(now())
}

// One-row contact details (phones, email, FA/EN address, Google Maps embed,
// social profile URLs). Singleton: id is always "default"; first admin save
// creates the row.
model ContactSettings {
  id          String   @id @default("default")
  phones      String[]
  email       String?
  addressFa   String?
  addressEn   String?
  mapEmbedUrl String?  // canonical https://www.google.com/maps/embed?... URL
  telegramUrl  String?
  baleUrl      String?
  youtubeUrl   String?
  aparatUrl    String?
  instagramUrl String?
  updatedAt   DateTime @updatedAt
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

- **No `User` model for students/parents in v1** — no accounts, no auth for the public. Visitor
  interaction is via `Lead` (contact/enroll/etc. forms that expect a name and a way to reply) and
  `Feedback` (anonymous-allowed criticisms and suggestions on `/contact-us`).
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
  path vs. a well-formed external URL) in the admin form. Same public, no-gating rule applies to
  `SoftwareProduct`/`SoftwareRelease`.
- **Software & Plugins gets its own two-tier model** — one `SoftwareProduct` per app/plugin (with
  a picture and its own page) and one `SoftwareRelease` row per platform/version under it (e.g.
  Windows + macOS builds of the same app). This is the one download-center category that isn't a
  flat DownloadResource list, because a single row can't represent "one product, several files."
- **Search**: if/when free-text site search is added, use Postgres `tsvector` columns on
  `CourseTranslation`, `ArticleTranslation`, `Faq` rather than adding a new service.
- **Contact details are a settings singleton** — `ContactSettings` is one row (`id = "default"`),
  edited from `/admin/contact`, not a list of locations. Phone numbers are a `String[]` so several
  can be shown; address is bilingual (`addressFa` / `addressEn`); `mapEmbedUrl` stores only a
  canonical Google Maps embed URL (the admin form accepts a pasted iframe or URL and normalizes
  it). Missing fields are omitted on `/contact` rather than falling back to placeholder copy.
- **Hero slides are a collection, not settings** — `HeroSlide` is an ordered table managed from
  `/admin/hero-slides` like any other content type, rather than image columns on a settings
  singleton. "How many photos does the hero show?" is a question a table answers and a fixed set of
  columns cannot; it also means adding a fourth photo needs no schema change. Alt text lives on the
  slide because only whoever uploaded a photo can describe it. Zero rows renders the hero's own
  fallback, so nothing has to be seeded.
- **Migrations**: use `prisma migrate` from day one, committed to the repo, so schema evolves
  with version history.
