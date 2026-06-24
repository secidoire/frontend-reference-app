import { describe, it, expect, vi, beforeEach } from "vitest";

// Server Actions は Next ランタイム依存（revalidatePath / redirect）をモックする
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createTicketAction,
  updateTicketAction,
  deleteTicketAction,
  createTicketFormAction,
  updateTicketFormAction,
} from "./ticketActions";
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

describe("createTicketFormAction（form-bound）", () => {
  it("タイトル未入力は state.error を返す", async () => {
    const fd = new FormData();
    fd.set("priority", "LOW");
    fd.set("assigneeId", "u1");
    const result = await createTicketFormAction({}, fd);
    expect(result.error).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("成功時は作成後に詳細へ redirect する", async () => {
    const fd = ticketForm({ title: "フォーム作成", description: "d", priority: "HIGH", assigneeId: "u2" });
    await createTicketFormAction({}, fd);
    expect(redirect).toHaveBeenCalledWith(expect.stringMatching(/^\/tickets\/.+/));
  });

  it("優先度が不正なら state.error を返す", async () => {
    const fd = ticketForm({ title: "x", priority: "URGENT", assigneeId: "u1" });
    const result = await createTicketFormAction({}, fd);
    expect(result.error).toBeTruthy();
  });

  it("API がエラーなら state.error を返し redirect しない", async () => {
    server.use(http.post("*/api/tickets", () => new HttpResponse(null, { status: 500 })));
    const fd = ticketForm({ title: "x", description: "d", priority: "LOW", assigneeId: "u1" });
    const result = await createTicketFormAction({}, fd);
    expect(result.error).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("updateTicketFormAction（form-bound）", () => {
  it("成功時は詳細へ redirect する", async () => {
    const fd = ticketForm({ title: "更新後", description: "d", priority: "MEDIUM", assigneeId: "u1", status: "DONE" });
    await updateTicketFormAction("t1", {}, fd);
    expect(redirect).toHaveBeenCalledWith("/tickets/t1");
  });

  it("タイトル未入力は state.error を返す", async () => {
    const fd = ticketForm({ priority: "LOW", assigneeId: "u1" });
    const result = await updateTicketFormAction("t1", {}, fd);
    expect(result.error).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("API がエラーなら state.error を返す", async () => {
    server.use(http.patch("*/api/tickets/:id", () => new HttpResponse(null, { status: 500 })));
    const fd = ticketForm({ title: "x", description: "d", priority: "LOW", assigneeId: "u1" });
    const result = await updateTicketFormAction("t1", {}, fd);
    expect(result.error).toBeTruthy();
  });
});
