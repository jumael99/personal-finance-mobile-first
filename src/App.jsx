import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/app-shell';
import { useAuth } from './lib/hooks';
import { OverviewPage } from './pages/overview-page';
import { TransactionsPage } from './pages/transactions-page';
import { BudgetsPage } from './pages/budgets-page';
import { PotsPage } from './pages/pots-page';
import { BillsPage } from './pages/bills-page';
import { LandingPage } from './pages/landing-page';

export default function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-finance-cream px-4">
        <div className="rounded-2xl border border-finance-line bg-finance-paper px-6 py-5 text-center shadow-sm">
          <p className="font-display text-2xl font-bold tracking-[-0.03em] text-finance-text">finance</p>
          <p className="mt-2 text-sm text-finance-muted">Checking your session...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={auth.data?.authenticated ? <Navigate to="/overview" replace /> : <LandingPage />} />
      <Route element={<ProtectedLayout authenticated={auth.data?.authenticated} user={auth.data?.user} />}>
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/pots" element={<PotsPage />} />
        <Route path="/bills" element={<BillsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={auth.data?.authenticated ? '/overview' : '/'} replace />} />
    </Routes>
  );
}

function ProtectedLayout({ authenticated, user }) {
  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppShell user={user}>
      <Outlet />
    </AppShell>
  );
}
