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
  await db.pageSpeedResult.upsert({
    where: { scanRunId: input.scanRunId },
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
        siteId,
        status: "completed"
      }
    },
    select: {
      id: true,
      performanceScore: true,
      lcpMs: true,
      cls: true,
      tbtMs: true,
      desktopPerformanceScore: true,
      desktopLcpMs: true,
      desktopCls: true,
      desktopTbtMs: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}
