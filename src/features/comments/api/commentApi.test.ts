import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
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

  it("APIがエラーなら例外を投げる", async () => {
    server.use(
      http.get("*/api/tickets/:id/comments", () => new HttpResponse(null, { status: 500 })),
    );
    await expect(listComments("t1")).rejects.toThrow();
  });
});
