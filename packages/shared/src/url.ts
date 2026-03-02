import { isIP } from "node:net";

export class PublicUrlValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicUrlValidationError";
  }
}

type SuccessResult = {
  ok: true;
  normalizedUrl: string;
};

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((accumulator, octet) => (accumulator << 8) + Number(octet), 0) >>> 0;
}

function isIpv4InCidr(ip: string, cidrBase: string, prefix: number): boolean {
  const ipInt = ipv4ToInt(ip);
  const baseInt = ipv4ToInt(cidrBase);
  const mask = prefix === 0 ? 0 : ((~0 << (32 - prefix)) >>> 0);
  return (ipInt & mask) === (baseInt & mask);
}

function assertPublicHostname(hostname: string): void {
  const normalizedHost = hostname.toLowerCase();

  if (normalizedHost === "localhost") {
    throw new PublicUrlValidationError("Localhost URLs are not allowed.");
  }

  const ipVersion = isIP(normalizedHost);
  if (ipVersion !== 4) {
    return;
  }

  if (normalizedHost === "127.0.0.1" || normalizedHost === "0.0.0.0") {
    throw new PublicUrlValidationError("Local IP URLs are not allowed.");
  }

  if (isIpv4InCidr(normalizedHost, "10.0.0.0", 8)) {
    throw new PublicUrlValidationError("Private network URLs are not allowed.");
  }

  if (isIpv4InCidr(normalizedHost, "172.16.0.0", 12)) {
    throw new PublicUrlValidationError("Private network URLs are not allowed.");
  }

  if (isIpv4InCidr(normalizedHost, "192.168.0.0", 16)) {
    throw new PublicUrlValidationError("Private network URLs are not allowed.");
  }

  if (isIpv4InCidr(normalizedHost, "169.254.0.0", 16)) {
    throw new PublicUrlValidationError("Link-local URLs are not allowed.");
  }
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  const parsed = new URL(trimmed);

  parsed.hostname = parsed.hostname.toLowerCase();
  parsed.hash = "";

  if (parsed.pathname.length > 1) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  }

  return parsed.toString();
}

export function validatePublicHttpUrl(input: string): SuccessResult {
  let parsed: URL;

  try {
    parsed = new URL(input.trim());
  } catch {
    throw new PublicUrlValidationError("Invalid URL format.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new PublicUrlValidationError("Only http and https URLs are allowed.");
  }

  assertPublicHostname(parsed.hostname);

  const normalizedUrl = normalizeUrl(parsed.toString());
  return { ok: true, normalizedUrl };
}
