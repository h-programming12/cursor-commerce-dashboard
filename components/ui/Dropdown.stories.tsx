import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from "./dropdown";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof Dropdown> = {
  title: "Shared/UI/Dropdown",
  component: Dropdown,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    options: {
      control: "object",
      description: "드롭다운 옵션 목록",
    },
    value: {
      control: "text",
      description: "선택된 값",
    },
    placeholder: {
      control: "text",
      description: "플레이스홀더 텍스트",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
    error: {
      control: "boolean",
      description: "에러 상태",
    },
    onValueChange: {
      action: "valueChanged",
      description: "값 변경 이벤트 핸들러",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

const defaultOptions = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
  { value: "option4", label: "Option 4" },
  { value: "option5", label: "Option 5" },
];

export const Default: Story = {
  args: {
    options: defaultOptions,
    placeholder: "Select an option",
    onValueChange: action("valueChanged"),
  },
};

export const WithValue: Story = {
  args: {
    options: defaultOptions,
    value: "option2",
    onValueChange: action("valueChanged"),
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    options: defaultOptions,
    placeholder: "Choose an option...",
    onValueChange: action("valueChanged"),
  },
};

export const WithManyOptions: Story = {
  args: {
    options: Array.from({ length: 20 }, (_, i) => ({
      value: `option${i + 1}`,
      label: `Option ${i + 1}`,
    })),
    placeholder: "Select an option",
    onValueChange: action("valueChanged"),
  },
};

export const Disabled: Story = {
  args: {
    options: defaultOptions,
    placeholder: "Select an option",
    disabled: true,
    onValueChange: action("valueChanged"),
  },
};

export const WithError: Story = {
  args: {
    options: defaultOptions,
    placeholder: "Select an option",
    error: true,
    onValueChange: action("valueChanged"),
  },
};
