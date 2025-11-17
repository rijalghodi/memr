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

export type DropdownFilterProps<T extends string> = {
  value?: T;
  options?: { label: string; value: T }[];
  onValueChange?: (value: T) => void;
  size?: "sm" | "default";
  variant?: "ghost" | "default" | "outline" | "secondary" | "destructive";
  className?: string;
  icon?: React.ReactNode;
};
export function DropdownFilter<T extends string>({
  value,
  options,
  onValueChange,
  size = "default",
  variant = "ghost",
  className,
  icon,
}: DropdownFilterProps<T>) {
  const isMobile = useIsMobile();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={isMobile ? "sm" : size}
          className={className}
        >
          {icon}
          {options?.find((option) => option.value === value)?.label}
          <ChevronDown />
        </Button>
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
