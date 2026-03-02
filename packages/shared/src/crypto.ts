import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const AES_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function parseEncryptionKey(keyHex: string): Buffer {
  if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes).");
  }

  return Buffer.from(keyHex, "hex");
}

export function validateEncryptionKey(keyHex: string): void {
  parseEncryptionKey(keyHex);
}

export function encryptAes256Gcm(plaintext: string, keyHex: string): string {
  const key = parseEncryptionKey(keyHex);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(AES_ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, ciphertext, tag]).toString("base64");
}

export function decryptAes256Gcm(encodedCiphertext: string, keyHex: string): string {
  const key = parseEncryptionKey(keyHex);
  const payload = Buffer.from(encodedCiphertext, "base64");

  if (payload.length <= IV_LENGTH + TAG_LENGTH) {
    throw new Error("Invalid encrypted payload.");
  }

  const iv = payload.subarray(0, IV_LENGTH);
  const tag = payload.subarray(payload.length - TAG_LENGTH);
  const ciphertext = payload.subarray(IV_LENGTH, payload.length - TAG_LENGTH);

  const decipher = createDecipheriv(AES_ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}
