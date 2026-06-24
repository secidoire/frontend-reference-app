import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { StatusChip } from "./StatusChip";

const meta = {
  title: "tickets/atoms/StatusChip",
  component: StatusChip,
  args: { status: "IN_PROGRESS" },
} satisfies Meta<typeof StatusChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {
  args: { status: "IN_PROGRESS" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Given: status=IN_PROGRESS の StatusChip を表示", async () => {
      await expect(canvasElement).toBeInTheDocument();
    });
    await step("Then: ラベル「進行中」が表示される", async () => {
      await expect(canvas.getByText("進行中")).toBeInTheDocument();
    });
  },
};

export const Done: Story = {
  args: { status: "DONE" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Given: status=DONE の StatusChip を表示", async () => {
      await expect(canvasElement).toBeInTheDocument();
    });
    await step("Then: ラベル「完了」が表示される", async () => {
      await expect(canvas.getByText("完了")).toBeInTheDocument();
    });
  },
};

export const Todo: Story = {
  args: { status: "TODO" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Then: ラベル「未着手」が表示される", async () => {
      await expect(canvas.getByText("未着手")).toBeInTheDocument();
    });
  },
};
