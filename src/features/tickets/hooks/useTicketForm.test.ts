import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTicketForm } from "./useTicketForm";

describe("useTicketForm", () => {
  it("初期状態（未送信＝エラー無し・非送信中・formAction・result=null）を返す", () => {
    const { result } = renderHook(() =>
      useTicketForm(async () => ({ ok: false, error: "x" })),
    );
    expect(result.current.error).toBeUndefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.result).toBeNull();
    expect(typeof result.current.formAction).toBe("function");
  });
});
