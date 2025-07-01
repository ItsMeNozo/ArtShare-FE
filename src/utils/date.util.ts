import { format, isValid, parseISO } from 'date-fns';

/**
 * Safely formats a date value using date-fns.
 * Handles strings, Date objects, null, and undefined values.
 *
 * @param dateValue The date to format.
 * @param fallback A string to return if the date is invalid or null.
 * @returns The formatted date string (e.g., "10/27/2023") or the fallback string.
 */
export const formatDate = (
  dateValue: string | Date | null | undefined,
  fallback: string = 'N/A',
): string => {
  if (!dateValue) {
    return fallback;
  }

  // `parseISO` is specifically designed for the common "YYYY-MM-DDTHH:mm:ss.sssZ" format.
  // If `dateValue` is already a Date object, it's handled correctly.
  const date = dateValue instanceof Date ? dateValue : parseISO(dateValue);

  // `isValid` checks if the resulting date object is valid.
  if (!isValid(date)) {
    return fallback;
  }

  // `format` takes the date object and a format string. 'P' is a locale-aware "short date".
  // For more formats, see: https://date-fns.org/v2/docs/format
  return format(date, 'P'); // e.g., "10/27/2023"
};

/**
 * A similar function for date and time.
 */
export const formatDateTime = (
  dateValue: string | Date | null | undefined,
  fallback: string = 'N/A',
): string => {
  if (!dateValue) return fallback;

  const date = dateValue instanceof Date ? dateValue : parseISO(dateValue);

  if (!isValid(date)) return fallback;

  // Example format: "Oct 27, 2023, 9:30 AM"
  return format(date, 'MMM d, yyyy, h:mm a');
};
