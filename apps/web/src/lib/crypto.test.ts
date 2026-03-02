import { decryptAes256Gcm, encryptAes256Gcm, validateEncryptionKey } from "@metricore/shared";
import { describe, expect, it } from "vitest";

describe("shared crypto", () => {
  const key = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  it("round-trips plaintext", () => {
    const cipher = encryptAes256Gcm("refresh-token-value", key);
    const plain = decryptAes256Gcm(cipher, key);

    expect(plain).toBe("refresh-token-value");
  });

  it("throws when decrypting with wrong key", () => {
    const cipher = encryptAes256Gcm("refresh-token-value", key);
    const wrongKey = "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";

    expect(() => decryptAes256Gcm(cipher, wrongKey)).toThrow();
  });

  it("throws when payload is tampered", () => {
    const cipher = encryptAes256Gcm("refresh-token-value", key);
    const payload = Buffer.from(cipher, "base64");
    payload[5] = payload[5] ^ 0xff;

    expect(() => decryptAes256Gcm(payload.toString("base64"), key)).toThrow();
  });

  it("validates key format", () => {
    expect(() => validateEncryptionKey(key)).not.toThrow();
    expect(() => validateEncryptionKey("too-short")).toThrow();
  });
});
