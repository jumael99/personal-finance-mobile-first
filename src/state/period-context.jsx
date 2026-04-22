import { createContext, useContext, useMemo, useState } from 'react';

const PeriodContext = createContext(null);

function currentPeriod() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export function PeriodProvider({ children }) {
  const [period, setPeriod] = useState(currentPeriod);

  const value = useMemo(
    () => ({
      month: period.month,
      year: period.year,
      setPeriod,
      goToCurrentMonth: () => setPeriod(currentPeriod()),
      shiftMonth: (delta) =>
        setPeriod((current) => {
          const nextDate = new Date(current.year, current.month - 1 + delta, 1);
          return {
            month: nextDate.getMonth() + 1,
            year: nextDate.getFullYear(),
          };
        }),
    }),
    [period.month, period.year],
  );

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
}

export function usePeriod() {
  const value = useContext(PeriodContext);

  if (!value) {
    throw new Error('usePeriod must be used inside PeriodProvider');
  }

  return value;
}
