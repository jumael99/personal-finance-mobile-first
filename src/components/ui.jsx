import { createPortal } from 'react-dom';
import { amountTone, formatCompactDate, formatCurrency, formatShortDate } from '../lib/format';

export function GlassCard({ className = '', children }) {
  return <section className={`glass-card p-5 ${className}`}>{children}</section>;
}

export function SectionHeader({ title, action, subtitle, icon: Icon }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          {Icon ? (
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-finance-cream text-finance-charcoal">
              <Icon size={18} />
            </span>
          ) : null}
          <h2 className="section-title">{title}</h2>
        </div>
        {subtitle ? <p className="mt-1 text-sm text-finance-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({ label, value, icon: Icon }) {
  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-finance-muted">{label}</p>
        {Icon ? (
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-finance-cream text-finance-charcoal">
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-[28px] font-bold tracking-[-0.04em] text-finance-text sm:text-[32px]">{formatCurrency(value)}</p>
    </GlassCard>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-finance-line ${className}`} />;
}

export function EmptyState({ message }) {
  return <div className="rounded-2xl bg-finance-line px-4 py-6 text-sm text-finance-muted">{message}</div>;
}

export function ErrorState({ message }) {
  return <div className="rounded-2xl border border-finance-red/15 bg-finance-red/10 px-4 py-6 text-sm text-finance-red">{message}</div>;
}

export function DonutProgress({ spent, maximum }) {
  const progress = maximum ? Math.min((spent / maximum) * 100, 100) : 0;
  const degrees = Math.round((progress / 100) * 360);

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative h-24 w-24 rounded-full"
        style={{
          background: `conic-gradient(#82C9D7 ${degrees}deg, #F3F3F3 ${degrees}deg)`,
        }}
      >
        <div className="absolute inset-3 grid place-items-center rounded-full bg-finance-paper text-center">
          <span className="text-sm font-medium text-finance-text">{Math.round(progress)}%</span>
        </div>
      </div>
      <div className="space-y-1 text-sm text-finance-muted">
        <p>Spent: {formatCurrency(spent)}</p>
        <p>Maximum: {formatCurrency(maximum)}</p>
        <p>Remaining: {formatCurrency(maximum - spent)}</p>
      </div>
    </div>
  );
}

export function ProgressBar({ value }) {
  return (
    <div className="h-2 rounded-full bg-finance-line">
      <div className="h-2 rounded-full bg-finance-cyan" style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

export function TransactionRows({ items, compact = false }) {
  if (!items.length) {
    return <EmptyState message="No transactions found." />;
  }

  if (compact) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-1 lg:block lg:overflow-visible">
        {items.map((item) => (
          <article key={item._id} className="glass-card min-w-[270px] p-4 lg:mb-3 lg:min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-finance-text">{item.senderRecipient}</p>
                <p className="mt-1 inline-flex rounded-full bg-finance-line px-2 py-1 text-xs text-finance-muted">{item.category}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-finance-muted">{formatCompactDate(item.date)}</p>
                <p className={`mt-2 font-medium ${amountTone(item.amount)}`}>{formatCurrency(item.amount)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {items.map((item) => (
          <article key={item._id} className="glass-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-finance-text">{item.senderRecipient}</p>
                <p className="mt-1 inline-flex rounded-full bg-finance-line px-2 py-1 text-xs text-finance-muted">{item.category}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-finance-muted">{formatShortDate(item.date)}</p>
                <p className={`mt-2 font-medium ${amountTone(item.amount)}`}>{formatCurrency(item.amount)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-2xl md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-finance-line text-finance-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Recipient / Sender</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-t border-finance-line bg-finance-paper">
                <td className="px-4 py-4 font-medium text-finance-text">{item.senderRecipient}</td>
                <td className="px-4 py-4 text-finance-muted">{item.category}</td>
                <td className="px-4 py-4 text-finance-muted">{formatShortDate(item.date)}</td>
                <td className={`px-4 py-4 text-right font-medium ${amountTone(item.amount)}`}>{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function BillsList({ items, compact = false }) {
  if (!items.length) {
    return <EmptyState message="No bills found." />;
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {items.map((bill) => (
          <article key={bill._id} className="flex items-center justify-between rounded-2xl bg-finance-line px-4 py-3">
            <div>
              <p className="font-medium text-finance-text">{bill.title}</p>
              <p className="text-sm text-finance-muted">{formatShortDate(bill.dueDate)}</p>
            </div>
            <p className="font-medium text-finance-text">{formatCurrency(bill.amount)}</p>
          </article>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-1 md:hidden">
        {items.map((bill) => (
          <article key={bill._id} className="glass-card min-w-[250px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-finance-text">{bill.title}</p>
                <p className="mt-1 text-sm text-finance-muted">{formatShortDate(bill.dueDate)}</p>
              </div>
              <p className="font-medium text-finance-text">{formatCurrency(bill.amount)}</p>
            </div>
            {bill.isRecurring ? (
              <span className="mt-3 inline-flex rounded-full bg-finance-peach px-2 py-1 text-xs text-finance-ochre">Recurring</span>
            ) : null}
          </article>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-2xl md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-finance-line text-finance-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Bill Title</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((bill) => (
              <tr key={bill._id} className="border-t border-finance-line bg-finance-paper">
                <td className="px-4 py-4 font-medium text-finance-text">{bill.title}</td>
                <td className="px-4 py-4 text-finance-muted">{formatShortDate(bill.dueDate)}</td>
                <td className="px-4 py-4 text-right font-medium text-finance-text">{formatCurrency(bill.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-finance-muted">{label}</span>
      {children}
    </label>
  );
}

export function GlassInput(props) {
  return <input {...props} className={`glass touch-target w-full rounded-2xl px-4 py-3 text-finance-text outline-none placeholder:text-finance-muted ${props.className || ''}`} />;
}

export function GlassSelect(props) {
  return <select {...props} className={`glass touch-target w-full rounded-2xl px-4 py-3 text-finance-text outline-none ${props.className || ''}`} />;
}

export function GlassButton({ className = '', ...props }) {
  return <button {...props} className={`touch-target interactive inline-flex items-center justify-center gap-2 rounded-2xl border border-finance-charcoal bg-finance-charcoal px-4 py-3 text-sm font-medium text-finance-paper ${className}`} />;
}

export function Modal({ open, title, children, onClose }) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-finance-charcoal/30 p-4 md:items-center">
      <button type="button" aria-label="Close modal" className="absolute inset-0" onClick={onClose} />
      <div className="glass-card relative w-full max-w-md p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-bold tracking-[-0.03em] text-finance-text">{title}</h3>
          <GlassButton onClick={onClose} className="px-3 py-2">
            Close
          </GlassButton>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
