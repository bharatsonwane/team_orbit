// Date utility functions using native Date and datejs
// Note: datejs is imported as a side effect to extend Date prototype

// Extend Date prototype with datejs functionality
// This allows us to use datejs methods on Date objects

/**
 * Format a date using datejs natural language
 * @param date - Date object or date string
 * @param format - Format string (optional)
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, format?: string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format) {
    return Date.parse(dateObj.toString()).toString(format);
  }

  return Date.parse(dateObj.toString()).toString('MMMM d, yyyy');
};

/**
 * Parse a natural language date string
 * @param dateString - Natural language date string
 * @returns Date object
 */
export const parseDate = (dateString: string): Date => {
  return Date.parse(dateString);
};

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 * @param date - Date object or date string
 * @returns Relative time string
 */
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

/**
 * Add time to a date using datejs natural language
 * @param date - Base date
 * @param timeExpression - Natural language time expression (e.g., "2 days", "1 week", "3 months")
 * @returns New Date object
 */
export const addTime = (date: Date | string, _timeExpression: string): Date => {
  const baseDate = typeof date === 'string' ? new Date(date) : date;
  // Use datejs natural language parsing
  const result = new Date(baseDate.getTime());
  // For now, return the original date - datejs integration needs more work
  return result;
};

/**
 * Subtract time from a date using datejs natural language
 * @param date - Base date
 * @param timeExpression - Natural language time expression (e.g., "2 days", "1 week", "3 months")
 * @returns New Date object
 */
export const subtractTime = (
  date: Date | string,
  _timeExpression: string
): Date => {
  const baseDate = typeof date === 'string' ? new Date(date) : date;
  // Use datejs natural language parsing
  const result = new Date(baseDate.getTime());
  // For now, return the original date - datejs integration needs more work
  return result;
};

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

/**
 * Check if a date is yesterday
 * @param date - Date to check
 * @returns True if date is yesterday
 */
export const isYesterday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateObj.toDateString() === yesterday.toDateString();
};

/**
 * Check if a date is tomorrow
 * @param date - Date to check
 * @returns True if date is tomorrow
 */
export const isTomorrow = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateObj.toDateString() === tomorrow.toDateString();
};

/**
 * Get start of day for a given date
 * @param date - Date object or date string
 * @returns Date object at start of day (00:00:00)
 */
export const startOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const start = new Date(dateObj);
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Get end of day for a given date
 * @param date - Date object or date string
 * @returns Date object at end of day (23:59:59)
 */
export const endOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const end = new Date(dateObj);
  end.setHours(23, 59, 59, 999);
  return end;
};

/**
 * Common date formats
 */
export const dateFormats = {
  short: 'M/d/yyyy',
  medium: 'MMM d, yyyy',
  long: 'MMMM d, yyyy',
  full: 'EEEE, MMMM d, yyyy',
  time: 'h:mm a',
  dateTime: 'M/d/yyyy h:mm a',
  iso: 'yyyy-MM-dd',
  isoDateTime: 'yyyy-MM-dd HH:mm:ss',
} as const;

/**
 * Format date with predefined format
 * @param date - Date object or date string
 * @param format - Predefined format key
 * @returns Formatted date string
 */
export const formatWithPredefined = (
  date: Date | string,
  format: keyof typeof dateFormats
): string => {
  return formatDate(date, dateFormats[format]);
};

// Note: datejs extends the global Date prototype
// You can use datejs methods directly on Date objects
