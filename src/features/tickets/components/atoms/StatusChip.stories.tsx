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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("進行中")).toBeInTheDocument();
  },
};

export const Done: Story = {
  args: { status: "DONE" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("完了")).toBeInTheDocument();
  },
};

export const Todo: Story = {
  args: { status: "TODO" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("未着手")).toBeInTheDocument();
  },
};
