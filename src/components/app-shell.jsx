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
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-[30px]">
        <header className="sticky top-4 z-50 lg:top-[30px]">
          <div className="mx-auto flex min-h-16 items-center justify-between gap-3 rounded-[22px] border border-finance-charcoal bg-finance-charcoal px-4 py-3 text-finance-paper shadow-sm lg:w-fit lg:gap-3 lg:px-5">
            <Link to="/overview" className="flex items-center gap-3 rounded-2xl pr-1">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-finance-paper text-finance-charcoal shadow-sm">
                <Wallet2 size={18} strokeWidth={2.2} />
              </span>
              <span className="font-display text-[22px] font-bold leading-none tracking-[-0.05em] text-finance-paper">Finance</span>
            </Link>
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="touch-target interactive inline-flex items-center justify-center rounded-xl border border-finance-paper/15 bg-finance-paper/10 lg:hidden"
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
                        ? 'nav-chip-active bg-finance-paper text-finance-text shadow-sm'
                        : 'text-finance-paper/76 hover:bg-finance-paper/10 hover:text-finance-paper'
                    }`
                  }
                >
                  {({ isActive }) => {
                    const Icon = link.icon;

                    return (
                      <>
                        <Icon size={16} className={isActive ? 'text-finance-teal' : 'text-[#9c9ba1]'} />
                        <span>{link.label}</span>
                      </>
                    );
                  }}
                </NavLink>
              ))}
              <div className="ml-3 flex items-center gap-3 rounded-2xl border border-finance-paper/12 bg-finance-paper/8 px-3 py-2.5">
                <Avatar user={user} initials={initials} />
                <div className="min-w-0 text-left">
                  <p className="truncate text-xs font-medium leading-none text-finance-paper">{user?.name}</p>
                  <p className="mt-1 truncate text-[11px] leading-none text-finance-paper/65">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="touch-target interactive inline-flex items-center gap-2 rounded-2xl border border-finance-paper/14 bg-finance-paper/10 px-4 py-2.5 text-sm font-medium text-finance-paper hover:bg-finance-paper hover:text-finance-text"
              >
                <LogOut size={16} />
                Logout
              </button>
            </nav>
          </div>
        </header>

        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation drawer"
              className="absolute inset-0 bg-finance-charcoal/35"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute inset-x-4 top-[5.5rem] flex flex-col gap-3.5 rounded-[24px] border border-finance-charcoal bg-finance-charcoal p-4 text-finance-paper shadow-sm">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `touch-target interactive flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium ${
                      isActive || location.pathname === link.to
                        ? 'bg-finance-paper text-finance-text'
                        : 'text-finance-paper/80 hover:bg-finance-paper/10 hover:text-finance-paper'
                    }`
                  }
                >
                  {({ isActive }) => {
                    const Icon = link.icon;

                    return (
                      <>
                        <Icon size={18} className={isActive ? 'text-finance-teal' : 'text-[#9c9ba1]'} />
                        <span>{link.label}</span>
                      </>
                    );
                  }}
                </NavLink>
              ))}
              <div className="mt-1 flex items-center gap-3 rounded-2xl border border-finance-paper/12 bg-finance-paper/8 px-4 py-3.5">
                <Avatar user={user} initials={initials} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user?.name}</p>
                  <p className="mt-1 truncate text-xs text-finance-paper/70">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="touch-target interactive inline-flex items-center gap-2 rounded-2xl border border-finance-paper/14 bg-finance-paper/10 px-4 py-3 text-left text-base font-medium hover:bg-finance-paper hover:text-finance-text"
              >
                <LogOut size={18} />
                Logout
              </button>
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
        className="h-10 w-10 rounded-2xl border border-finance-paper/15 bg-finance-paper/10 object-cover shadow-sm"
      />
    );
  }

  return (
    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-finance-paper/15 bg-finance-paper/12 text-xs font-semibold text-finance-paper shadow-sm">
      {initials}
    </div>
  );
}
