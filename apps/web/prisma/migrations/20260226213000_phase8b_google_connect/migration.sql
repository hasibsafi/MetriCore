-- AlterTable
ALTER TABLE "SiteIntegration"
ADD COLUMN "googleRefreshToken" TEXT,
ADD COLUMN "googleTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN "googleEmail" TEXT,
ADD COLUMN "connectedAt" TIMESTAMP(3);
