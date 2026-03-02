-- AlterTable
ALTER TABLE "PageSpeedResult" ADD COLUMN     "desktopCls" DOUBLE PRECISION,
ADD COLUMN     "desktopFcpMs" DOUBLE PRECISION,
ADD COLUMN     "desktopLcpMs" DOUBLE PRECISION,
ADD COLUMN     "desktopPerformanceScore" DOUBLE PRECISION,
ADD COLUMN     "desktopTbtMs" DOUBLE PRECISION,
ADD COLUMN     "desktopTtfbMs" DOUBLE PRECISION,
ADD COLUMN     "rawJsonDesktop" JSONB;
