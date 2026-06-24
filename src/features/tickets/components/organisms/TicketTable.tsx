"use client";

import { useMemo } from "react";
import Link from "@mui/material/Link";
import { useRouter, usePathname } from "next/navigation";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_SortingState,
  type MRT_ColumnFiltersState,
  type MRT_Updater,
} from "material-react-table";
import { StatusChip } from "../atoms/StatusChip";
import { PriorityChip } from "../atoms/PriorityChip";
import { formatDate } from "@/lib/date";
import { serializeTicketQuery } from "../../lib/ticketQuery";
import type { ListTicketsQuery } from "../../api/ticketApi";
import type { Ticket, TicketStatus, TicketPriority } from "../../types";

type TicketTableProps = {
  rows: Ticket[];
  rowCount: number;
  query: ListTicketsQuery;
};

const STATUS_OPTIONS = [
  { label: "未着手", value: "TODO" },
  { label: "進行中", value: "IN_PROGRESS" },
  { label: "レビュー", value: "REVIEW" },
  { label: "完了", value: "DONE" },
];
const PRIORITY_OPTIONS = [
  { label: "低", value: "LOW" },
  { label: "中", value: "MEDIUM" },
  { label: "高", value: "HIGH" },
];

/**
 * チケット一覧テーブル（Presentational / "use client"）。
 * MRT を manual モードで使い、ページング・ソート・フィルタの状態は **URL を正** とする。
 * 状態変更で URL を書き換え → Server Component（TicketListPage）が再取得する。
 */
export function TicketTable({ rows, rowCount, query }: TicketTableProps) {
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

  const columns = useMemo<MRT_ColumnDef<Ticket>[]>(
    () => [
      {
        accessorKey: "title",
        header: "タイトル",
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row, cell }) => (
          <Link href={`/tickets/${row.original.id}`} underline="hover">
            {cell.getValue<string>()}
          </Link>
        ),
      },
      {
        accessorKey: "status",
        header: "ステータス",
        filterVariant: "select",
        filterSelectOptions: STATUS_OPTIONS,
        Cell: ({ cell }) => <StatusChip status={cell.getValue<TicketStatus>()} />,
      },
      {
        accessorKey: "priority",
        header: "優先度",
        filterVariant: "select",
        filterSelectOptions: PRIORITY_OPTIONS,
        Cell: ({ cell }) => <PriorityChip priority={cell.getValue<TicketPriority>()} />,
      },
      { accessorKey: "assigneeId", header: "担当", enableSorting: false, enableColumnFilter: false },
      {
        accessorKey: "createdAt",
        header: "作成日",
        enableColumnFilter: false,
        Cell: ({ cell }) => formatDate(cell.getValue<string>()),
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: rows,
    rowCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableGlobalFilter: false,
    enableColumnFilterModes: false,
    state: { pagination, sorting, columnFilters },
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    initialState: { showColumnFilters: true },
    muiTablePaperProps: { variant: "outlined" },
  });

  return <MaterialReactTable table={table} />;
}
