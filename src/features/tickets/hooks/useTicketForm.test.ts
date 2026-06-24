import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTicketForm } from "./useTicketForm";

describe("useTicketForm", () => {
  it("初期状態（エラー無し・非送信中・formAction）を返す", () => {
    const { result } = renderHook(() => useTicketForm(async () => ({})));
    expect(result.current.error).toBeUndefined();
    expect(result.current.isPending).toBe(false);
    expect(typeof result.current.formAction).toBe("function");
  });
});
