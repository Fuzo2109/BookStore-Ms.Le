import { describe, expect, it } from "vitest";
import {
  COVER_FORMAT_MESSAGE,
  COVER_SIZE_MESSAGE,
  MAX_COVER_BYTES,
  sniffImageType,
  validateCoverFile,
} from "@/lib/cover-rules";

const MB = 1024 * 1024;

describe("CR-04 cover upload rules", () => {
  it("AC1: accepts a 1.5 MB JPG", () => {
    expect(validateCoverFile({ name: "cover.jpg", size: 1.5 * MB, type: "image/jpeg" })).toBeNull();
  });

  it("accepts a PNG exactly at the 2 MB boundary", () => {
    expect(validateCoverFile({ name: "cover.PNG", size: MAX_COVER_BYTES, type: "image/png" })).toBeNull();
  });

  it("AC2: rejects a 2.5 MB file and states the 2 MB limit", () => {
    const msg = validateCoverFile({ name: "big.jpg", size: 2.5 * MB, type: "image/jpeg" });
    expect(msg).toBe(COVER_SIZE_MESSAGE);
    expect(msg).toContain("2 MB");
  });

  it("rejects one byte over the limit", () => {
    expect(validateCoverFile({ name: "a.jpg", size: MAX_COVER_BYTES + 1, type: "image/jpeg" })).toBe(COVER_SIZE_MESSAGE);
  });

  it.each([
    ["anim.gif", "image/gif"],
    ["doc.pdf", "application/pdf"],
    ["fake.jpg", "application/pdf"],
  ])("AC3: rejects %s (%s) and states the accepted formats", (name, type) => {
    const msg = validateCoverFile({ name, size: 100_000, type });
    expect(msg).toBe(COVER_FORMAT_MESSAGE);
    expect(msg).toMatch(/JPG and PNG/);
  });

  it("detects real JPEG and PNG content and rejects GIF/PDF bytes", () => {
    expect(sniffImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("jpeg");
    expect(sniffImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("png");
    expect(sniffImageType(new TextEncoder().encode("GIF89a"))).toBeNull();
    expect(sniffImageType(new TextEncoder().encode("%PDF-1.7"))).toBeNull();
  });
});
