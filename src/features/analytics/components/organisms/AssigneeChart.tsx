import { PlotlyChart } from "../molecules/PlotlyChart";
import type { Analytics } from "../../types";

type AssigneeChartProps = {
  byAssignee: Analytics["byAssignee"];
};

/** 担当者別チケット数（棒グラフ）。 */
export function AssigneeChart({ byAssignee }: AssigneeChartProps) {
  return (
    <PlotlyChart
      data={[
        {
          type: "bar",
          x: byAssignee.map((d) => d.assigneeId),
          y: byAssignee.map((d) => d.count),
          marker: { color: "#7c3aed" },
        },
      ]}
    />
  );
}
