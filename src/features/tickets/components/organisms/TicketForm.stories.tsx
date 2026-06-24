import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { TicketForm } from "./TicketForm";

const meta = {
  title: "tickets/organisms/TicketForm",
  component: TicketForm,
  args: { action: fn(async () => ({})), submitLabel: "作成" },
} satisfies Meta<typeof TicketForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/タイトル/), "新しいチケット");
    await userEvent.type(canvas.getByLabelText(/担当/), "u1");
    await userEvent.click(canvas.getByRole("button", { name: "作成" }));
    // 送信で Server Action（ここではモック）が呼ばれることを確認
    await expect(args.action).toHaveBeenCalled();
  },
};

export const Edit: Story = {
  args: {
    submitLabel: "更新",
    defaultValues: {
      title: "既存チケット",
      description: "説明",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: "u2",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByDisplayValue("既存チケット")).toBeInTheDocument();
  },
};

export const ShowsError: Story = {
  args: { action: fn(async () => ({ error: "作成に失敗しました" })) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 必須項目を満たして送信（ネイティブ検証を通す）→ action がエラーを返す
    await userEvent.type(canvas.getByLabelText(/タイトル/), "x");
    await userEvent.type(canvas.getByLabelText(/担当/), "u1");
    await userEvent.click(canvas.getByRole("button", { name: "作成" }));
    await expect(await canvas.findByText("作成に失敗しました")).toBeInTheDocument();
  },
};
