-- CreateEnum
CREATE TYPE "TeamMemberGender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN "gender" "TeamMemberGender" NOT NULL DEFAULT 'MALE';

ALTER TABLE "TeamMember" ALTER COLUMN "photo" DROP NOT NULL;
