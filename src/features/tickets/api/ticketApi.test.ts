import { describe, it, expect } from "vitest";
import { listTickets, getTicket } from "./ticketApi";

// MSW（src/test/setup.ts で起動）がサーバ側 fetch を intercept する。
describe("ticketApi", () => {
  it("一覧をページング形式で返す", async () => {
    const res = await listTickets();
    expect(res.total).toBe(6);
    expect(res.data).toHaveLength(6);
    expect(res.page).toBe(1);
  });

  it("status でフィルタできる", async () => {
    const res = await listTickets({ status: "TODO" });
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data.every((t) => t.status === "TODO")).toBe(true);
  });

  it("priority 昇順ソート + ページサイズが効く", async () => {
    const res = await listTickets({ sort: "priority", order: "asc", pageSize: 2 });
    expect(res.data).toHaveLength(2);
    expect(res.data[0].priority).toBe("LOW");
  });

  it("id で詳細を取得できる", async () => {
    const ticket = await getTicket("t1");
    expect(ticket?.title).toBe("ログイン不具合");
  });

  it("存在しない id では null を返す", async () => {
    expect(await getTicket("nope")).toBeNull();
  });
});
