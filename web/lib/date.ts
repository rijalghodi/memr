import { formatDate as formatDateFn } from "date-fns";

export function formatDate(date: Date, format: string) {
  return formatDateFn(date, format);
}
