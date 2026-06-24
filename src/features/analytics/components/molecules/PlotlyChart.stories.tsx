import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";
import { PlotlyChart } from "./PlotlyChart";

const meta = {
  title: "analytics/molecules/PlotlyChart",
  component: PlotlyChart,
} satisfies Meta<typeof PlotlyChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bar: Story = {
  args: {
    data: [{ type: "bar", x: ["A", "B", "C"], y: [3, 1, 2] }],
  },
  play: async ({ canvasElement, step }) => {
    await step("Given: 棒グラフのトレースを渡す", async () => {
      await expect(canvasElement).toBeInTheDocument();
    });
    await step("Then: Plotly のプロットが描画される", async () => {
      await waitFor(
        () => expect(canvasElement.querySelector(".js-plotly-plot")).toBeTruthy(),
        { timeout: 15000 },
      );
    });
  },
};
