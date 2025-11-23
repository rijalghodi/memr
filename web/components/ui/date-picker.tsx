"use client";

import { addDays, addMonths, addWeeks, startOfDay } from "date-fns";
import {
  Calendar as CalendarIcon,
  CalendarPlus,
  Moon,
  Sun,
  Sunrise,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DatePickerProps = {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  children?: (date?: Date) => React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type DatePickerContentProps = {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  onClose?: () => void;
};

export const DatePicker = ({
  date,
  onSelect,
  placeholder = "Pick a date",
  disabled,
  className,
  children,
  open,
  onOpenChange,
}: DatePickerProps) => {
  // Use internal state only when open is not controlled from outside
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Determine if component is controlled
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  // Handle open state changes
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (isControlled) {
        // Controlled: notify parent
        onOpenChange?.(newOpen);
      } else {
        // Uncontrolled: update internal state
        setInternalOpen(newOpen);
      }
    },
    [isControlled, onOpenChange],
  );

  // Close handler for actions that should close the popover
  const handleClose = React.useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {children ? (
          children(date)
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className={cn("font-normal", className)}
            disabled={disabled}
          >
            <CalendarIcon />
            {date ? (
              date.toLocaleDateString()
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DatePickerContent
          date={date}
          onSelect={onSelect}
          onClose={handleClose}
        />
      </PopoverContent>
    </Popover>
  );
};

export const DatePickerContent = ({
  date,
  onSelect,
  onClose,
}: DatePickerContentProps) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date,
  );

  // Sync selectedDate with date prop
  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const handleShortcutClick = (
    shortcut: "today" | "tomorrow" | "nextWeek" | "nextMonth",
  ) => {
    const today = startOfDay(new Date());
    let newDate: Date;

    switch (shortcut) {
      case "today":
        newDate = today;
        break;
      case "tomorrow":
        newDate = addDays(today, 1);
        break;
      case "nextWeek":
        newDate = addWeeks(today, 1);
        break;
      case "nextMonth":
        newDate = addMonths(today, 1);
        break;
    }

    setSelectedDate(newDate);
    onSelect?.(newDate);
    onClose?.();
  };

  const handleClear = () => {
    setSelectedDate(undefined);
    onSelect?.(undefined);
    onClose?.();
  };

  const handleOk = () => {
    onSelect?.(selectedDate);
    onClose?.();
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    setSelectedDate(selectedDate);
  };

  return (
    <>
      <div className="flex items-center justify-between p-2 pb-0">
        <Button
          variant="ghost"
          size="icon"
          title="Today"
          className="flex-1"
          onClick={() => handleShortcutClick("today")}
        >
          <Sun />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Tomorrow"
          className="flex-1"
          onClick={() => handleShortcutClick("tomorrow")}
        >
          <Sunrise />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Next Week"
          className="flex-1"
          onClick={() => handleShortcutClick("nextWeek")}
        >
          <CalendarPlus />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Next Month"
          className="flex-1"
          onClick={() => handleShortcutClick("nextMonth")}
        >
          <Moon />
        </Button>
      </div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleCalendarSelect}
        initialFocus
      />
      <div className="flex items-center justify-between gap-2 p-2 pb-4 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleClear}
        >
          Clear
        </Button>
        <Button size="sm" className="flex-1" onClick={handleOk}>
          OK
        </Button>
      </div>
    </>
  );
};
