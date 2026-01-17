import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from "./pagination";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof Pagination> = {
  title: "Shared/UI/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    currentPage: {
      control: { type: "number", min: 1 },
      description: "현재 페이지 번호",
    },
    totalPages: {
      control: { type: "number", min: 1 },
      description: "전체 페이지 수",
    },
    maxVisiblePages: {
      control: { type: "number", min: 3, max: 10 },
      description: "최대 표시 페이지 수",
    },
    onPageChange: {
      action: "pageChanged",
      description: "페이지 변경 이벤트 핸들러",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: action("pageChanged"),
  },
};

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: action("pageChanged"),
  },
};

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    onPageChange: action("pageChanged"),
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    onPageChange: action("pageChanged"),
  },
};

export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 3,
    onPageChange: action("pageChanged"),
  },
};

export const ManyPages: Story = {
  args: {
    currentPage: 50,
    totalPages: 100,
    onPageChange: action("pageChanged"),
  },
};

export const Interactive: Story = {
  render: (args) => {
    const InteractivePagination = () => {
      const [currentPage, setCurrentPage] = useState(args.currentPage || 1);
      return (
        <Pagination
          {...args}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            action("pageChanged")(page);
          }}
        />
      );
    };
    return <InteractivePagination />;
  },
  args: {
    currentPage: 1,
    totalPages: 10,
  },
};
