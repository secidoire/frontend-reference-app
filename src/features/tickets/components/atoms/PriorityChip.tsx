import Chip from "@mui/material/Chip";
import type { ChipProps } from "@mui/material/Chip";
import type { TicketPriority } from "@/features/tickets/types";

const CONFIG: Record<TicketPriority, { label: string; color: ChipProps["color"] }> = {
  LOW: { label: "低", color: "default" },
  MEDIUM: { label: "中", color: "primary" },
  HIGH: { label: "高", color: "error" },
};

export type PriorityChipProps = {
  priority: TicketPriority;
};

/** チケットの優先度を色付きChipで表示する atom（ドメイン固有）。 */
export function PriorityChip({ priority }: PriorityChipProps) {
  const { label, color } = CONFIG[priority];
  return <Chip label={label} color={color} size="small" variant="outlined" />;
}
