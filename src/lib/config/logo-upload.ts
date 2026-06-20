import { ALLOWED_LOGO_MIME_TYPES, MAX_LOGO_BYTES } from "./schema";

/**
 * FR-006: logo uploads are restricted to PNG/JPEG/WebP/SVG, max 2MB. Rejected
 * uploads keep the prior logo state (handled by the caller — this module only
 * validates and encodes, it doesn't persist anything since there's no backend
 * storage for v1; a valid logo becomes a data: URI carried in the shareable
 * config URL itself, per FR-008/data-model.md).
 */

export class LogoTooLargeError extends Error {
  constructor(sizeBytes: number) {
    super(`Logo is ${formatBytes(sizeBytes)}, which exceeds the ${formatBytes(MAX_LOGO_BYTES)} limit.`);
    this.name = "LogoTooLargeError";
  }
}

export class UnsupportedLogoTypeError extends Error {
  constructor(mimeType: string) {
    super(`"${mimeType}" isn't a supported logo type. Use PNG, JPEG, WebP, or SVG.`);
    this.name = "UnsupportedLogoTypeError";
  }
}

export function validateLogoFile(file: { type: string; size: number }): void {
  if (!ALLOWED_LOGO_MIME_TYPES.includes(file.type)) {
    throw new UnsupportedLogoTypeError(file.type);
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new LogoTooLargeError(file.size);
  }
}

/**
 * FR-015: a pasted logo value (as an alternative to file upload) must be a
 * syntactically valid URL or `data:image/...` URI. Byte-size/type for a
 * remote URL can't be checked client-side, so that's verified at render time
 * (data-model.md); this only rejects clearly invalid or unsafe references.
 */
export class InvalidLogoReferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidLogoReferenceError";
  }
}

/**
 * SSRF protection (clarified 2026-06-20): a pasted URL is rejected before any
 * fetch is attempted if it uses a non-http(s) scheme, or its host is a
 * literal private/internal/loopback/link-local address. This catches the
 * common case of a directly pasted IP; DNS-rebinding via a hostname that
 * *resolves* to such a range is additionally checked server-side at render
 * time (route.ts), since that requires an actual DNS lookup unavailable here.
 */
export function isPrivateOrReservedHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();

  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return true;
  }

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true; // link-local
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    return false;
  }

  if (host.includes(":")) {
    if (host === "::1" || host === "::") return true; // loopback / unspecified
    if (host.startsWith("fe8") || host.startsWith("fe9") || host.startsWith("fea") || host.startsWith("feb")) {
      return true; // link-local fe80::/10
    }
    if (host.startsWith("fc") || host.startsWith("fd")) return true; // unique local fc00::/7
    return false;
  }

  return false;
}

export function validateLogoReference(value: string): void {
  const trimmed = value.trim();

  if (trimmed.startsWith("data:")) {
    if (!ALLOWED_LOGO_MIME_TYPES.some((mime) => trimmed.startsWith(`data:${mime}`))) {
      throw new InvalidLogoReferenceError(
        "That data URI isn't a supported image type. Use PNG, JPEG, WebP, or SVG.",
      );
    }
    return;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new InvalidLogoReferenceError("That doesn't look like a valid image URL or data URI.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new InvalidLogoReferenceError("Logo URLs must use http or https.");
  }

  if (isPrivateOrReservedHost(url.hostname)) {
    throw new InvalidLogoReferenceError("That URL points to a private or internal address and can't be used.");
  }
}

/** Encodes a validated logo file's bytes as a data: URI for use as a config's `logo` reference. */
export function encodeLogoAsDataUri(mimeType: string, bytes: Uint8Array): string {
  const base64 = bufferToBase64(bytes);
  return `data:${mimeType};base64,${base64}`;
}

function bufferToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${bytes}B`;
}
