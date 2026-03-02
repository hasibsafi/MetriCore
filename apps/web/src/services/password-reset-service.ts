import { createHash, randomBytes } from "node:crypto";
import { hashPassword } from "../lib/password";
import { sendPasswordResetEmail, canSendPasswordResetEmail } from "../lib/mailersend";
import { findUserByEmail, updateUserPasswordHash } from "../repositories/user-repository";
import {
  createPasswordResetToken,
  deletePasswordResetTokensForUser,
  findValidPasswordResetToken,
  markPasswordResetTokenUsed
} from "../repositories/password-reset-repository";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MINUTES = 60;

function generateResetToken(): string {
  return randomBytes(RESET_TOKEN_BYTES).toString("base64url");
}

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(input: { email: string; appUrl: string }) {
  const email = input.email.toLowerCase();
  const user = await findUserByEmail(email);

  if (!user) {
    return { ok: true as const };
  }

  const token = generateResetToken();
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  await deletePasswordResetTokensForUser(user.id);
  await createPasswordResetToken({
    userId: user.id,
    tokenHash,
    expiresAt
  });

  const resetUrl = `${input.appUrl}/reset-password?token=${encodeURIComponent(token)}`;

  if (canSendPasswordResetEmail()) {
    try {
      await sendPasswordResetEmail({
        toEmail: email,
        resetUrl
      });
    } catch (error) {
      console.error("Failed to send password reset email", error);
    }
  }

  return { ok: true as const, resetUrl };
}

export async function resetPasswordWithToken(input: { token: string; password: string }) {
  const tokenHash = hashResetToken(input.token);
  const now = new Date();

  const tokenRecord = await findValidPasswordResetToken(tokenHash, now);
  if (!tokenRecord) {
    return { ok: false as const, reason: "invalid" as const };
  }

  const passwordHash = await hashPassword(input.password);
  await updateUserPasswordHash(tokenRecord.userId, passwordHash);
  await markPasswordResetTokenUsed(tokenRecord.id, now);
  await deletePasswordResetTokensForUser(tokenRecord.userId);

  return { ok: true as const };
}
