import { describe, it, expect, vi, beforeEach } from "vitest";

// Server Actions は Next ランタイム依存（revalidatePath / redirect）をモックする
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createTicketAction,
  updateTicketAction,
  deleteTicketAction,
  createTicketFormAction,
} from "./ticketActions";
import { listTickets, getTicket } from "../api/ticketApi";

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
    const fd = new FormData();
    fd.set("title", "フォーム作成");
    fd.set("description", "d");
    fd.set("priority", "HIGH");
    fd.set("assigneeId", "u2");
    await createTicketFormAction({}, fd);
    expect(redirect).toHaveBeenCalledWith(expect.stringMatching(/^\/tickets\/.+/));
  });
});
