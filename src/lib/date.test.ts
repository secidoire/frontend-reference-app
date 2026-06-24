import { describe, it, expect } from "vitest";
import { formatDate } from "./date";

describe("formatDate", () => {
  it("ISO日時を YYYY/MM/DD に整形する", () => {
    expect(formatDate("2026-01-10T00:00:00.000Z")).toBe("2026/01/10");
  });

  it("月日をゼロ埋めする", () => {
    expect(formatDate("2026-03-05T12:34:56.000Z")).toBe("2026/03/05");
  });
});
