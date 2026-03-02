import { Prisma } from "@prisma/client";
import { db } from "../lib/db";

export async function createWorkerAuditLog(input: {
  orgId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadataJson?: Prisma.InputJsonValue;
}) {
  await db.auditLog.create({
    data: {
      orgId: input.orgId,
      actorUserId: null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadataJson: input.metadataJson
    }
  });
}
