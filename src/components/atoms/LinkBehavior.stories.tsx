import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { LinkBehavior } from "./LinkBehavior";

const meta = {
  title: "shared/atoms/LinkBehavior",
  component: LinkBehavior,
  parameters: { nextjs: { appDirectory: true } },
} satisfies Meta<typeof LinkBehavior>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHref: Story = {
  render: () => <LinkBehavior href="/tickets">一覧へ</LinkBehavior>,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Then: href付きでアンカーが描画される", async () => {
      await expect(canvas.getByRole("link", { name: "一覧へ" })).toBeInTheDocument();
    });
  },
};

export const WithoutHref: Story = {
  render: () => <LinkBehavior>href無し</LinkBehavior>,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Then: href未指定（空hrefにフォールバック）でも描画される", async () => {
      await expect(canvas.getByText("href無し")).toBeInTheDocument();
    });
  },
};
