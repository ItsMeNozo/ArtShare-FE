export function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 50);
}

export const toTitleCase = (str: string | undefined): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatCount = (count: number | undefined): string => {
  if (count === undefined || count === null) return '0';
  if (count < 1000) return count.toString();
  if (count < 1000000) {
    const thousands = count / 1000;
    return (
      (Math.floor(thousands * 10) / 10).toString().replace(/\.0$/, '') + 'k'
    );
  }
  const millions = count / 1000000;
  return (Math.floor(millions * 10) / 10).toString().replace(/\.0$/, '') + 'M';
};
