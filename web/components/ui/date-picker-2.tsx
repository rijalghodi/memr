"use client";

import { addDays, addMonths, addWeeks, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, CalendarPlus, Moon, Sun, Sunrise } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DatePickerProps = {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  children?: (date?: Date) => React.ReactNode;
};

export const DatePicker = ({
  date,
  onSelect,
  placeholder = "Pick a date",
  disabled,
  className,
  children,
}: DatePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);

  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const handleShortcutClick = (shortcut: "today" | "tomorrow" | "nextWeek" | "nextMonth") => {
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
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(undefined);
    onSelect?.(undefined);
    setOpen(false);
  };

  const handleOk = () => {
    onSelect?.(selectedDate);
    setOpen(false);
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    setSelectedDate(selectedDate);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        {/* <div className="flex items-center justify-between p-2 pb-0">
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
        </div> */}
        <div className="flex w-full">
          <div className="flex flex-col items-stretch p-2 pb-0 w-full">
            <Button
              variant="ghost"
              size="sm"
              title="Today"
              className="h-11 w-full"
              onClick={() => handleShortcutClick("today")}
            >
              <Sun /> Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Tomorrow"
              className="h-11 w-full"
              onClick={() => handleShortcutClick("tomorrow")}
            >
              <Sunrise /> Tomorrow
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Next Week"
              className="h-11 w-full"
              onClick={() => handleShortcutClick("nextWeek")}
            >
              <CalendarPlus /> Next Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Next Month"
              className="h-11 w-full"
              onClick={() => handleShortcutClick("nextMonth")}
            >
              <Moon /> Next Month
            </Button>
          </div>
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
              initialFocus
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 p-2 pb-4 pt-0">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleClear}>
            Clear
          </Button>
          <Button size="sm" className="flex-1" onClick={handleOk}>
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
