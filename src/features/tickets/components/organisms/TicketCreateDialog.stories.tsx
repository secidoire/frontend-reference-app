import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";
import { TicketCreateDialog } from "./TicketCreateDialog";

const meta = {
  title: "tickets/organisms/TicketCreateDialog",
  component: TicketCreateDialog,
} satisfies Meta<typeof TicketCreateDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpensAndCloses: Story = {
  play: async ({ step }) => {
    await step("Given: 新規作成ボタンが表示される", async () => {
      await expect(screen.getByRole("button", { name: "新規作成" })).toBeInTheDocument();
    });
    await step("When: 新規作成を押す", async () => {
      await userEvent.click(screen.getByRole("button", { name: "新規作成" }));
    });
    await step("Then: ダイアログにフォームが開く", async () => {
      await expect(await screen.findByText("新規チケット")).toBeInTheDocument();
      await expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument();
    });
    await step("When: 閉じるを押す", async () => {
      await userEvent.click(screen.getByRole("button", { name: "閉じる" }));
    });
    await step("Then: ダイアログが閉じる", async () => {
      await waitFor(() => expect(screen.queryByText("新規チケット")).not.toBeInTheDocument());
    });
  },
};
