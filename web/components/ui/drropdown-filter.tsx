"use client";

import { ChevronDown } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./";
import { Spinner } from "./spinner";

export type DropdownFilterProps = {
  disabled?: boolean;
  loading?: boolean;
  value?: string;
  options?: { label: string | React.ReactNode; value: string }[];
  onValueChange?: (value: string) => void;
  size?: "sm" | "default";
  variant?: "ghost" | "default" | "outline" | "secondary" | "destructive";
  className?: string;
  icon?: React.ReactNode;
  children?: (value: string, label: string | React.ReactNode) => React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  emptyContent?: React.ReactNode;
  placeholder?: string;
};
export function DropdownFilter({
  disabled,
  loading,
  value,
  options,
  onValueChange,
  size = "default",
  variant = "ghost",
  className,
  icon,
  children,
  side = "bottom",
  align = "start",
  emptyContent,
  placeholder,
}: DropdownFilterProps) {
  const isMobile = useIsMobile();

  const selectedOption = options?.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        {children ? (
          children(value ?? "", selectedOption?.label ?? "")
        ) : (
          <Button variant={variant} size={isMobile ? "sm" : size} className={className}>
            {icon}
            {selectedOption ? (
              selectedOption.label
            ) : (
              <span className="text-muted-foreground">{placeholder ?? "Select an option"}</span>
            )}
            <ChevronDown />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44" side={side} align={align}>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Spinner />
          </div>
        ) : !options || options.length === 0 ? (
          <DropdownMenuLabel>{emptyContent ?? "No options"}</DropdownMenuLabel>
        ) : (
          <DropdownMenuRadioGroup value={value} onValueChange={onValueChange as any}>
            {options?.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
