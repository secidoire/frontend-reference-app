import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { TicketTable } from "./TicketTable";
import type { Ticket } from "../../types";

const rows: Ticket[] = [
  { id: "t1", title: "ログイン不具合", description: "d", status: "TODO", priority: "HIGH", assigneeId: "u1", createdAt: "2026-01-10T00:00:00.000Z", updatedAt: "2026-01-10T00:00:00.000Z" },
  { id: "t2", title: "検索が遅い", description: "d", status: "IN_PROGRESS", priority: "MEDIUM", assigneeId: "u2", createdAt: "2026-01-22T00:00:00.000Z", updatedAt: "2026-01-22T00:00:00.000Z" },
];

const meta = {
  title: "tickets/organisms/TicketTable",
  component: TicketTable,
  args: { rows, rowCount: rows.length, query: {} },
  // useRouter / usePathname（App Router）のコンテキストを有効化
  parameters: { nextjs: { appDirectory: true } },
} satisfies Meta<typeof TicketTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // タイトルが詳細リンクとして描画される
    await expect(canvas.getByRole("link", { name: "ログイン不具合" })).toBeInTheDocument();
    // StatusChip / PriorityChip のラベル
    await expect(canvas.getByText("進行中")).toBeInTheDocument();
    await expect(canvas.getByText("高")).toBeInTheDocument();
  },
};
