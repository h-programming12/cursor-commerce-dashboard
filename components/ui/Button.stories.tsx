import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof Button> = {
  title: "Shared/UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "outline"],
      description: "버튼 스타일 변형",
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
      description: "버튼 크기",
    },
    pill: {
      control: "boolean",
      description: "둥근 모서리 적용 여부",
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
    isLoading: {
      control: "boolean",
      description: "로딩 상태",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
    onClick: {
      action: "clicked",
      description: "클릭 이벤트 핸들러",
    },
    children: {
      control: "text",
      description: "버튼 텍스트",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
    onClick: action("clicked"),
  },
};

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Button",
    onClick: action("clicked"),
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline Button",
    onClick: action("clicked"),
  },
};

export const Small: Story = {
  args: {
    size: "small",
    children: "Small Button",
    onClick: action("clicked"),
  },
};

export const Medium: Story = {
  args: {
    size: "medium",
    children: "Medium Button",
    onClick: action("clicked"),
  },
};

export const Large: Story = {
  args: {
    size: "large",
    children: "Large Button",
    onClick: action("clicked"),
  },
};

export const Pill: Story = {
  args: {
    pill: true,
    children: "Pill Button",
    onClick: action("clicked"),
  },
};

export const WithIconLeft: Story = {
  args: {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 3.33333V12.6667M3.33333 8H12.6667"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    iconPosition: "left",
    children: "With Icon Left",
    onClick: action("clicked"),
  },
};

export const WithIconRight: Story = {
  args: {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 4L10 8L6 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    iconPosition: "right",
    children: "With Icon Right",
    onClick: action("clicked"),
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    children: "Loading Button",
    onClick: action("clicked"),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled Button",
    onClick: action("clicked"),
  },
};
