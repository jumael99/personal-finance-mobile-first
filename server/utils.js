export function normalizeBillStatus(bill) {
  if (bill.status === 'paid') {
    return 'paid';
  }

  const dueDate = new Date(bill.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dueDate < today) {
    return 'missed';
  }

  return 'upcoming';
}

export function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function resolvePeriod(query = {}) {
  const now = new Date();
  const month = Math.min(Math.max(parseNumber(query.month, now.getMonth() + 1), 1), 12);
  const year = Math.max(parseNumber(query.year, now.getFullYear()), 2000);

  return { month, year };
}

export function monthDateRange(month, year) {
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 0, 23, 59, 59, 999),
  };
}

export function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}
