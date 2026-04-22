import { format } from 'date-fns';

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function formatShortDate(value) {
  return format(new Date(value), 'dd MMM yyyy');
}

export function formatCompactDate(value) {
  return format(new Date(value), 'dd MMM');
}

export function amountTone(value) {
  return value < 0 ? 'text-finance-red' : 'text-finance-teal';
}
