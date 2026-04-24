import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Wallet2, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api';
import { ErrorState, GlassCard, SectionHeader, Skeleton } from '../components/ui';
import { Field, GlassButton, GlassInput, Modal } from '../components/ui';
import { useBudgets, useTransactions } from '../lib/hooks';
import { formatCurrency, formatShortDate } from '../lib/format';
import { usePeriod } from '../state/period-context';

const budgetAccent = {
  Dining: 'bg-finance-cyan',
  General: 'bg-finance-plum',
  Entertainment: 'bg-finance-slate',
  Lifestyle: 'bg-finance-rust',
};

export function BudgetsPage() {
  const queryClient = useQueryClient();
  const { month, year } = usePeriod();
  const budgets = useBudgets();
  const spending = useTransactions({ type: 'expense', limit: 5, sort: 'latest', page: 1 });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: '', maximum: '' });
  const createBudget = useMutation({
    mutationFn: (payload) =>
      api('/budgets', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      setForm({ category: '', maximum: '' });
      setShowModal(false);
    },
  });

  if (budgets.error) {
    return <ErrorState message={budgets.error.message} />;
  }

  if (spending.error) {
    return <ErrorState message={spending.error.message} />;
  }

  const periodLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="mt-2 text-sm text-finance-muted">Track category maximums against live spending totals for {periodLabel}.</p>
        </div>
        <GlassButton className="w-full sm:w-auto" onClick={() => setShowModal(true)}>
          <PlusCircle size={16} />
          Add New Budget
        </GlassButton>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <GlassCard>
          <SectionHeader title="Budget Categories" icon={WalletCards} subtitle={`Real-time spending against each budget in ${periodLabel}`} />
          <div className="space-y-3">
            {budgets.isLoading ? (
              <>
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </>
            ) : (
              budgets.data.map((budget) => (
                <article key={budget._id} className="surface-muted rounded-[2px] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${budgetAccent[budget.category] || 'bg-finance-cyan'}`} />
                        <h3 className="font-medium text-finance-text">{budget.category}</h3>
                      </div>
                      <p className="mt-1 text-sm text-finance-muted">Maximum: {formatCurrency(budget.maximum)}</p>
                    </div>
                    <p className={`text-sm font-medium ${budget.remaining < 0 ? 'text-finance-red' : 'text-finance-text'}`}>
                      Remaining: {formatCurrency(budget.remaining)}
                    </p>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-finance-muted">
                    <p>Spent: {formatCurrency(budget.spent)}</p>
                    <div className="h-2 rounded-full bg-finance-charcoal/8">
                      <div
                        className={`h-2 rounded-full ${budgetAccent[budget.category] || 'bg-finance-cyan'}`}
                        style={{ width: `${Math.min(budget.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Latest Spending" icon={Wallet2} subtitle={`Most recent expense transactions in ${periodLabel}`} />
          <div className="space-y-3">
            {spending.isLoading ? (
              <>
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </>
            ) : (
              spending.data.items.map((item) => (
                <article key={item._id} className="surface-muted rounded-[2px] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-finance-text">{item.senderRecipient}</p>
                      <p className="mt-1 text-sm text-finance-muted">{formatShortDate(item.date)}</p>
                    </div>
                    <p className="font-medium text-finance-red">{formatCurrency(item.amount)}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <Modal open={showModal} title="Add New Budget" onClose={() => setShowModal(false)}>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            createBudget.mutate({
              category: form.category,
              maximum: Number(form.maximum),
              spent: 0,
              month,
              year,
            });
          }}
        >
          <Field label="Category Name">
            <GlassInput value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} required />
          </Field>
          <Field label="Maximum Budget">
            <GlassInput
              type="number"
              min="0.01"
              step="0.01"
              value={form.maximum}
              onChange={(event) => setForm((current) => ({ ...current, maximum: event.target.value }))}
              required
            />
          </Field>
          <GlassButton type="submit" className="w-full" disabled={createBudget.isPending}>
            {createBudget.isPending ? 'Saving...' : 'Add New Budget'}
          </GlassButton>
        </form>
      </Modal>
    </div>
  );
}
