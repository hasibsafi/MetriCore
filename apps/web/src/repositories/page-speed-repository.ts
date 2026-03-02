import { Prisma } from "@prisma/client";
import { db } from "../lib/db";

type UpsertPageSpeedResultInput = {
  orgId: string;
  scanRunId: string;
  performanceScore: number | null;
  lcpMs: number | null;
  cls: number | null;
  tbtMs: number | null;
  fcpMs: number | null;
  ttfbMs: number | null;
  desktopPerformanceScore: number | null;
  desktopLcpMs: number | null;
  desktopCls: number | null;
  desktopTbtMs: number | null;
  desktopFcpMs: number | null;
  desktopTtfbMs: number | null;
  rawJson: Prisma.InputJsonValue;
  rawJsonDesktop: Prisma.InputJsonValue | null;
};

export async function upsertResult(input: UpsertPageSpeedResultInput) {
  return db.pageSpeedResult.upsert({
    where: {
      scanRunId: input.scanRunId
    },
    update: {
      performanceScore: input.performanceScore,
      lcpMs: input.lcpMs,
      cls: input.cls,
      tbtMs: input.tbtMs,
      fcpMs: input.fcpMs,
      ttfbMs: input.ttfbMs,
      desktopPerformanceScore: input.desktopPerformanceScore,
      desktopLcpMs: input.desktopLcpMs,
      desktopCls: input.desktopCls,
      desktopTbtMs: input.desktopTbtMs,
      desktopFcpMs: input.desktopFcpMs,
      desktopTtfbMs: input.desktopTtfbMs,
      rawJson: input.rawJson,
      rawJsonDesktop: input.rawJsonDesktop
    },
    create: {
      orgId: input.orgId,
      scanRunId: input.scanRunId,
      performanceScore: input.performanceScore,
      lcpMs: input.lcpMs,
      cls: input.cls,
      tbtMs: input.tbtMs,
      fcpMs: input.fcpMs,
      ttfbMs: input.ttfbMs,
      desktopPerformanceScore: input.desktopPerformanceScore,
      desktopLcpMs: input.desktopLcpMs,
      desktopCls: input.desktopCls,
      desktopTbtMs: input.desktopTbtMs,
      desktopFcpMs: input.desktopFcpMs,
      desktopTtfbMs: input.desktopTtfbMs,
      rawJson: input.rawJson,
      rawJsonDesktop: input.rawJsonDesktop
    }
  });
}

export async function getLatestPageSpeed(orgId: string, siteId: string) {
  return db.pageSpeedResult.findFirst({
    where: {
      orgId,
      scanRun: {
        siteId
      }
    },
    select: {
      id: true,
      orgId: true,
      scanRunId: true,
      performanceScore: true,
      lcpMs: true,
      cls: true,
      tbtMs: true,
      fcpMs: true,
      ttfbMs: true,
      desktopPerformanceScore: true,
      desktopLcpMs: true,
      desktopCls: true,
      desktopTbtMs: true,
      desktopFcpMs: true,
      desktopTtfbMs: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getPageSpeedHistory(orgId: string, siteId: string, days: number) {
  const safeDays = Math.max(7, Math.min(days, 90));
  const limit = safeDays <= 30 ? 30 : 90;
  const since = new Date();
  since.setDate(since.getDate() - safeDays);

  return db.pageSpeedResult.findMany({
    where: {
      orgId,
      createdAt: {
        gte: since
      },
      scanRun: {
        orgId,
        siteId,
        status: "completed"
      }
    },
    select: {
      performanceScore: true,
      lcpMs: true,
      cls: true,
      tbtMs: true,
      fcpMs: true,
      ttfbMs: true,
      desktopPerformanceScore: true,
      desktopLcpMs: true,
      desktopCls: true,
      desktopTbtMs: true,
      desktopFcpMs: true,
      desktopTtfbMs: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "asc"
    },
    take: limit
  });
}
