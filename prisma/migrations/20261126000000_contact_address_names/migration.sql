-- Keep existing addresses, phones and maps unchanged. Unnamed branches retain
-- their numbered labels until an admin supplies a branch name.
ALTER TABLE "ContactAddress"
    ADD COLUMN "nameFa" TEXT,
    ADD COLUMN "nameEn" TEXT;
