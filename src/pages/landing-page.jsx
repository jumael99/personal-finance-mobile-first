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
    <div className="relative min-h-screen overflow-hidden bg-[#07110b] text-finance-paper">
      <div className="landing-glow" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1240px] flex-col justify-between px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex items-center justify-between border-b border-[#92ffc11f] pb-4 text-[12px] uppercase tracking-[1.2px] text-[#9ad6b7]">
          <span>Personal Finance Dashboard</span>
          <span>Calm signal, strong structure</span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-10 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="gradient-shell">
              <div className="landing-panel rounded-[2px] px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
                <p className="text-[12px] uppercase tracking-[1.2px] text-[#9ad6b7]">Bounded. Editorial. Technical.</p>
                <h1 className="mt-6 max-w-4xl font-display text-[56px] font-light leading-[0.92] tracking-[-0.025em] text-finance-paper sm:text-[72px] lg:text-[96px]">
                  Money views with a softer interface and a sharper landing.
                </h1>
                <p className="mt-6 max-w-2xl text-[14px] leading-7 text-[#d7efe2]">
                  The app keeps a warm coral and cream product language inside, while this entry screen leans into a retro-futurist dot field to frame the product with more atmosphere.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="/api/auth/google/start"
                    className="touch-target interactive inline-flex items-center justify-center rounded-none bg-finance-red px-6 py-4 text-[12px] uppercase tracking-[1.2px] text-finance-paper hover:bg-[#ff9c7d]"
                  >
                    Continue with Google
                  </a>
                  <div className="rounded-[2px] border border-[#92ffc126] bg-[#92ffc10a] px-5 py-4 text-[13px] leading-6 text-[#cfe8db]">
                    Start with a clean workspace and add your own balances, budgets, pots, and recurring bills.
                  </div>
                </div>
                {authError ? (
                  <p className="mt-4 text-sm text-[#ffab8d]">
                    Google sign-in failed. Check your Google OAuth redirect URI and try again.
                  </p>
                ) : null}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="gradient-shell">
                <div className="landing-panel rounded-[2px] p-6">
                  <p className="text-[12px] uppercase tracking-[1.2px] text-[#9ad6b7]">Why this works</p>
                  <div className="mt-5 space-y-4">
                    {features.map((feature) => {
                      const Icon = feature.icon;

                      return (
                        <article key={feature.title} className="rounded-[2px] border border-[#92ffc11f] bg-[#92ffc108] p-4">
                          <div className="flex items-start gap-4">
                            <div className="grid h-11 w-11 place-items-center rounded-[2px] bg-[#92ffc114] text-[#9ad6b7]">
                              <Icon size={18} />
                            </div>
                            <div>
                              <h2 className="font-display text-[28px] font-light tracking-[-0.025em] text-finance-paper">{feature.title}</h2>
                              <p className="mt-2 text-[13px] leading-6 text-[#d7efe2]">{feature.body}</p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="landing-metric rounded-[2px] p-4">
                  <p className="text-[12px] uppercase tracking-[1.2px] text-[#9ad6b7]">Motion</p>
                  <p className="mt-3 font-display text-4xl font-light tracking-[-0.025em] text-finance-paper">300ms</p>
                </div>
                <div className="landing-metric rounded-[2px] p-4">
                  <p className="text-[12px] uppercase tracking-[1.2px] text-[#9ad6b7]">Palette</p>
                  <p className="mt-3 font-display text-4xl font-light tracking-[-0.025em] text-finance-paper">Coral / Cream</p>
                </div>
              </div>

              <div className="gradient-shell">
                <div className="landing-panel rounded-[2px] p-6">
                  <p className="text-[12px] uppercase tracking-[1.2px] text-[#9ad6b7]">Ground Rule</p>
                  <div className="mt-4 space-y-3">
                    {quotes.map((quote) => (
                      <blockquote key={quote} className="rounded-[2px] border border-[#92ffc11f] bg-[#92ffc108] px-4 py-4 font-display text-lg font-light leading-7 tracking-[-0.025em] text-finance-paper">
                        “{quote}”
                      </blockquote>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
