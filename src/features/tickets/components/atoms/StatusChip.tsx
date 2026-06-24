import Chip from "@mui/material/Chip";
import type { ChipProps } from "@mui/material/Chip";
import type { TicketStatus } from "@/features/tickets/types";

const CONFIG: Record<TicketStatus, { label: string; color: ChipProps["color"] }> = {
  TODO: { label: "未着手", color: "default" },
  IN_PROGRESS: { label: "進行中", color: "info" },
  REVIEW: { label: "レビュー", color: "warning" },
  DONE: { label: "完了", color: "success" },
};

export type StatusChipProps = {
  status: TicketStatus;
};

/** チケットのステータスを色付きChipで表示する atom（ドメイン固有）。 */
export function StatusChip({ status }: StatusChipProps) {
  const { label, color } = CONFIG[status];
  return <Chip label={label} color={color} size="small" />;
}
