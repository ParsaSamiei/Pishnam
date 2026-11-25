-- Each branch can list its own phone numbers alongside the site-wide ones.
-- Existing branches start with an empty list; no existing numbers are moved.
ALTER TABLE "ContactAddress" ADD COLUMN "phones" TEXT[] DEFAULT ARRAY[]::TEXT[];
