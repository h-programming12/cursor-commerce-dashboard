import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from "./search-input";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof SearchInput> = {
  title: "Shared/UI/SearchInput",
  component: SearchInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["commerce", "admin"],
      description: "검색 입력 필드 스타일 변형",
    },
    placeholder: {
      control: "text",
      description: "플레이스홀더 텍스트",
    },
    showSearchButton: {
      control: "boolean",
      description: "검색 버튼 표시 여부",
    },
    searchButtonText: {
      control: "text",
      description: "검색 버튼 텍스트",
    },
    onSearch: {
      action: "searched",
      description: "검색 이벤트 핸들러",
    },
    onChange: {
      action: "changed",
      description: "변경 이벤트 핸들러",
    },
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {
    placeholder: "Search for products...",
    onSearch: action("searched"),
    onChange: action("changed"),
  },
};

export const Commerce: Story = {
  args: {
    variant: "commerce",
    placeholder: "Search for products...",
    showSearchButton: true,
    searchButtonText: "Search",
    onSearch: action("searched"),
    onChange: action("changed"),
  },
};

export const CommerceWithoutButton: Story = {
  args: {
    variant: "commerce",
    placeholder: "Search for products...",
    showSearchButton: false,
    onSearch: action("searched"),
    onChange: action("changed"),
  },
};

export const Admin: Story = {
  args: {
    variant: "admin",
    placeholder: "Search by order id",
    onSearch: action("searched"),
    onChange: action("changed"),
  },
};

export const WithValue: Story = {
  args: {
    variant: "commerce",
    defaultValue: "laptop",
    placeholder: "Search for products...",
    onSearch: action("searched"),
    onChange: action("changed"),
  },
};

export const WithCustomButtonText: Story = {
  args: {
    variant: "commerce",
    placeholder: "Search for products...",
    showSearchButton: true,
    searchButtonText: "Find",
    onSearch: action("searched"),
    onChange: action("changed"),
  },
};
