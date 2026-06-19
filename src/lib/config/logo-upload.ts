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
