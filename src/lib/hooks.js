import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import { usePeriod } from '../state/period-context';

export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api('/auth/me'),
    retry: false,
  });
}

export function useOverview() {
  const { month, year } = usePeriod();

  return useQuery({
    queryKey: ['overview', month, year],
    queryFn: () => api(`/overview?${new URLSearchParams({ month: String(month), year: String(year) }).toString()}`),
  });
}

export function useTransactions(params) {
  const { month, year } = usePeriod();
  const searchParams = new URLSearchParams(
    Object.entries({ ...params, month, year }).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {}),
  );

  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => api(`/transactions?${searchParams.toString()}`),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api('/categories'),
  });
}

export function useBudgets() {
  const { month, year } = usePeriod();

  return useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => api(`/budgets?${new URLSearchParams({ month: String(month), year: String(year) }).toString()}`),
  });
}

export function usePots() {
  return useQuery({
    queryKey: ['pots'],
    queryFn: () => api('/pots'),
  });
}

export function useBills(params = {}) {
  const { month, year } = usePeriod();
  const searchParams = new URLSearchParams(
    Object.entries({ ...params, month, year }).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {}),
  );

  return useQuery({
    queryKey: ['bills', params],
    queryFn: () => api(`/bills?${searchParams.toString()}`),
  });
}
