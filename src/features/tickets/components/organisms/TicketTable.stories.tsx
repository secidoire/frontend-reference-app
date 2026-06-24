import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Given: 2件のチケットでテーブルを表示", async () => {
      await expect(canvasElement).toBeInTheDocument();
    });
    await step("Then: タイトルが詳細リンクとして描画される", async () => {
      await expect(canvas.getByRole("link", { name: "ログイン不具合" })).toBeInTheDocument();
    });
    await step("Then: StatusChip / PriorityChip が描画される", async () => {
      await expect(canvas.getByText("進行中")).toBeInTheDocument();
      await expect(canvas.getByText("高")).toBeInTheDocument();
    });
  },
};

/** ソート/ページング操作で URL同期ハンドラ（manual mode）が動くことを確認。 */
export const Interactions: Story = {
  args: { rowCount: 50 }, // 次ページを有効化
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Given: 一覧テーブルが表示される", async () => {
      await expect(canvas.getByRole("link", { name: "ログイン不具合" })).toBeInTheDocument();
    });
    await step("When: ステータス列ヘッダでソートする", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /ステータス/ }));
    });
    await step("When: 次ページへ移動する", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /next page/i }));
    });
    await step("Then: テーブルは表示を維持する", async () => {
      await expect(canvas.getByRole("link", { name: "ログイン不具合" })).toBeInTheDocument();
    });
  },
};
