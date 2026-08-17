# Pishnam — Product & Brand Identity

## What Pishnam is

پژوهشگران رباتیک پیشنام (Pishnam Robotics Researchers) is a robotics education club. It runs
tiered, hands-on robotics/electronics/AI education — from simple electronic-board projects for
first-grade students up through advanced competitive robots built for international events in the
RoboCup style (Rescue Line, Rescue Maze, Sport, Cliff Hanger, etc.). Students have represented
Pishnam at national and international competitions.

## Mission (working statement — refine with founders)

"To make robotics and applied engineering education accessible and progressive — taking a student
from their first circuit to a competition-ready robot — for every age group, from elementary
school through high school."

## Audiences (all need distinct entry points on the site, not one generic homepage)

1. **Parents** — want to know: is this credible, safe, age-appropriate, what does it cost/involve,
   where/when are classes, how do I enroll.
2. **Students** (secondary readers, sometimes primary for teens) — want to know: what will I
   actually build, what tiers/courses exist, what competitions can I join.
3. **Prospective sponsors** — want to know: track record/achievements, media presence, what
   sponsorship gets them, contact path.
4. **Schools/institutions** — want to know: can Pishnam run programs at our school, credentials,
   past partnerships, contact path for B2B inquiries.
5. **General public / press** — achievements, news, competition results.

Each audience should have a clear, short path from the homepage (not buried in a mega-menu) — see
`02-information-architecture.md` for the "audience entry points" concept.

## Rebuild goals vs. current WordPress site

- Keep: brand name, logo, all existing content categories (courses, achievements, magazine/blog,
  downloads, jobs/internships, entertainment/videos), dark-blue-and-yellow identity.
- Improve: page performance (current WP site is heavy), UI/UX clarity (current nav is a deep
  multi-level mega-menu that's hard to scan), mobile experience, and give distinct audience
  entry points rather than one undifferentiated homepage.
- Drop/defer: no e-commerce, no purchase flow, no student progress-tracking/LMS in v1.

## Brand assets

- **Name**: Pishnam / پیشنام — unchanged.
- **Logo**: existing robot-badge logo — kept as-is. Final production logo file to be supplied
  later; use a placeholder mark (simple wordmark + generic badge shape) until then. Do not design
  a new logo.
- **Colors**: dark blue + yellow, drawn from the existing logo, as the primary palette — confirmed
  hex values now locked in `03-design-system.md` (gold `#E6A817`, navy `#18222D`, steel blue
  `#3B5E82`, off-white `#F2F2F0`, red `#E5001A`).

## Tone of voice

Dual register, chosen per section/audience:

- **Credible/technical register** — used for: course descriptions, competition results, sponsor
  and school-facing pages. Precise, factual, achievement-forward (results, rankings, robot types).
- **Playful/kid-friendly register** — used for: entry-level course pages, homepage hero copy aimed
  at younger students, blog posts explaining concepts simply (mirrors the existing "crank and
  ratchet" style social content — simple analogies, light emoji use is acceptable in blog/social
  contexts but not in formal pages).

Never mix registers within a single page — e.g. a sponsor page stays fully credible/technical; a
first-grade course page can be playful throughout.

## Business model (v1)

No online payments or checkout. All monetization-adjacent flows are **lead capture**:

- Course/tier interest + enrollment request forms.
- Offline class seat request forms (see IA doc).
- Sponsor inquiry form.
- School/institution partnership inquiry form.
- Job/internship application form.

These route to leads stored in the database, visible in the admin panel (see `06-admin-panel.md`
for the leads dashboard) — no email notification pipeline.

## What the site needs to contain (from stakeholder input)

- Pishnam info/about, mission, history.
- Achievements & awards (competition results, ideally filterable by year/competition).
- Enrollment path (per tier/course, and per offline class).
- Educational video hub — embeds/links to Pishnam's existing Aparat channel content, organized by
  topic/tier rather than a raw feed.
- Downloads — links/files for software, datasheets, part libraries, books, posters (mirrors
  current WP "Download Center").
- Everything else needed for a credible club site: contact, jobs/internships, sponsor info, news/
  blog.
