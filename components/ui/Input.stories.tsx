import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof Input> = {
  title: "Shared/UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["commerce", "admin"],
      description: "입력 필드 스타일 변형",
    },
    error: {
      control: "boolean",
      description: "에러 상태",
    },
    helperText: {
      control: "text",
      description: "도움말 텍스트",
    },
    label: {
      control: "text",
      description: "라벨 텍스트",
    },
    icon: {
      control: false,
      description: "아이콘 요소",
    },
    iconPosition: {
      control: "select",
      options: ["left", "right"],
      description: "아이콘 위치",
    },
    placeholder: {
      control: "text",
      description: "플레이스홀더 텍스트",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
    onChange: {
      action: "changed",
      description: "변경 이벤트 핸들러",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
    onChange: action("changed"),
  },
};

export const Commerce: Story = {
  args: {
    variant: "commerce",
    placeholder: "Commerce input",
    onChange: action("changed"),
  },
};

export const Admin: Story = {
  args: {
    variant: "admin",
    placeholder: "Admin input",
    onChange: action("changed"),
  },
};

export const WithLabel: Story = {
  args: {
    label: "Email",
    placeholder: "Enter your email",
    onChange: action("changed"),
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Password",
    placeholder: "Enter your password",
    helperText: "Must be at least 8 characters",
    onChange: action("changed"),
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    placeholder: "Enter your email",
    error: true,
    helperText: "Invalid email address",
    onChange: action("changed"),
  },
};

export const WithIconLeft: Story = {
  args: {
    label: "Search",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 14L11.1 11.1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    iconPosition: "left",
    placeholder: "Search...",
    onChange: action("changed"),
  },
};

export const WithIconRight: Story = {
  args: {
    label: "Password",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 10.6667V8M8 5.33333H8.00667M12 8C12 10.2091 10.2091 12 8 12C5.79086 12 4 10.2091 4 8C4 5.79086 5.79086 4 8 4C10.2091 4 12 5.79086 12 8Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    iconPosition: "right",
    placeholder: "Enter password",
    onChange: action("changed"),
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Input",
    placeholder: "Cannot type here",
    disabled: true,
    onChange: action("changed"),
  },
};
