"use client";

import { useRouter, usePathname } from "next/navigation";
import type {
  MRT_PaginationState,
  MRT_SortingState,
  MRT_ColumnFiltersState,
  MRT_Updater,
} from "material-react-table";
import { serializeTicketQuery } from "../lib/ticketQuery";
import type { ListTicketsQuery } from "../api/ticketApi";

/**
 * チケット一覧テーブルの「表示状態 ⇄ URL searchParams」変換を集約する Custom Hook。
 *
 * ねらい（= リファレンスとして示したい設計意図）:
 * - **責務の分離**: テーブルの URL同期ロジックを UI（TicketTable）から切り離す。
 *   TicketTable は「state と handlers を受け取って描画するだけ」に近づく。
 * - **テスト容易性（Vitest）**: このフックは next/navigation をモックすれば
 *   ブラウザ無しで単体テストできる（実ブラウザの Storybook テストに頼らない）。
 * - **Storybook容易性**: ロジックがフックに寄るため、UI 側の Story は表示確認に集中できる。
 */
export function useTicketTableState(query: ListTicketsQuery) {
  const router = useRouter();
  const pathname = usePathname();

  // URL（query）から MRT の表示状態を導出
  const pagination: MRT_PaginationState = {
    pageIndex: (query.page ?? 1) - 1,
    pageSize: query.pageSize ?? 20,
  };
  const sorting: MRT_SortingState = query.sort
    ? [{ id: query.sort, desc: (query.order ?? "desc") === "desc" }]
    : [];
  const columnFilters: MRT_ColumnFiltersState = [
    ...(query.status ? [{ id: "status", value: query.status }] : []),
    ...(query.priority ? [{ id: "priority", value: query.priority }] : []),
  ];

  // 新しい状態を URL に反映 → Server Component が再取得する
  const push = (next: ListTicketsQuery) => {
    const qs = serializeTicketQuery(next);
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const onPaginationChange = (updater: MRT_Updater<MRT_PaginationState>) => {
    const next = updater instanceof Function ? updater(pagination) : updater;
    push({ ...query, page: next.pageIndex + 1, pageSize: next.pageSize });
  };

  const onSortingChange = (updater: MRT_Updater<MRT_SortingState>) => {
    const next = updater instanceof Function ? updater(sorting) : updater;
    const first = next[0];
    push({
      ...query,
      sort: first?.id as ListTicketsQuery["sort"],
      order: first ? (first.desc ? "desc" : "asc") : undefined,
      page: 1,
    });
  };

  const onColumnFiltersChange = (updater: MRT_Updater<MRT_ColumnFiltersState>) => {
    const next = updater instanceof Function ? updater(columnFilters) : updater;
    const status = next.find((f) => f.id === "status")?.value as ListTicketsQuery["status"];
    const priority = next.find((f) => f.id === "priority")?.value as ListTicketsQuery["priority"];
    push({ ...query, status, priority, page: 1 });
  };

  return {
    pagination,
    sorting,
    columnFilters,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
  };
}
