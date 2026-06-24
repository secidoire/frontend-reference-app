import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";
import { AssigneeChart } from "./AssigneeChart";

const meta = {
  title: "analytics/organisms/AssigneeChart",
  component: AssigneeChart,
} satisfies Meta<typeof AssigneeChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    byAssignee: [
      { assigneeId: "u1", count: 4 },
      { assigneeId: "u2", count: 3 },
      { assigneeId: "u3", count: 2 },
    ],
  },
  play: async ({ canvasElement, step }) => {
    await step("Given: 担当者別の集計を渡す", async () => {
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
