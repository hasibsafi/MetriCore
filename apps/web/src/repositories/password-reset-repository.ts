import { db } from "../lib/db";

export async function createPasswordResetToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  return db.passwordResetToken.create({
    data: {
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt
    },
    select: {
      id: true
    }
  });
}

export async function deletePasswordResetTokensForUser(userId: string) {
  return db.passwordResetToken.deleteMany({
    where: {
      userId
    }
  });
}

export async function findValidPasswordResetToken(tokenHash: string, now: Date) {
  return db.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: {
        gt: now
      }
    },
    select: {
      id: true,
      userId: true
    }
  });
}

export async function markPasswordResetTokenUsed(tokenId: string, usedAt: Date) {
  return db.passwordResetToken.update({
    where: {
      id: tokenId
    },
    data: {
      usedAt
    }
  });
}
