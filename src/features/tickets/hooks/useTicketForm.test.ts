import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTicketForm } from "./useTicketForm";
import type { TicketActionResult } from "../actions/actionResult";

const ticket = {
  id: "t1",
  title: "x",
  description: "",
  status: "TODO",
  priority: "LOW",
  assigneeId: "u1",
  createdAt: "2026-06-25T00:00:00.000Z",
  updatedAt: "2026-06-25T00:00:00.000Z",
} as const;

describe("useTicketForm", () => {
  it("初期状態（未送信＝エラー無し・非送信中・result=null）を返す", () => {
    const { result } = renderHook(() =>
      useTicketForm(async () => ({ ok: false, error: "x" })),
    );
    expect(result.current.error).toBeUndefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.result).toBeNull();
    expect(typeof result.current.formAction).toBe("function");
  });

  it("送信完了で onResult に結果を通知する", async () => {
    const onResult = vi.fn();
    const action = async (): Promise<TicketActionResult> => ({ ok: true, ticket });
    const { result } = renderHook(() => useTicketForm(action, onResult));

    await act(async () => {
      result.current.formAction(new FormData());
    });

    expect(onResult).toHaveBeenCalledWith({ ok: true, ticket });
  });

  it("失敗結果では error を公開する", async () => {
    const action = async (): Promise<TicketActionResult> => ({ ok: false, error: "失敗" });
    const { result } = renderHook(() => useTicketForm(action));

    await act(async () => {
      result.current.formAction(new FormData());
    });

    expect(result.current.error).toBe("失敗");
  });
});
