import { describe, it, expect, vi, beforeEach } from "vitest";

// Server Actions は Next ランタイム依存（revalidatePath）をモックする
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { revalidatePath } from "next/cache";
import {
  createTicketAction,
  updateTicketAction,
  deleteTicketAction,
  createTicketInlineAction,
  updateTicketInlineAction,
} from "./ticketActions";
import type { TicketActionResult } from "./actionResult";
import { listTickets, getTicket } from "../api/ticketApi";

function ticketForm(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ticketActions（core）", () => {
  it("createTicketAction は作成し /tickets を revalidate する", async () => {
    const created = await createTicketAction({
      title: "新規",
      description: "d",
      priority: "LOW",
      assigneeId: "u1",
    });
    expect(created.id).toBeTruthy();
    expect(created.status).toBe("TODO"); // 既定
    expect(revalidatePath).toHaveBeenCalledWith("/tickets");
    expect((await listTickets()).total).toBe(7);
  });

  it("updateTicketAction は更新する", async () => {
    const updated = await updateTicketAction("t1", { status: "DONE" });
    expect(updated.status).toBe("DONE");
    expect(revalidatePath).toHaveBeenCalledWith("/tickets/t1");
  });

  it("deleteTicketAction は削除する", async () => {
    await deleteTicketAction("t2");
    expect(await getTicket("t2")).toBeNull();
  });

  it("updateTicketAction はAPIエラーで例外を投げる", async () => {
    server.use(http.patch("*/api/tickets/:id", () => new HttpResponse(null, { status: 500 })));
    await expect(updateTicketAction("t1", { status: "DONE" })).rejects.toThrow();
  });

  it("deleteTicketAction はAPIエラーで例外を投げる", async () => {
    server.use(
      http.delete("*/api/tickets/:id", () =>
        HttpResponse.json({ message: "err" }, { status: 500 }),
      ),
    );
    await expect(deleteTicketAction("t1")).rejects.toThrow();
  });
});

/** 結果からエラー文言を取り出す（ok 判別で型を絞る）。 */
function errorOf(result: TicketActionResult): string | undefined {
  return result.ok ? undefined : result.error;
}

describe("createTicketInlineAction（作成フォーム用）", () => {
  it("成功時は ok と作成された ticket を返す", async () => {
    const fd = ticketForm({ title: "ダイアログ作成", description: "d", priority: "LOW", assigneeId: "u1" });
    const result = await createTicketInlineAction(null, fd);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.ticket.title).toBe("ダイアログ作成");
  });

  it("タイトル未入力は error 結果を返す", async () => {
    const result = await createTicketInlineAction(null, ticketForm({ priority: "LOW", assigneeId: "u1" }));
    expect(errorOf(result)).toBeTruthy();
  });

  it("優先度が不正なら error 結果を返す", async () => {
    const result = await createTicketInlineAction(null, ticketForm({ title: "x", priority: "URGENT", assigneeId: "u1" }));
    expect(errorOf(result)).toBeTruthy();
  });

  it("API がエラーなら error 結果を返す", async () => {
    server.use(http.post("*/api/tickets", () => new HttpResponse(null, { status: 500 })));
    const fd = ticketForm({ title: "x", description: "d", priority: "LOW", assigneeId: "u1" });
    const result = await createTicketInlineAction(null, fd);
    expect(errorOf(result)).toBeTruthy();
  });
});

describe("updateTicketInlineAction（編集フォーム用）", () => {
  it("成功時は ok と更新された ticket を返す", async () => {
    const fd = ticketForm({ title: "更新後", description: "d", priority: "MEDIUM", assigneeId: "u1", status: "DONE" });
    const result = await updateTicketInlineAction("t1", null, fd);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.ticket.title).toBe("更新後");
      expect(result.ticket.status).toBe("DONE");
    }
  });

  it("タイトル未入力は error 結果を返す", async () => {
    const result = await updateTicketInlineAction("t1", null, ticketForm({ priority: "LOW", assigneeId: "u1" }));
    expect(errorOf(result)).toBeTruthy();
  });

  it("API がエラーなら error 結果を返す", async () => {
    server.use(http.patch("*/api/tickets/:id", () => new HttpResponse(null, { status: 500 })));
    const fd = ticketForm({ title: "x", description: "d", priority: "LOW", assigneeId: "u1" });
    const result = await updateTicketInlineAction("t1", null, fd);
    expect(errorOf(result)).toBeTruthy();
  });
});
