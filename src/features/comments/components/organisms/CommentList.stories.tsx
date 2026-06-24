import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { CommentList } from "./CommentList";

const meta = {
  title: "comments/organisms/CommentList",
  component: CommentList,
} satisfies Meta<typeof CommentList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithComments: Story = {
  args: {
    comments: [
      { id: "c1", ticketId: "t1", authorId: "u2", content: "再現しました", createdAt: "2026-01-11T09:00:00.000Z" },
      { id: "c2", ticketId: "t1", authorId: "u1", content: "ありがとうございます", createdAt: "2026-01-11T10:30:00.000Z" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("再現しました")).toBeInTheDocument();
    await expect(canvas.getByText("ありがとうございます")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { comments: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("コメントはありません。")).toBeInTheDocument();
  },
};
