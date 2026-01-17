import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "Shared/UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "new", "discount", "sale"],
      description: "배지 스타일 변형",
    },
    children: {
      control: "text",
      description: "배지 텍스트",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Badge",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: "Success",
  },
};

export const New: Story = {
  args: {
    variant: "new",
    children: "New",
  },
};

export const Discount: Story = {
  args: {
    variant: "discount",
    children: "-20%",
  },
};

export const Sale: Story = {
  args: {
    variant: "sale",
    children: "Sale",
  },
};
