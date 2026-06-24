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
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Given: 空の作成フォームが表示される", async () => {
      await expect(canvas.getByRole("button", { name: "作成" })).toBeInTheDocument();
    });
    await step("When: タイトルと担当を入力して送信する", async () => {
      await userEvent.type(canvas.getByLabelText(/タイトル/), "新しいチケット");
      await userEvent.type(canvas.getByLabelText(/担当/), "u1");
      await userEvent.click(canvas.getByRole("button", { name: "作成" }));
    });
    await step("Then: Server Action（モック）が呼ばれる", async () => {
      await expect(args.action).toHaveBeenCalled();
    });
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Given: 既存値を渡して編集フォームを表示", async () => {
      await expect(canvas.getByRole("button", { name: "更新" })).toBeInTheDocument();
    });
    await step("Then: 初期値がプリフィルされる", async () => {
      await expect(canvas.getByDisplayValue("既存チケット")).toBeInTheDocument();
    });
  },
};

export const ShowsError: Story = {
  args: { action: fn(async () => ({ error: "作成に失敗しました" })) },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("When: 必須項目を満たして送信する（actionがエラーを返す）", async () => {
      await userEvent.type(canvas.getByLabelText(/タイトル/), "x");
      await userEvent.type(canvas.getByLabelText(/担当/), "u1");
      await userEvent.click(canvas.getByRole("button", { name: "作成" }));
    });
    await step("Then: エラーメッセージが表示される", async () => {
      await expect(await canvas.findByText("作成に失敗しました")).toBeInTheDocument();
    });
  },
};
