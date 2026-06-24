import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { TicketDetailTemplate } from "./TicketDetailTemplate";
import type { Ticket } from "../../types";

const ticket: Ticket = {
  id: "t1",
  title: "ログイン不具合",
  description: "狭幅でフォームが崩れる",
  status: "REVIEW",
  priority: "HIGH",
  assigneeId: "u1",
  createdAt: "2026-01-10T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
};

const meta = {
  title: "tickets/templates/TicketDetailTemplate",
  component: TicketDetailTemplate,
  parameters: { nextjs: { appDirectory: true } },
} satisfies Meta<typeof TicketDetailTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithComments: Story = {
  args: {
    ticket,
    comments: [
      { id: "c1", ticketId: "t1", authorId: "u2", content: "再現しました", createdAt: "2026-01-11T09:00:00.000Z" },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Given: チケットとコメントを渡して詳細を表示", async () => {
      await expect(canvas.getByRole("heading", { name: "ログイン不具合" })).toBeInTheDocument();
    });
    await step("Then: ステータス/優先度と編集ボタンが表示される", async () => {
      await expect(canvas.getByText("レビュー")).toBeInTheDocument();
      await expect(canvas.getByText("編集")).toBeInTheDocument();
    });
    await step("Then: コメントが表示される", async () => {
      await expect(canvas.getByText("再現しました")).toBeInTheDocument();
    });
  },
};

export const NoComments: Story = {
  args: { ticket, comments: [] },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Then: コメントが無い旨が表示される", async () => {
      await expect(canvas.getByText("コメントはありません。")).toBeInTheDocument();
    });
  },
};
