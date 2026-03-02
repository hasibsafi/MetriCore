-- DropForeignKey
ALTER TABLE "ScanRun" DROP CONSTRAINT "ScanRun_siteId_fkey";

-- AlterTable
ALTER TABLE "ScanRun" ALTER COLUMN "siteId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ScanRun" ADD CONSTRAINT "ScanRun_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;
