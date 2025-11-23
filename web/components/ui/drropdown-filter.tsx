"use client";

import { ChevronDown } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./";

export type DropdownFilterProps = {
  value?: string;
  options?: { label: string | React.ReactNode; value: string }[];
  onValueChange?: (value: string) => void;
  size?: "sm" | "default";
  variant?: "ghost" | "default" | "outline" | "secondary" | "destructive";
  className?: string;
  icon?: React.ReactNode;
  children?: (
    value: string,
    label: string | React.ReactNode,
  ) => React.ReactNode;
};
export function DropdownFilter({
  value,
  options,
  onValueChange,
  size = "default",
  variant = "ghost",
  className,
  icon,
  children,
}: DropdownFilterProps) {
  const isMobile = useIsMobile();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ? (
          children(
            value ?? "",
            options?.find((option) => option.value === value)?.label ?? "",
          )
        ) : (
          <Button
            variant={variant}
            size={isMobile ? "sm" : size}
            className={className}
          >
            {icon}
            {options?.find((option) => option.value === value)?.label}
            <ChevronDown />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={onValueChange as any}
        >
          {options?.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
