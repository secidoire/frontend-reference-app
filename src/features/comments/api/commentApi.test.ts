import { describe, it, expect } from "vitest";
import { listComments } from "./commentApi";

describe("commentApi", () => {
  it("チケットのコメントを返す（昇順）", async () => {
    const comments = await listComments("t1");
    expect(comments).toHaveLength(2);
    expect(comments.every((c) => c.ticketId === "t1")).toBe(true);
    expect(comments[0].createdAt <= comments[1].createdAt).toBe(true);
  });

  it("コメントが無ければ空配列", async () => {
    expect(await listComments("t3")).toEqual([]);
  });
});
