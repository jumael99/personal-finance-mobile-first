import { ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Live cash flow clarity',
    body: 'Track balances, spending, budgets, pots, and recurring bills in one place with responsive finance views.',
  },
  {
    icon: ShieldCheck,
    title: 'Private Google sign-in',
    body: 'Use your Google account to unlock a private finance workspace tied only to your own account.',
  },
  {
    icon: Sparkles,
    title: 'Purposeful planning',
    body: 'Move from vague money habits to concrete budgets, savings goals, and upcoming bill visibility.',
  },
];

const quotes = [
  'A budget is telling your money where to go instead of wondering where it went.',
  'Small financial decisions, repeated consistently, are what change the long-term graph.',
];

export function LandingPage() {
  const authError = new URLSearchParams(window.location.search).get('authError');

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-finance-charcoal bg-finance-charcoal px-6 py-8 text-finance-paper shadow-sm sm:px-8 sm:py-10">
          <p className="inline-flex rounded-full border border-finance-paper/15 px-3 py-1 text-xs uppercase tracking-[0.2em] text-finance-paper/70">
            Personal Finance Dashboard
          </p>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
            See every dollar with less friction and better decisions.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-finance-paper/75 sm:text-lg">
            A focused finance workspace for transactions, budgets, pots, and recurring bills, gated behind Google login and styled to feel calm instead of noisy.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/api/auth/google/start"
              className="touch-target interactive inline-flex items-center justify-center rounded-2xl bg-finance-paper px-6 py-4 text-base font-medium text-finance-charcoal"
            >
              Continue with Google
            </a>
            <div className="rounded-2xl border border-finance-paper/15 px-5 py-4 text-sm text-finance-paper/70">
              Start with a clean workspace and add your own balances, budgets, pots, and bills.
            </div>
          </div>
          {authError ? (
            <p className="mt-4 text-sm text-[#ffb4b4]">
              Google sign-in failed. Check your Google OAuth redirect URI and try again.
            </p>
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="rounded-[28px] border border-finance-line bg-finance-paper p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-finance-muted">Why this works</p>
            <div className="mt-5 space-y-4">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article key={feature.title} className="rounded-2xl bg-finance-cream p-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-finance-charcoal p-3 text-finance-paper">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h2 className="font-display text-xl font-bold tracking-[-0.03em] text-finance-text">{feature.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-finance-muted">{feature.body}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-finance-line bg-finance-paper p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-finance-muted">Ground Rule</p>
            <div className="mt-4 space-y-3">
              {quotes.map((quote) => (
                <blockquote key={quote} className="rounded-2xl border border-finance-line bg-finance-paper px-4 py-4 font-display text-lg leading-7 tracking-[-0.02em] text-finance-text">
                  “{quote}”
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
