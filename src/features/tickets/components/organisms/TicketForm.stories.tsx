import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { TicketForm } from "./TicketForm";
import { makeTicket } from "../../test/makeTicket";

// フィクスチャは手書きせずファクトリから（差分だけ指定）。型変更に1か所で追従する。
const existing = makeTicket({ title: "既存チケット" });

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
