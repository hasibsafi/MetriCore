import { Prisma } from "@prisma/client";
import { db } from "../lib/db";

type SnapshotRange = "7d" | "30d" | "90d";

function normalizeRange(range: SnapshotRange | null | undefined): SnapshotRange {
  if (range === "7d" || range === "90d") {
    return range;
  }

  return "30d";
}

export async function createGA4Snapshot(
  orgId: string,
  siteId: string,
  range: SnapshotRange,
  dateStart: Date,
  dateEnd: Date,
  sessions: number,
  users: number,
  topPagesJson: Prisma.InputJsonValue
) {
  return db.gA4Snapshot.create({
    data: {
      orgId,
      siteId,
      range,
      dateStart,
      dateEnd,
      sessions,
      users,
      topPagesJson
    },
    select: {
      id: true,
      orgId: true,
      siteId: true,
      range: true,
      dateStart: true,
      dateEnd: true,
      sessions: true,
      users: true,
      topPagesJson: true,
      createdAt: true
    }
  });
}

export async function createGSCSnapshot(
  orgId: string,
  siteId: string,
  range: SnapshotRange,
  dateStart: Date,
  dateEnd: Date,
  clicks: number,
  impressions: number,
  ctr: number,
  position: number,
  topQueriesJson: Prisma.InputJsonValue,
  topPagesJson: Prisma.InputJsonValue
) {
  return db.gSCSnapshot.create({
    data: {
      orgId,
      siteId,
      range,
      dateStart,
      dateEnd,
      clicks,
      impressions,
      ctr,
      position,
      topQueriesJson,
      topPagesJson
    },
    select: {
      id: true,
      orgId: true,
      siteId: true,
      range: true,
      dateStart: true,
      dateEnd: true,
      clicks: true,
      impressions: true,
      ctr: true,
      position: true,
      topQueriesJson: true,
      topPagesJson: true,
      createdAt: true
    }
  });
}

export async function getLatestGA4Snapshot(orgId: string, siteId: string, range?: SnapshotRange | null) {
  const normalizedRange = normalizeRange(range);

  return db.gA4Snapshot.findFirst({
    where: {
      orgId,
      siteId,
      range: normalizedRange
    },
    select: {
      id: true,
      orgId: true,
      siteId: true,
      range: true,
      dateStart: true,
      dateEnd: true,
      sessions: true,
      users: true,
      topPagesJson: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getLatestTwoGA4Snapshots(orgId: string, siteId: string, range?: SnapshotRange | null) {
  const normalizedRange = normalizeRange(range);

  return db.gA4Snapshot.findMany({
    where: {
      orgId,
      siteId,
      range: normalizedRange
    },
    select: {
      id: true,
      orgId: true,
      siteId: true,
      range: true,
      dateStart: true,
      dateEnd: true,
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

export async function getLatestGSCSnapshot(orgId: string, siteId: string, range?: SnapshotRange | null) {
  const normalizedRange = normalizeRange(range);

  return db.gSCSnapshot.findFirst({
    where: {
      orgId,
      siteId,
      range: normalizedRange
    },
    select: {
      id: true,
      orgId: true,
      siteId: true,
      range: true,
      dateStart: true,
      dateEnd: true,
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

export async function getGA4History(orgId: string, siteId: string, range?: SnapshotRange | null) {
  const normalizedRange = normalizeRange(range);
  const days = normalizedRange === "7d" ? 7 : normalizedRange === "90d" ? 90 : 30;
  const limit = days <= 30 ? 30 : 90;
  const since = new Date();
  since.setDate(since.getDate() - days);

  return db.gA4Snapshot.findMany({
    where: {
      orgId,
      siteId,
      range: normalizedRange,
      createdAt: {
        gte: since
      }
    },
    select: {
      id: true,
      sessions: true,
      users: true,
      topPagesJson: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "asc"
    },
    take: limit
  });
}

export async function getGSCHistory(orgId: string, siteId: string, range?: SnapshotRange | null) {
  const normalizedRange = normalizeRange(range);
  const days = normalizedRange === "7d" ? 7 : normalizedRange === "90d" ? 90 : 30;
  const limit = days <= 30 ? 30 : 90;
  const since = new Date();
  since.setDate(since.getDate() - days);

  return db.gSCSnapshot.findMany({
    where: {
      orgId,
      siteId,
      range: normalizedRange,
      createdAt: {
        gte: since
      }
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
      createdAt: "asc"
    },
    take: limit
  });
}
