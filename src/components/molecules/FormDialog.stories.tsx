import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, userEvent } from "storybook/test";
import Typography from "@mui/material/Typography";
import { FormDialog } from "./FormDialog";

const meta = {
  title: "shared/molecules/FormDialog",
  component: FormDialog,
} satisfies Meta<typeof FormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  // children は composition で差し込む（props 貫通しない設計）
  args: {
    open: true,
    title: "新規チケット",
    onClose: fn(),
    children: <Typography>ここにフォーム（children）が入る</Typography>,
  },
  play: async ({ args, step }) => {
    await step("Given: open=true で枠が開く", async () => {
      await expect(screen.getByText("新規チケット")).toBeInTheDocument();
      await expect(screen.getByText("ここにフォーム（children）が入る")).toBeInTheDocument();
    });
    await step("When: 閉じるを押す", async () => {
      await userEvent.click(screen.getByRole("button", { name: "閉じる" }));
    });
    await step("Then: onClose が呼ばれる", async () => {
      await expect(args.onClose).toHaveBeenCalled();
    });
  },
};
