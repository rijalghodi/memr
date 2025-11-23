import { formatDate } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";

type Props = {
  isOverdue?: (date: Date) => boolean;
  value?: Date;
  onChange?: (value?: Date) => void;
  disabled?: boolean;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function TaskDatePicker({
  isOverdue,
  value,
  onChange,
  disabled,
  className,
  open,
  onOpenChange,
}: Props) {
  return (
    <DatePicker
      date={value}
      onSelect={(date) => onChange?.(date)}
      disabled={disabled}
      className={className}
      open={open}
      onOpenChange={onOpenChange}
    >
      {(date) => (
        <Button variant="ghost" size="sm-compact">
          {date ? (
            <span
              data-overdue={isOverdue?.(date)}
              className="text-primary data-[overdue=true]:text-destructive font-normal"
            >
              {formatDate(date, "MMM d, yyyy")}
            </span>
          ) : (
            <CalendarIcon />
          )}
        </Button>
      )}
    </DatePicker>
  );
}
