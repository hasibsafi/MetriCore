import { db } from "../lib/db";
import { Prisma } from "@prisma/client";

type AuditLogInput = {
  orgId: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadataJson?: Prisma.InputJsonValue;
};

export async function createAuditLog(input: AuditLogInput): Promise<void> {
  await db.auditLog.create({
    data: {
      orgId: input.orgId,
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadataJson: input.metadataJson ?? undefined
    }
  });
}
