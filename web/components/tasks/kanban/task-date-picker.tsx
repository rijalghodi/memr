import { formatDate } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";

type Props = {
  value?: Date;
  onChange?: (value?: Date) => void;
  disabled?: boolean;
  className?: string;
};

export function TaskDatePicker({
  value,
  onChange,
  disabled,
  className,
}: Props) {
  return (
    <DatePicker
      date={value}
      onSelect={(date) => onChange?.(date)}
      disabled={disabled}
      className={className}
    >
      {(date) => (
        <Button variant="ghost" size="sm-compact">
          {date ? (
            <span className="text-primary">
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
