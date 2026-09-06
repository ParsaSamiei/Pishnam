-- CreateTable
CREATE TABLE "TeamTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMemberTag" (
    "memberId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "TeamMemberTag_pkey" PRIMARY KEY ("memberId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamTag_slug_key" ON "TeamTag"("slug");

-- CreateIndex
CREATE INDEX "TeamTag_active_order_idx" ON "TeamTag"("active", "order");

-- CreateIndex
CREATE INDEX "TeamMemberTag_tagId_idx" ON "TeamMemberTag"("tagId");

-- AddForeignKey
ALTER TABLE "TeamMemberTag" ADD CONSTRAINT "TeamMemberTag_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMemberTag" ADD CONSTRAINT "TeamMemberTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "TeamTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
