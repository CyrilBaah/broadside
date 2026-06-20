import { describe, expect, it } from "vitest";
import {
  InvalidLogoReferenceError,
  isPrivateOrReservedHost,
  validateLogoReference,
} from "@/lib/config/logo-upload";

describe("validateLogoReference (FR-015)", () => {
  it("accepts a valid https image URL", () => {
    expect(() => validateLogoReference("https://example.com/logo.png")).not.toThrow();
  });

  it("accepts a valid http image URL", () => {
    expect(() => validateLogoReference("http://example.com/logo.png")).not.toThrow();
  });

  it("accepts a valid data:image/... URI", () => {
    expect(() => validateLogoReference("data:image/png;base64,iVBORw0KGgo=")).not.toThrow();
  });

  it("rejects a malformed value", () => {
    expect(() => validateLogoReference("not a url at all")).toThrow(InvalidLogoReferenceError);
  });

  it("rejects an unsupported data URI mime type", () => {
    expect(() => validateLogoReference("data:text/html,<script>1</script>")).toThrow(
      InvalidLogoReferenceError,
    );
  });

  it("rejects a non-http(s) scheme", () => {
    expect(() => validateLogoReference("ftp://example.com/logo.png")).toThrow(InvalidLogoReferenceError);
    expect(() => validateLogoReference("file:///etc/passwd")).toThrow(InvalidLogoReferenceError);
  });

  it.each([
    "http://127.0.0.1/logo.png",
    "http://localhost/logo.png",
    "http://10.0.0.5/logo.png",
    "http://172.16.0.1/logo.png",
    "http://192.168.1.1/logo.png",
    "http://169.254.169.254/latest/meta-data/",
    "http://[::1]/logo.png",
    "http://service.local/logo.png",
  ])("rejects a private/internal/loopback/link-local URL: %s", (url) => {
    expect(() => validateLogoReference(url)).toThrow(InvalidLogoReferenceError);
  });

  it("accepts a public IP literal", () => {
    expect(() => validateLogoReference("http://93.184.216.34/logo.png")).not.toThrow();
  });
});

describe("isPrivateOrReservedHost", () => {
  it("flags loopback, private, and link-local ranges", () => {
    expect(isPrivateOrReservedHost("127.0.0.1")).toBe(true);
    expect(isPrivateOrReservedHost("10.1.2.3")).toBe(true);
    expect(isPrivateOrReservedHost("172.31.0.1")).toBe(true);
    expect(isPrivateOrReservedHost("192.168.0.1")).toBe(true);
    expect(isPrivateOrReservedHost("169.254.1.1")).toBe(true);
    expect(isPrivateOrReservedHost("::1")).toBe(true);
    expect(isPrivateOrReservedHost("localhost")).toBe(true);
  });

  it("does not flag public addresses", () => {
    expect(isPrivateOrReservedHost("93.184.216.34")).toBe(false);
    expect(isPrivateOrReservedHost("example.com")).toBe(false);
    expect(isPrivateOrReservedHost("8.8.8.8")).toBe(false);
  });
});
