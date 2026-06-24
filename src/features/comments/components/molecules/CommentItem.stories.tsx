import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { CommentItem } from "./CommentItem";

const meta = {
  title: "comments/molecules/CommentItem",
  component: CommentItem,
} satisfies Meta<typeof CommentItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    comment: {
      id: "c1",
      ticketId: "t1",
      authorId: "u2",
      content: "再現しました。対応します。",
      createdAt: "2026-01-11T09:00:00.000Z",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("再現しました。対応します。")).toBeInTheDocument();
    await expect(canvas.getByText("u2")).toBeInTheDocument();
    await expect(canvas.getByText("2026/01/11")).toBeInTheDocument();
  },
};
