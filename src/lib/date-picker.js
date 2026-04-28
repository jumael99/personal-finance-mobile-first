import { format, parse, isValid } from 'date-fns';

/**
 * Convert a YYYY-MM-DD string to a Date object.
 * Returns undefined if the string is empty or invalid so react-day-picker
 * shows no selection (consistent with the existing empty-string initial state).
 */
export function dateStringToDate(str) {
  if (!str) return undefined;
  const parsed = parse(str, 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : undefined;
}

/**
 * Convert a Date object (or undefined) back to YYYY-MM-DD string.
 * Returns empty string when undefined so form state stays a string.
 */
export function dateToDateString(date) {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format a YYYY-MM-DD string for display in the trigger button.
 * e.g. "2025-03-15" → "15 Mar 2025"
 */
export function formatDateDisplay(str) {
  const d = dateStringToDate(str);
  return d ? format(d, 'dd MMM yyyy') : 'Pick a date';
}
