-- CreateTable
CREATE TABLE "SiteIntegration" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "ga4PropertyId" TEXT,
    "gscSiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteIntegration_siteId_key" ON "SiteIntegration"("siteId");

-- CreateIndex
CREATE INDEX "SiteIntegration_orgId_idx" ON "SiteIntegration"("orgId");

-- AddForeignKey
ALTER TABLE "SiteIntegration" ADD CONSTRAINT "SiteIntegration_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteIntegration" ADD CONSTRAINT "SiteIntegration_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
