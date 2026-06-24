import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { PriorityChip } from "./PriorityChip";

const meta = {
  title: "tickets/atoms/PriorityChip",
  component: PriorityChip,
  args: { priority: "MEDIUM" },
} satisfies Meta<typeof PriorityChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const High: Story = {
  args: { priority: "HIGH" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("高")).toBeInTheDocument();
  },
};

export const Medium: Story = {
  args: { priority: "MEDIUM" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("中")).toBeInTheDocument();
  },
};

export const Low: Story = {
  args: { priority: "LOW" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("低")).toBeInTheDocument();
  },
};
