import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";
import { TicketEditDialog } from "./TicketEditDialog";
import type { Ticket } from "../../types";

const ticket: Ticket = {
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
  title: "tickets/organisms/TicketEditDialog",
  component: TicketEditDialog,
  args: { ticket },
} satisfies Meta<typeof TicketEditDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpensAndCloses: Story = {
  play: async ({ step }) => {
    await step("Given: 編集ボタンが表示される", async () => {
      await expect(screen.getByRole("button", { name: "編集" })).toBeInTheDocument();
    });
    await step("When: 編集を押す", async () => {
      await userEvent.click(screen.getByRole("button", { name: "編集" }));
    });
    await step("Then: 編集ダイアログが開き、既存値がプリフィルされる（mode=編集）", async () => {
      await expect(await screen.findByText("チケット編集")).toBeInTheDocument();
      await expect(screen.getByDisplayValue("既存チケット")).toBeInTheDocument();
      await expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
    });
    await step("When: 閉じるを押す", async () => {
      await userEvent.click(screen.getByRole("button", { name: "閉じる" }));
    });
    await step("Then: ダイアログが閉じる", async () => {
      await waitFor(() => expect(screen.queryByText("チケット編集")).not.toBeInTheDocument());
    });
  },
};
