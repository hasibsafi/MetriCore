import { Prisma } from "@prisma/client";
import { db } from "../lib/db";

export async function createGA4Snapshot(input: {
  orgId: string;
  siteId: string;
  range: "7d" | "30d" | "90d";
  dateStart: Date;
  dateEnd: Date;
  sessions: number;
  users: number;
  topPagesJson: Prisma.InputJsonValue;
}) {
  await db.gA4Snapshot.upsert({
    where: {
      siteId_range_dateStart_dateEnd: {
        siteId: input.siteId,
        range: input.range,
        dateStart: input.dateStart,
        dateEnd: input.dateEnd
      }
    },
    update: {
      orgId: input.orgId,
      range: input.range,
      sessions: input.sessions,
      users: input.users,
      topPagesJson: input.topPagesJson
    },
    create: {
      orgId: input.orgId,
      siteId: input.siteId,
      range: input.range,
      dateStart: input.dateStart,
      dateEnd: input.dateEnd,
      sessions: input.sessions,
      users: input.users,
      topPagesJson: input.topPagesJson
    }
  });
}

export async function createGSCSnapshot(input: {
  orgId: string;
  siteId: string;
  range: "7d" | "30d" | "90d";
  dateStart: Date;
  dateEnd: Date;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topQueriesJson: Prisma.InputJsonValue;
  topPagesJson: Prisma.InputJsonValue;
}) {
  await db.gSCSnapshot.upsert({
    where: {
      siteId_range_dateStart_dateEnd: {
        siteId: input.siteId,
        range: input.range,
        dateStart: input.dateStart,
        dateEnd: input.dateEnd
      }
    },
    update: {
      orgId: input.orgId,
      range: input.range,
      clicks: input.clicks,
      impressions: input.impressions,
      ctr: input.ctr,
      position: input.position,
      topQueriesJson: input.topQueriesJson,
      topPagesJson: input.topPagesJson
    },
    create: {
      orgId: input.orgId,
      siteId: input.siteId,
      range: input.range,
      dateStart: input.dateStart,
      dateEnd: input.dateEnd,
      clicks: input.clicks,
      impressions: input.impressions,
      ctr: input.ctr,
      position: input.position,
      topQueriesJson: input.topQueriesJson,
      topPagesJson: input.topPagesJson
    }
  });
}

export async function getLatestTwoGA4Snapshots(orgId: string, siteId: string) {
  return db.gA4Snapshot.findMany({
    where: {
      orgId,
      siteId
    },
    select: {
      id: true,
      sessions: true,
      users: true,
      topPagesJson: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 2
  });
}

export async function getLatestGSCSnapshot(orgId: string, siteId: string) {
  return db.gSCSnapshot.findFirst({
    where: {
      orgId,
      siteId
    },
    select: {
      id: true,
      clicks: true,
      impressions: true,
      ctr: true,
      position: true,
      topQueriesJson: true,
      topPagesJson: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}
