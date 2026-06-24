"use client";

import dynamic from "next/dynamic";
import type { Data, Layout } from "plotly.js";

// Plotly は window 依存のため SSR を無効化して動的読み込みする。
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type PlotlyChartProps = {
  data: Data[];
  layout?: Partial<Layout>;
  height?: number;
};

/** Plotly の薄いラッパ（Presentational / molecule, "use client"）。 */
export function PlotlyChart({ data, layout, height = 320 }: PlotlyChartProps) {
  return (
    <Plot
      data={data}
      layout={{ autosize: true, margin: { t: 24, r: 16, b: 40, l: 48 }, ...layout }}
      useResizeHandler
      style={{ width: "100%", height }}
      config={{ displayModeBar: false, responsive: true }}
    />
  );
}
