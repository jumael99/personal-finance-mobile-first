import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AmbientGrid } from './components/ambient-grid';
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
      <div className="theme-frame flex min-h-screen items-center justify-center px-4">
        <AmbientGrid variant="app" />
        <div className="app-glow">
          <span />
        </div>
        <div className="gradient-shell relative z-10">
          <div className="glass-card px-6 py-5 text-center">
            <p className="font-display text-2xl tracking-[-0.025em] text-finance-text">finance</p>
            <p className="mt-2 text-sm text-finance-muted">Checking your session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-frame">
      <AppRoutes authenticated={auth.data?.authenticated} user={auth.data?.user} />
    </div>
  );
}

function AppRoutes({ authenticated, user }) {
  const location = useLocation();
  const isLanding = location.pathname === '/' && !authenticated;

  return (
    <>
      <AmbientGrid variant={isLanding ? 'landing' : 'app'} />
      <Routes>
        <Route path="/" element={authenticated ? <Navigate to="/overview" replace /> : <LandingPage />} />
        <Route element={<ProtectedLayout authenticated={authenticated} user={user} />}>
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/pots" element={<PotsPage />} />
          <Route path="/bills" element={<BillsPage />} />
        </Route>
        <Route path="*" element={<Navigate to={authenticated ? '/overview' : '/'} replace />} />
      </Routes>
    </>
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
