-- Add range columns as nullable
ALTER TABLE "GA4Snapshot" ADD COLUMN "range" TEXT;
ALTER TABLE "GSCSnapshot" ADD COLUMN "range" TEXT;

-- Backfill existing rows to 30d
UPDATE "GA4Snapshot" SET "range" = '30d' WHERE "range" IS NULL;
UPDATE "GSCSnapshot" SET "range" = '30d' WHERE "range" IS NULL;

-- Enforce not-null after backfill
ALTER TABLE "GA4Snapshot" ALTER COLUMN "range" SET NOT NULL;
ALTER TABLE "GSCSnapshot" ALTER COLUMN "range" SET NOT NULL;

-- Drop old unique constraints
DROP INDEX IF EXISTS "GA4Snapshot_siteId_dateStart_dateEnd_key";
DROP INDEX IF EXISTS "GSCSnapshot_siteId_dateStart_dateEnd_key";

-- Add new unique constraints including range
CREATE UNIQUE INDEX "GA4Snapshot_siteId_range_dateStart_dateEnd_key" ON "GA4Snapshot"("siteId", "range", "dateStart", "dateEnd");
CREATE UNIQUE INDEX "GSCSnapshot_siteId_range_dateStart_dateEnd_key" ON "GSCSnapshot"("siteId", "range", "dateStart", "dateEnd");

-- Add range lookup indexes
CREATE INDEX "GA4Snapshot_orgId_siteId_range_idx" ON "GA4Snapshot"("orgId", "siteId", "range");
CREATE INDEX "GSCSnapshot_orgId_siteId_range_idx" ON "GSCSnapshot"("orgId", "siteId", "range");
