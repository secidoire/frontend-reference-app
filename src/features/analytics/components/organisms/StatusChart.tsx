import { PlotlyChart } from "../molecules/PlotlyChart";
import type { Analytics } from "../../types";
import type { TicketStatus } from "@/features/tickets/types";

const LABEL: Record<TicketStatus, string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  REVIEW: "レビュー",
  DONE: "完了",
};

type StatusChartProps = {
  byStatus: Analytics["byStatus"];
};

/** ステータス別チケット数（棒グラフ）。トレース生成はサーバで行う。 */
export function StatusChart({ byStatus }: StatusChartProps) {
  return (
    <PlotlyChart
      data={[
        {
          type: "bar",
          x: byStatus.map((d) => LABEL[d.status]),
          y: byStatus.map((d) => d.count),
          marker: { color: "#2563eb" },
        },
      ]}
    />
  );
}
