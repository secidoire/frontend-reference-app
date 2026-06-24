import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";
import { StatusChart } from "./StatusChart";

const meta = {
  title: "analytics/organisms/StatusChart",
  component: StatusChart,
} satisfies Meta<typeof StatusChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    byStatus: [
      { status: "TODO", count: 3 },
      { status: "IN_PROGRESS", count: 2 },
      { status: "REVIEW", count: 2 },
      { status: "DONE", count: 1 },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step("Given: ステータス別の集計を渡す", async () => {
      await expect(canvasElement).toBeInTheDocument();
    });
    await step("Then: 棒グラフ（Plotly）が描画される", async () => {
      await waitFor(
        () => expect(canvasElement.querySelector(".js-plotly-plot")).toBeTruthy(),
        { timeout: 15000 },
      );
    });
  },
};
