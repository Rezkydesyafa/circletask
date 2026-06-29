import { format, isBefore, startOfDay } from "date-fns";

export function formatDate(value: Date | string, pattern = "dd MMM yyyy") {
  return format(new Date(value), pattern);
}

export function isPastDeadline(deadline: Date | string, now: Date = new Date()) {
  return isBefore(startOfDay(new Date(deadline)), startOfDay(now));
}
