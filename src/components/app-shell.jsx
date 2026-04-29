import { useQueryClient } from '@tanstack/react-query';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowLeftRight, LayoutDashboard, LogOut, Menu, PiggyBank, ReceiptText, Wallet2, X } from 'lucide-react';
import { api } from '../lib/api';
import { useUI } from '../state/ui-context';

const links = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: Wallet2 },
  { to: '/pots', label: 'Pots', icon: PiggyBank },
  { to: '/bills', label: 'Bills', icon: ReceiptText },
];

export function AppShell({ children, user }) {
  const { mobileMenuOpen, setMobileMenuOpen } = useUI();
  const queryClient = useQueryClient();
  const location = useLocation();

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' });
    queryClient.clear();
    window.location.href = '/';
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="app-glow" />
      <header className="sticky top-0 z-50 border-b border-finance-charcoal/10 bg-finance-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 items-center gap-2 px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Link to="/overview" className="flex items-center gap-2.5 shrink-0">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-finance-charcoal text-finance-paper">
              <Wallet2 size={15} strokeWidth={2.2} />
            </span>
            <span className="font-display text-lg font-bold tracking-[-0.03em] text-finance-text">Finance</span>
          </Link>

          <nav className="hidden items-center gap-0.5 ml-2 sm:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-finance-text'
                      : 'text-finance-muted hover:text-finance-text'
                  }`
                }
              >
                {({ isActive }) => {
                  const Icon = link.icon;
                  return (
                    <>
                      <Icon size={16} className={isActive ? 'text-finance-teal' : ''} />
                      <span className="hidden lg:inline">{link.label}</span>
                    </>
                  );
                }}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1" />

          <div className="flex items-center gap-1.5">
            <Avatar user={user} initials={initials} />
            <button
              type="button"
              onClick={logout}
              aria-label="Logout"
              title="Logout"
              className="grid h-8 w-8 place-items-center rounded-lg text-finance-muted transition-colors hover:bg-finance-line hover:text-finance-text"
            >
              <LogOut size={15} />
            </button>
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="grid h-9 w-9 place-items-center rounded-lg text-finance-text sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 sm:hidden">
          <button
            type="button"
            aria-label="Close navigation drawer"
            className="absolute inset-0 bg-finance-charcoal/25"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="absolute inset-x-0 top-14 flex flex-col gap-1 border-b border-finance-line bg-finance-paper px-4 pb-4 pt-3 shadow-sm">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive || location.pathname === link.to
                      ? 'bg-finance-charcoal text-finance-paper'
                      : 'text-finance-text hover:bg-finance-line'
                  }`
                }
              >
                {({ isActive }) => {
                  const Icon = link.icon;
                  return <Icon size={18} className={isActive ? 'text-finance-teal' : ''} />;
                }}
                <span>{link.label}</span>
              </NavLink>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-finance-line pt-3">
              <div className="flex items-center gap-3">
                <Avatar user={user} initials={initials} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-finance-text">{user?.name}</p>
                  <p className="truncate text-xs text-finance-muted">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="grid h-10 w-10 place-items-center rounded-xl text-finance-muted hover:bg-finance-line hover:text-finance-text"
              >
                <LogOut size={18} />
              </button>
            </div>
          </nav>
        </div>
      ) : null}

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">{children}</main>
    </div>
  );
}

function Avatar({ user, initials }) {
  if (user?.picture) {
    return (
      <img
        src={user.picture}
        alt={user.name}
        referrerPolicy="no-referrer"
        className="h-8 w-8 rounded-full border border-finance-line object-cover"
      />
    );
  }

  return (
    <div className="grid h-8 w-8 place-items-center rounded-full bg-finance-charcoal text-[11px] font-medium text-finance-paper">
      {initials}
    </div>
  );
}
