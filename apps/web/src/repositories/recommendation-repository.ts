import { RecommendationPriority, RecommendationStatus, Prisma } from "@prisma/client";
import { db } from "../lib/db";

type RecommendationCreateInput = {
  category: string;
  title: string;
  description: string;
  impact: "high" | "med" | "low";
  priority: "P0" | "P1" | "P2";
  status?: "open" | "done";
  metadataJson?: Prisma.InputJsonValue;
};

export async function createManyRecommendations(orgId: string, siteId: string, recs: RecommendationCreateInput[]) {
  if (!recs.length) {
    return { count: 0 };
  }

  return db.recommendation.createMany({
    data: recs.map((rec) => ({
      orgId,
      siteId,
      category: rec.category,
      title: rec.title,
      description: rec.description,
      impact: rec.impact,
      priority: rec.priority,
      status: rec.status ?? "open",
      metadataJson: rec.metadataJson
    }))
  });
}

export async function listRecommendations(
  orgId: string,
  siteId: string,
  filters: { status?: RecommendationStatus; priority?: RecommendationPriority }
) {
  return db.recommendation.findMany({
    where: {
      orgId,
      siteId,
      status: filters.status,
      priority: filters.priority
    },
    select: {
      id: true,
      orgId: true,
      siteId: true,
      category: true,
      title: true,
      description: true,
      impact: true,
      priority: true,
      status: true,
      metadataJson: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }]
  });
}

export async function markRecommendationDone(orgId: string, siteId: string, recId: string) {
  return db.recommendation.updateMany({
    where: {
      id: recId,
      orgId,
      siteId
    },
    data: {
      status: "done"
    }
  });
}

export async function getOpenRecommendationsCount(orgId: string, siteId: string) {
  return db.recommendation.count({
    where: {
      orgId,
      siteId,
      status: "open"
    }
  });
}
