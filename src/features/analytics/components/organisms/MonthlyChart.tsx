import { PlotlyChart } from "../molecules/PlotlyChart";
import type { Analytics } from "../../types";

type MonthlyChartProps = {
  monthly: Analytics["monthlyCreated"];
};

/** 月次作成数の推移（折れ線）。 */
export function MonthlyChart({ monthly }: MonthlyChartProps) {
  return (
    <PlotlyChart
      data={[
        {
          type: "scatter",
          mode: "lines+markers",
          x: monthly.map((d) => d.month),
          y: monthly.map((d) => d.count),
          line: { color: "#2563eb" },
        },
      ]}
    />
  );
}
