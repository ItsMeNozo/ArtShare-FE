import { Post } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const mappedCategoryPost = (data: Post) => ({
  ...data,
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: string) => {
  const targetDate = new Date(date);
  const today = new Date();

  // Normalize to midnight for accurate date-only comparison
  const target = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const msInDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((now.getTime() - target.getTime()) / msInDay);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  });
};

export const formatDaysAgo = (dateString: string) => {
  const date = new Date(dateString);

  // Check if the date is valid
  if (!date || isNaN(date.getTime())) {
    return 'Unknown time';
  }

  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
};

/**
 * Unified time formatting function that accepts both Date objects and date strings
 * Provides consistent time-ago formatting across the application
 */
export const formatTimeAgo = (
  input: Date | string,
  options?: { shortFormat?: boolean },
) => {
  const date = typeof input === 'string' ? new Date(input) : input;

  // Check if the date is valid
  if (!date || isNaN(date.getTime())) {
    return 'Unknown time';
  }

  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const seconds = Math.floor(diffTime / 1000);
  const minutes = Math.floor(diffTime / (1000 * 60));
  const hours = Math.floor(diffTime / (1000 * 60 * 60));
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const isShort = options?.shortFormat;

  // Handle future dates or very small differences
  if (seconds < 5) return 'just now';
  if (seconds < 60)
    return isShort
      ? `${seconds}s ago`
      : `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

const IS_TEMPORARY_ID_THRESHOLD = 2_000_000_000; // An INT4 max is 2,147,483,647. Date.now() is much larger.

export const isTemporaryCommentId = (id: number): boolean => {
  return id > IS_TEMPORARY_ID_THRESHOLD;
};
