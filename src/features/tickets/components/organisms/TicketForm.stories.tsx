import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { TicketForm } from "./TicketForm";
import type { Ticket } from "../../types";

const existing: Ticket = {
  id: "t1",
  title: "既存チケット",
  description: "説明",
  status: "IN_PROGRESS",
  priority: "HIGH",
  assigneeId: "u2",
  createdAt: "2026-06-25T00:00:00.000Z",
  updatedAt: "2026-06-25T00:00:00.000Z",
};

const meta = {
  title: "tickets/organisms/TicketForm",
  component: TicketForm,
} satisfies Meta<typeof TicketForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// ticket 無し → フォームが「作成」を自分で選ぶ
export const Create: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Given: ticket 無しで表示する", async () => {
      await expect(canvas.getByLabelText(/タイトル/)).toBeInTheDocument();
    });
    await step("Then: 送信ボタンが「作成」になる（mode を自己判定）", async () => {
      await expect(canvas.getByRole("button", { name: "作成" })).toBeInTheDocument();
    });
  },
};

// ticket 有り → フォームが「更新」を自分で選び、初期値をプリフィル
export const Edit: Story = {
  args: { ticket: existing },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Given: ticket を渡して表示する", async () => {
      await expect(canvas.getByDisplayValue("既存チケット")).toBeInTheDocument();
    });
    await step("Then: 送信ボタンが「更新」になる（mode を自己判定）", async () => {
      await expect(canvas.getByRole("button", { name: "更新" })).toBeInTheDocument();
    });
  },
};
