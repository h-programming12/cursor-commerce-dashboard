import React from "react";
import { cn } from "@/commons/utils/cn";
import { commerceColors, adminColors } from "@/commons/constants/color";
import {
  commerceTypography,
  adminTypography,
} from "@/commons/constants/typography";
import { Button } from "./button";

interface SearchIconProps {
  size?: number;
}

const SearchIcon: React.FC<SearchIconProps> = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onSubmit"> {
  variant?: "commerce" | "admin";
  onSearch?: (value: string) => void;
  searchButtonText?: string;
  showSearchButton?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      variant = "commerce",
      onSearch,
      searchButtonText = "Search",
      showSearchButton = true,
      className,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const [searchValue, setSearchValue] = React.useState(
      (props.value as string) || (props.defaultValue as string) || ""
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        onSearch(searchValue);
      }
      onKeyDown?.(e);
    };

    const handleSearchClick = () => {
      if (onSearch) {
        onSearch(searchValue);
      }
    };

    if (variant === "commerce") {
      return (
        <div
          className={cn(
            "flex items-center gap-4 rounded-2xl border transition-colors focus-within:ring-2 focus-within:ring-offset-2",
            className
          )}
          style={{
            height: "72px",
            paddingLeft: "24px",
            paddingRight: showSearchButton ? "16px" : "24px",
            backgroundColor: commerceColors.background.paper,
            borderColor: commerceColors.neutral["03"]["100"],
            borderRadius: "16px",
          }}
        >
          <div className="flex items-center text-[#99A1AF]">
            <SearchIcon size={24} />
          </div>
          <input
            ref={ref}
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-0 outline-none focus:outline-none"
            style={{
              fontSize: `${commerceTypography.body["2"].fontSize}px`,
              lineHeight: `${commerceTypography.body["2"].lineHeight}px`,
              fontFamily: commerceTypography.body["2"].fontFamily,
              fontWeight: commerceTypography.body["2"].fontWeight,
              color: commerceColors.text.primary,
            }}
            placeholder={props.placeholder || "Search for products..."}
            aria-label="Search"
            {...props}
          />
          {showSearchButton && (
            <Button
              size="small"
              pill
              onClick={handleSearchClick}
              aria-label="Search"
            >
              {searchButtonText}
            </Button>
          )}
        </div>
      );
    }

    // Admin variant
    return (
      <div
        className={cn(
          "relative flex items-center rounded transition-colors focus-within:ring-2 focus-within:ring-offset-2",
          className
        )}
        style={{
          height: "40px",
          paddingLeft: "12px",
          paddingRight: "12px",
          backgroundColor: adminColors.background.default,
          borderRadius: "4px",
        }}
      >
        <input
          ref={ref}
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-0 outline-none focus:outline-none pr-2"
          style={{
            fontSize: `${adminTypography.semantic.button.medium.fontSize}px`,
            lineHeight: `${adminTypography.semantic.button.medium.lineHeight}px`,
            fontFamily: adminTypography.semantic.button.medium.fontFamily,
            fontWeight: adminTypography.semantic.button.medium.fontWeight,
            color: adminColors.text.primary,
          }}
          placeholder={props.placeholder || "Search by order id"}
          aria-label="Search"
          {...props}
        />
        <div className="flex items-center text-[#8B909A]">
          <SearchIcon size={18} />
        </div>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
