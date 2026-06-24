import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";
import { MonthlyChart } from "./MonthlyChart";

const meta = {
  title: "analytics/organisms/MonthlyChart",
  component: MonthlyChart,
} satisfies Meta<typeof MonthlyChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    monthly: [
      { month: "2026-01", count: 2 },
      { month: "2026-02", count: 2 },
      { month: "2026-03", count: 2 },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step("Given: 月次作成数の集計を渡す", async () => {
      await expect(canvasElement).toBeInTheDocument();
    });
    await step("Then: 折れ線グラフ（Plotly）が描画される", async () => {
      await waitFor(
        () => expect(canvasElement.querySelector(".js-plotly-plot")).toBeTruthy(),
        { timeout: 15000 },
      );
    });
  },
};
