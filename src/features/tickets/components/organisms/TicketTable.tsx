"use client";

import { useMemo } from "react";
import Link from "@mui/material/Link";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { StatusChip } from "../atoms/StatusChip";
import { PriorityChip } from "../atoms/PriorityChip";
import { formatDate } from "@/lib/date";
import { useTicketTableState } from "../../hooks/useTicketTableState";
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
 * ページング・ソート・フィルタの状態と URL 同期は {@link useTicketTableState} に委譲し、
 * ここは「列定義」と「MRT への配線」だけに責務を絞っている。
 */
export function TicketTable({ rows, rowCount, query }: TicketTableProps) {
  const { pagination, sorting, columnFilters, onPaginationChange, onSortingChange, onColumnFiltersChange } =
    useTicketTableState(query);

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
