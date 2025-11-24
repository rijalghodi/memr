import { formatDate as formatDateFn, isThisYear, isToday, isTomorrow, isYesterday } from "date-fns";

export function formatDate(date: Date, format?: string, options?: { includeTime?: boolean }) {
  // Use custom format if provided
  if (format) return formatDateFn(date, format);

  // Use 12-hour format with AM/PM when including time
  const timeFormat = "hh:mm a";

  if (isToday(date)) {
    return options?.includeTime ? formatDateFn(date, timeFormat) : "Today";
  }
  if (isYesterday(date)) {
    return options?.includeTime ? `Yesterday, ${formatDateFn(date, timeFormat)}` : "Yesterday";
  }
  if (isTomorrow(date)) {
    return options?.includeTime ? `Tomorrow, ${formatDateFn(date, timeFormat)}` : "Tomorrow";
  }
  if (isThisYear(date)) {
    return formatDateFn(date, "MMM dd");
  }
  return formatDateFn(date, "MMM dd, yyyy");
}
