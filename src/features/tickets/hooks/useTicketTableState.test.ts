import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

// next/navigation をモックすれば、このフックは実ブラウザ無しで単体テストできる。
const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/tickets",
}));

import { useTicketTableState } from "./useTicketTableState";

describe("useTicketTableState", () => {
  it("query から MRT の表示状態を導出する", () => {
    const { result } = renderHook(() =>
      useTicketTableState({ page: 2, sort: "status", order: "asc", status: "DONE" }),
    );
    expect(result.current.pagination).toEqual({ pageIndex: 1, pageSize: 20 });
    expect(result.current.sorting).toEqual([{ id: "status", desc: false }]);
    expect(result.current.columnFilters).toContainEqual({ id: "status", value: "DONE" });
  });

  it("ソート変更で URL を更新する（page=1 にリセット）", () => {
    const { result } = renderHook(() => useTicketTableState({ page: 3 }));
    act(() => result.current.onSortingChange([{ id: "priority", desc: false }]));
    expect(replace).toHaveBeenCalledWith("/tickets?sort=priority&order=asc", { scroll: false });
  });

  it("ページ変更で URL を更新する", () => {
    const { result } = renderHook(() => useTicketTableState({}));
    act(() => result.current.onPaginationChange({ pageIndex: 2, pageSize: 20 }));
    expect(replace).toHaveBeenCalledWith("/tickets?page=3", { scroll: false });
  });

  it("フィルタ変更で URL を更新する", () => {
    const { result } = renderHook(() => useTicketTableState({}));
    act(() => result.current.onColumnFiltersChange([{ id: "status", value: "TODO" }]));
    expect(replace).toHaveBeenCalledWith("/tickets?status=TODO", { scroll: false });
  });

  it("フィルタを空にすると URL からも消える", () => {
    const { result } = renderHook(() => useTicketTableState({ status: "TODO" }));
    act(() => result.current.onColumnFiltersChange([]));
    expect(replace).toHaveBeenCalledWith("/tickets", { scroll: false });
  });
});
