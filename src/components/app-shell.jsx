import { useQueryClient } from '@tanstack/react-query';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowLeftRight, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Menu, PiggyBank, ReceiptText, Wallet2, X } from 'lucide-react';
import { api } from '../lib/api';
import { usePeriod } from '../state/period-context';
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
  const { month, year, goToCurrentMonth, shiftMonth } = usePeriod();

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

  const periodLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="app-glow">
        <span />
      </div>
      <div className="relative z-10 mx-auto max-w-[1240px] px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <header className="sticky top-4 z-50 lg:top-[30px]">
          <div className="gradient-shell mx-auto">
            <div className="glass mx-auto flex min-h-16 items-center justify-between gap-3 rounded-[2px] px-4 py-3 text-finance-text lg:w-fit lg:gap-3 lg:px-5">
              <Link to="/overview" className="flex items-center gap-3 rounded-[2px] pr-1">
                <span className="surface-inverse grid h-10 w-10 place-items-center rounded-[2px] text-finance-charcoal">
                  <Wallet2 size={18} strokeWidth={2.2} />
                </span>
                <span className="font-display text-[22px] font-light leading-none tracking-[-0.025em] text-finance-text">Finance</span>
              </Link>
              <button
                type="button"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                className="touch-target interactive surface-muted inline-flex items-center justify-center rounded-[2px] lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <nav className="hidden items-center gap-2 lg:flex">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `nav-chip gap-2 ${
                        isActive
                          ? 'nav-chip-active surface-inverse text-finance-text'
                          : 'text-finance-muted hover:bg-finance-peach hover:text-finance-text'
                      }`
                    }
                  >
                    {({ isActive }) => {
                      const Icon = link.icon;

                      return (
                        <>
                          <Icon size={16} className={isActive ? 'text-finance-red' : 'text-finance-muted'} />
                          <span>{link.label}</span>
                        </>
                      );
                    }}
                  </NavLink>
                ))}
                <div className="surface-muted ml-2 flex items-center gap-1.5 rounded-[2px] px-2.5 py-2.5">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => shiftMonth(-1)}
                    className="touch-target interactive surface-muted inline-flex items-center justify-center rounded-[2px] text-finance-text hover:bg-finance-peach hover:text-finance-text"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={goToCurrentMonth}
                    className="interactive rounded-[2px] px-3.5 py-2.5 text-left hover:bg-finance-peach"
                  >
                    <p className="panel-label">Active Period</p>
                    <p className="mt-1 font-display text-base font-light leading-5 tracking-[-0.025em] text-finance-text">{periodLabel}</p>
                  </button>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => shiftMonth(1)}
                    className="touch-target interactive surface-muted inline-flex items-center justify-center rounded-[2px] text-finance-text hover:bg-finance-peach hover:text-finance-text"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="surface-muted ml-3 flex items-center gap-3 rounded-[2px] px-3 py-2.5">
                  <Avatar user={user} initials={initials} />
                  <div className="min-w-0 text-left">
                    <p className="truncate text-xs font-medium leading-none text-finance-text">{user?.name}</p>
                    <p className="mt-1 truncate text-[11px] leading-none text-finance-muted">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="touch-target interactive surface-muted inline-flex items-center gap-2 rounded-[2px] px-4 py-2.5 text-sm font-medium text-finance-text hover:bg-finance-peach hover:text-finance-text"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </header>

        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation drawer"
              className="absolute inset-0 bg-finance-charcoal/12 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="gradient-shell absolute inset-x-4 top-[5.5rem]">
              <div className="glass flex flex-col gap-3.5 rounded-[2px] p-4 text-finance-text">
                <div className="surface-muted flex items-center justify-between gap-2 rounded-[2px] px-3 py-3.5">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => shiftMonth(-1)}
                    className="touch-target interactive surface-muted inline-flex items-center justify-center rounded-[2px]"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button type="button" onClick={goToCurrentMonth} className="interactive min-w-0 flex-1 rounded-[2px] px-3 py-1.5 text-center">
                    <p className="panel-label">Active Period</p>
                    <p className="mt-1 font-display text-lg font-light leading-6 tracking-[-0.025em] text-finance-text">{periodLabel}</p>
                  </button>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => shiftMonth(1)}
                    className="touch-target interactive surface-muted inline-flex items-center justify-center rounded-[2px]"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `touch-target interactive flex items-center gap-3 rounded-[2px] px-4 py-3 text-base font-medium uppercase tracking-[0.08em] ${
                        isActive || location.pathname === link.to
                          ? 'surface-inverse text-finance-text'
                          : 'text-finance-muted hover:bg-finance-peach hover:text-finance-text'
                      }`
                    }
                  >
                    {({ isActive }) => {
                      const Icon = link.icon;

                      return (
                        <>
                          <Icon size={18} className={isActive ? 'text-finance-red' : 'text-finance-muted'} />
                          <span>{link.label}</span>
                        </>
                      );
                    }}
                  </NavLink>
                ))}
                <div className="surface-muted mt-1 flex items-center gap-3 rounded-[2px] px-4 py-3.5">
                  <Avatar user={user} initials={initials} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-finance-text">{user?.name}</p>
                    <p className="mt-1 truncate text-xs text-finance-muted">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="touch-target interactive surface-muted inline-flex items-center gap-2 rounded-[2px] px-4 py-3 text-left text-base font-medium hover:bg-finance-peach hover:text-finance-text"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <main className="pt-6 lg:pt-10">{children}</main>
      </div>
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
        className="h-10 w-10 rounded-[2px] border border-finance-line bg-finance-paper object-cover"
      />
    );
  }

  return (
    <div className="surface-muted grid h-10 w-10 place-items-center rounded-[2px] text-xs font-semibold text-finance-text">
      {initials}
    </div>
  );
}
