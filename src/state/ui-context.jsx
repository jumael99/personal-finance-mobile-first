import { createContext, useContext, useMemo, useState } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const value = useMemo(
    () => ({
      mobileMenuOpen,
      setMobileMenuOpen,
    }),
    [mobileMenuOpen],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const value = useContext(UIContext);

  if (!value) {
    throw new Error('useUI must be used inside UIProvider');
  }

  return value;
}
