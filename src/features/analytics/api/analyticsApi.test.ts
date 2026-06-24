import { describe, it, expect } from "vitest";
import { getAnalytics } from "./analyticsApi";

describe("analyticsApi", () => {
  it("集計を返す（seed 6件と整合）", async () => {
    const a = await getAnalytics();

    const statusTotal = a.byStatus.reduce((s, d) => s + d.count, 0);
    const assigneeTotal = a.byAssignee.reduce((s, d) => s + d.count, 0);
    const monthlyTotal = a.monthlyCreated.reduce((s, d) => s + d.count, 0);

    expect(statusTotal).toBe(6);
    expect(assigneeTotal).toBe(6);
    expect(monthlyTotal).toBe(6);
    expect(a.byStatus).toHaveLength(4); // 4ステータス
    expect(a.monthlyCreated.every((d) => /^\d{4}-\d{2}$/.test(d.month))).toBe(true);
  });
});
