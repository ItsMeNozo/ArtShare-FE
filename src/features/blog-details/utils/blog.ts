export const getPlainTextPreview = (
  htmlContent: string,
  maxLength: number = 80,
): string => {
  if (!htmlContent) return '';

  // First, replace block-level HTML elements with newlines before removing tags
  const withLineBreaks = htmlContent
    .replace(/<\/?(h[1-6]|p|div|li|ol|ul|blockquote|br)([^>]*)>/gi, '\n')
    .replace(/<[^>]*>/g, ''); // Remove remaining HTML tags

  // Decode HTML entities
  const decoded = withLineBreaks
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Get the first line by splitting on newlines
  const lines = decoded.split(/\n+/).filter((line) => line.trim().length > 0);
  const firstLine = lines[0] || '';

  // Clean the first line - remove extra whitespace
  const cleaned = firstLine.replace(/\s+/g, ' ').trim();

  // Limit length
  if (cleaned.length <= maxLength) return cleaned;

  // Cut at word boundary
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
};
