const DEFAULT_LOCALE = 'sr-RS';

export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' },
  locale: string = DEFAULT_LOCALE,
): string => new Date(date).toLocaleDateString(locale, options);

export const formatPrice = (
  amount: number | string,
  currency: 'EUR' | 'RSD' = 'EUR',
  locale: string = DEFAULT_LOCALE,
): string => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '';
  const symbol = currency === 'EUR' ? '€' : 'RSD';
  return `${symbol}${value.toLocaleString(locale)}`;
};

// UTC ISO -> local YYYY-MM-DD (for <input type="date">)
export const toInputDate = (isoString: string | Date): string => {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// local YYYY-MM-DD -> UTC midnight ISO
export const fromInputDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)).toISOString();
};

// Today as YYYY-MM-DD (for <input type="date" min>)
export const todayInputDate = (): string =>
  new Date().toISOString().split('T')[0];
