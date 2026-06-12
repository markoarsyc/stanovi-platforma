const DEFAULT_LOCALE = 'sr-RS';

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

export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' },
  locale: string = DEFAULT_LOCALE,
): string => new Date(date).toLocaleDateString(locale, options);
