import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/commons/utils/cn";
import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = "Select an option",
  onValueChange,
  className,
  disabled = false,
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onValueChange?.(optionValue);
    setIsOpen(false);
  };

  const ChevronDownIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{
          height: "40px",
          paddingLeft: "12px",
          paddingRight: "12px",
          borderRadius: "6px",
          backgroundColor: adminColors.background.default,
          border: error
            ? `1px solid ${adminColors.semantic.error}`
            : `1px solid ${disabled ? "#E9E7FD" : adminColors.text.tertiary}`,
          color: selectedOption
            ? adminColors.text.primary
            : adminColors.text.stormGray || "#8B909A",
          fontSize: `${adminTypography.semantic.button.medium.fontSize}px`,
          lineHeight: `${adminTypography.semantic.button.medium.lineHeight}px`,
          fontFamily: adminTypography.semantic.button.medium.fontFamily,
          fontWeight: adminTypography.semantic.button.medium.fontWeight,
          letterSpacing: "0.43px",
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={selectedOption?.label || placeholder}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
          role="listbox"
          style={{
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                "w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors",
                selectedValue === option.value && "bg-gray-50"
              )}
              role="option"
              aria-selected={selectedValue === option.value}
              style={{
                fontSize: `${adminTypography.semantic.button.medium.fontSize}px`,
                lineHeight: `${adminTypography.semantic.button.medium.lineHeight}px`,
                fontFamily: adminTypography.semantic.button.medium.fontFamily,
                fontWeight: adminTypography.semantic.button.medium.fontWeight,
                color:
                  selectedValue === option.value
                    ? adminColors.text.primary
                    : adminColors.text.stormGray || "#8B909A",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
