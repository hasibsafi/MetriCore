import { Prisma, RecommendationStatus } from "@prisma/client";
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

export async function listOpenRecommendationKeys(orgId: string, siteId: string) {
  const recommendations = await db.recommendation.findMany({
    where: {
      orgId,
      siteId,
      status: RecommendationStatus.open
    },
    select: {
      metadataJson: true
    }
  });

  return recommendations
    .map((item) => {
      const metadata = item.metadataJson as { key?: unknown } | null;
      return typeof metadata?.key === "string" ? metadata.key : null;
    })
    .filter((item): item is string => Boolean(item));
}

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
