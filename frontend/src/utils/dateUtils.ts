import { format, differenceInCalendarDays, parseISO } from 'date-fns';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy HH:mm');
}

export function countNights(checkIn: Date | string, checkOut: Date | string): number {
  const ci = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
  const co = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;
  return Math.max(0, differenceInCalendarDays(co, ci));
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
