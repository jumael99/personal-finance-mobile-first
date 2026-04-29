import { Check, ChevronDown, ChevronLeft, ChevronRight, Link2Off, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { DeleteAction } from './delete-action';
import { amountTone, formatCompactDate, formatCurrency, formatShortDate } from '../lib/format';
import { usePeriod } from '../state/period-context';

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

export function TransactionRows({ items, compact = false, onDelete, deletingId }) {
  if (!items.length) {
    return <EmptyState message="No transactions found." />;
  }

  if (compact) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-1 lg:block lg:overflow-visible">
        {items.map((item) => (
          <article key={item._id} className="glass-card min-w-[270px] p-4 lg:mb-3 lg:min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <TransactionAvatar item={item} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-finance-text">{item.senderRecipient}</p>
                  <p className="mt-1 inline-flex rounded-full bg-finance-line px-2 py-1 text-xs text-finance-muted">{item.category}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                {onDelete ? (
                  <DeleteAction
                    label={`Delete transaction for ${item.senderRecipient}`}
                    onClick={() => {
                      void onDelete(item);
                    }}
                    disabled={deletingId === item._id}
                    busy={deletingId === item._id}
                  />
                ) : null}
                <div className="text-right">
                  <p className="text-xs text-finance-muted">{formatCompactDate(item.date)}</p>
                  <p className={`mt-2 font-medium ${amountTone(item.amount)}`}>{formatCurrency(item.amount)}</p>
                </div>
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
              <div className="flex min-w-0 items-start gap-3">
                <TransactionAvatar item={item} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-finance-text">{item.senderRecipient}</p>
                  <p className="mt-1 inline-flex rounded-full bg-finance-line px-2 py-1 text-xs text-finance-muted">{item.category}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                {onDelete ? (
                  <DeleteAction
                    label={`Delete transaction for ${item.senderRecipient}`}
                    onClick={() => {
                      void onDelete(item);
                    }}
                    disabled={deletingId === item._id}
                    busy={deletingId === item._id}
                  />
                ) : null}
                <div className="text-right">
                  <p className="text-xs text-finance-muted">{formatShortDate(item.date)}</p>
                  <p className={`mt-2 font-medium ${amountTone(item.amount)}`}>{formatCurrency(item.amount)}</p>
                </div>
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
              {onDelete ? <th className="px-4 py-3 text-right font-medium">Delete</th> : null}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-t border-finance-line bg-finance-paper">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <TransactionAvatar item={item} className="h-10 w-10 text-xs" />
                    <span className="font-medium text-finance-text">{item.senderRecipient}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-finance-muted">{item.category}</td>
                <td className="px-4 py-4 text-finance-muted">{formatShortDate(item.date)}</td>
                <td className={`px-4 py-4 text-right font-medium ${amountTone(item.amount)}`}>{formatCurrency(item.amount)}</td>
                {onDelete ? (
                  <td className="px-4 py-4 text-right">
                    <DeleteAction
                      label={`Delete transaction for ${item.senderRecipient}`}
                      onClick={() => {
                        void onDelete(item);
                      }}
                      disabled={deletingId === item._id}
                      busy={deletingId === item._id}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TransactionAvatar({ item, className = '' }) {
  const initials = item.senderRecipient
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  if (item.avatar) {
    return <img src={item.avatar} alt="" className={`h-12 w-12 shrink-0 rounded-2xl object-cover ${className}`} />;
  }

  return (
    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-finance-line text-sm font-medium text-finance-text ${className}`}>
      {initials || '?'}
    </span>
  );
}

function PaidIndicator() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-finance-teal text-white" title="Paid">
      <Check size={12} strokeWidth={3} />
    </span>
  );
}

function ActionButton({ label, icon: Icon, onClick, disabled = false, busy = false, crossedOut = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`group inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-finance-line bg-finance-paper/85 text-finance-muted transition duration-200 hover:border-finance-charcoal/25 hover:bg-finance-cream hover:text-finance-text disabled:cursor-not-allowed disabled:opacity-60 ${crossedOut ? 'line-through' : ''}`}
    >
      <Icon size={17} className={busy ? 'animate-pulse' : 'text-current'} />
    </button>
  );
}

export function BillsList({ items, compact = false, onDelete, deletingId, onPay, payingId, onRemoveRecurring, removingRecurringId }) {
  if (!items.length) {
    return <EmptyState message="No bills found." />;
  }

  const hasActions = !!(onPay || onRemoveRecurring || onDelete);

  if (compact) {
    return (
      <div className="space-y-3">
        {items.map((bill) => {
          const isPaid = bill.computedStatus === 'paid' || bill.status === 'paid';
          return (
            <article key={bill._id} className="flex items-center justify-between rounded-2xl bg-finance-line px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  {isPaid ? <PaidIndicator /> : null}
                  <p className="font-medium text-finance-text">{bill.title}</p>
                </div>
                <p className="text-sm text-finance-muted">{formatShortDate(bill.dueDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                {onDelete ? (
                  <DeleteAction
                    label={`Delete bill ${bill.title}`}
                    onClick={() => {
                      void onDelete(bill);
                    }}
                    disabled={deletingId === bill._id}
                    busy={deletingId === bill._id}
                  />
                ) : null}
                <p className="font-medium text-finance-text">{formatCurrency(bill.amount)}</p>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-1 md:hidden">
        {items.map((bill) => {
          const isPaid = bill.computedStatus === 'paid' || bill.status === 'paid';
          return (
            <article key={bill._id} className="glass-card min-w-[250px] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {isPaid ? <PaidIndicator /> : null}
                    <p className="font-medium text-finance-text">{bill.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-finance-muted">{formatShortDate(bill.dueDate)}</p>
                </div>
                <p className="font-medium text-finance-text">{formatCurrency(bill.amount)}</p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1">
                {bill.isRecurring ? (
                  <span className="inline-flex rounded-full bg-finance-peach px-2 py-1 text-xs text-finance-ochre">Recurring</span>
                ) : null}
              </div>
              {hasActions ? (
                <div className="mt-3 flex items-center gap-1 border-t border-finance-line pt-3">
                  {onPay ? (
                    <ActionButton
                      label={isPaid ? `Already paid` : `Pay ${bill.title}`}
                      icon={Check}
                      onClick={() => {
                        void onPay(bill);
                      }}
                      disabled={isPaid || payingId === bill._id}
                      busy={payingId === bill._id}
                      crossedOut={isPaid}
                    />
                  ) : null}
                  {onRemoveRecurring && bill.isRecurring ? (
                    <ActionButton
                      label={`Remove recurring for ${bill.title}`}
                      icon={Link2Off}
                      onClick={() => {
                        void onRemoveRecurring(bill);
                      }}
                      disabled={removingRecurringId === bill._id}
                      busy={removingRecurringId === bill._id}
                    />
                  ) : null}
                  {onDelete ? (
                    <DeleteAction
                      label={`Delete bill ${bill.title}`}
                      onClick={() => {
                        void onDelete(bill);
                      }}
                      disabled={deletingId === bill._id}
                      busy={deletingId === bill._id}
                    />
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
      <div className="hidden overflow-hidden rounded-2xl md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-finance-line text-finance-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Bill Title</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              {hasActions ? <th className="px-4 py-3 text-right font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {items.map((bill) => {
              const isPaid = bill.computedStatus === 'paid' || bill.status === 'paid';
              return (
                <tr key={bill._id} className="border-t border-finance-line bg-finance-paper">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {isPaid ? <PaidIndicator /> : null}
                      <span className="font-medium text-finance-text">{bill.title}</span>
                      {bill.isRecurring ? (
                        <span className="inline-flex rounded-full bg-finance-peach px-2 py-1 text-xs text-finance-ochre">Recurring</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-finance-muted">{formatShortDate(bill.dueDate)}</td>
                  <td className="px-4 py-4 text-right font-medium text-finance-text">{formatCurrency(bill.amount)}</td>
                  {hasActions ? (
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onPay ? (
                          <ActionButton
                            label={isPaid ? `Already paid` : `Pay ${bill.title}`}
                            icon={Check}
                            onClick={() => {
                              void onPay(bill);
                            }}
                            disabled={isPaid || payingId === bill._id}
                            busy={payingId === bill._id}
                            crossedOut={isPaid}
                          />
                        ) : null}
                        {onRemoveRecurring && bill.isRecurring ? (
                          <ActionButton
                            label={`Remove recurring for ${bill.title}`}
                            icon={Link2Off}
                            onClick={() => {
                              void onRemoveRecurring(bill);
                            }}
                            disabled={removingRecurringId === bill._id}
                            busy={removingRecurringId === bill._id}
                          />
                        ) : null}
                        {onDelete ? (
                          <DeleteAction
                            label={`Delete bill ${bill.title}`}
                            onClick={() => {
                              void onDelete(bill);
                            }}
                            disabled={deletingId === bill._id}
                            busy={deletingId === bill._id}
                          />
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
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

export function SelectField({ icon: Icon = ChevronDown, className = '', ...props }) {
  return (
    <div className="relative">
      <GlassSelect {...props} className={`appearance-none pr-11 ${className}`} />
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-finance-muted">
        <Icon size={16} />
      </span>
    </div>
  );
}

export function HelperText({ children }) {
  return <p className="text-xs text-finance-muted">{children}</p>;
}

export function RadioCard({ checked, label, description, ...props }) {
  return (
    <label
      className={`block cursor-pointer rounded-2xl border px-4 py-3 transition ${
        checked ? 'border-finance-charcoal bg-finance-paper text-finance-text' : 'border-finance-line bg-finance-paper/70 text-finance-muted'
      }`}
    >
      <input type="radio" className="sr-only" checked={checked} {...props} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{label}</p>
          {description ? <p className="mt-1 text-xs">{description}</p> : null}
        </div>
        <span
          className={`mt-0.5 h-5 w-5 rounded-full border ${
            checked ? 'border-finance-charcoal bg-finance-charcoal shadow-[inset_0_0_0_4px_#FFFCF5]' : 'border-finance-line bg-transparent'
          }`}
        />
      </div>
    </label>
  );
}

export function GlassButton({ className = '', ...props }) {
  return <button {...props} className={`touch-target interactive inline-flex items-center justify-center gap-2 rounded-2xl border border-finance-charcoal bg-finance-charcoal px-4 py-3 text-sm font-medium text-finance-paper ${className}`} />;
}

export function Modal({ open, title, description, children, onClose, maxWidthClassName = 'max-w-md' }) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="overlay-backdrop fixed inset-0 z-[60] flex items-end justify-center p-4 md:items-center">
      <button type="button" aria-label="Close modal" className="absolute inset-0" onClick={onClose} />
      <div className={`overlay-panel relative z-10 max-h-[calc(100vh-2rem)] w-full ${maxWidthClassName} overflow-y-auto p-5 sm:p-6`}>
        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-finance-line bg-finance-paper/90 text-finance-text transition hover:bg-finance-cream"
        >
          <X size={18} />
        </button>
        <div className="mb-5 pr-12">
          <h3 className="font-display text-xl font-bold tracking-[-0.03em] text-finance-text">{title}</h3>
          {description ? <p className="mt-2 text-sm leading-6 text-finance-muted">{description}</p> : null}
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function PeriodSelector() {
  const { month, year, goToCurrentMonth, shiftMonth } = usePeriod();

  const label = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-finance-line bg-finance-paper px-2 py-1.5">
      <button
        type="button"
        aria-label="Previous month"
        onClick={() => shiftMonth(-1)}
        className="touch-target interactive grid h-8 w-8 place-items-center rounded-lg text-finance-muted hover:bg-finance-cream hover:text-finance-text"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={goToCurrentMonth}
        className="interactive rounded-lg px-2 py-1 text-sm font-medium text-finance-text hover:bg-finance-cream"
      >
        {label}
      </button>
      <button
        type="button"
        aria-label="Next month"
        onClick={() => shiftMonth(1)}
        className="touch-target interactive grid h-8 w-8 place-items-center rounded-lg text-finance-muted hover:bg-finance-cream hover:text-finance-text"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
