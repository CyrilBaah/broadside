import { describe, expect, it } from "vitest";
import {
  encodeLogoAsDataUri,
  LogoTooLargeError,
  UnsupportedLogoTypeError,
  validateLogoFile,
} from "@/lib/config/logo-upload";
import { MAX_LOGO_BYTES } from "@/lib/config/schema";

describe("validateLogoFile (FR-006)", () => {
  it.each(["image/png", "image/jpeg", "image/webp", "image/svg+xml"])(
    "accepts %s under the size limit",
    (type) => {
      expect(() => validateLogoFile({ type, size: 1024 })).not.toThrow();
    },
  );

  it("rejects an unsupported type", () => {
    expect(() => validateLogoFile({ type: "image/gif", size: 1024 })).toThrow(
      UnsupportedLogoTypeError,
    );
  });

  it("rejects a file over the 2MB limit", () => {
    expect(() => validateLogoFile({ type: "image/png", size: MAX_LOGO_BYTES + 1 })).toThrow(
      LogoTooLargeError,
    );
  });

  it("accepts a file exactly at the size limit", () => {
    expect(() => validateLogoFile({ type: "image/png", size: MAX_LOGO_BYTES })).not.toThrow();
  });
});

describe("encodeLogoAsDataUri", () => {
  it("encodes bytes as a base64 data: URI with the given mime type", () => {
    const bytes = new Uint8Array([1, 2, 3, 4]);
    const uri = encodeLogoAsDataUri("image/png", bytes);

    expect(uri).toMatch(/^data:image\/png;base64,/);
    expect(uri).toContain(Buffer.from(bytes).toString("base64"));
  });
});
