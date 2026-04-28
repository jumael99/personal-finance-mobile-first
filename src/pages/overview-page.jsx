import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowDownCircle, Landmark, PiggyBank, PlusCircle, ReceiptText, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useOverview } from '../lib/hooks';
import { usePeriod } from '../state/period-context';
import { useToast } from '../state/toast-context';
import { BillsList, DonutProgress, ErrorState, Field, GlassButton, GlassCard, GlassInput, MetricCard, Modal, SectionHeader, Skeleton, TransactionRows } from '../components/ui';
import { DatePickerField } from '../components/date-picker-field';
import { formatCurrency } from '../lib/format';

export function OverviewPage() {
  const queryClient = useQueryClient();
  const { toastPromise } = useToast();
  const { month, year } = usePeriod();
  const { data, isLoading, error } = useOverview();
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [form, setForm] = useState({
    senderRecipient: 'Manual Balance Top-up',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
  });

  const addBalance = useMutation({
    mutationFn: (payload) =>
      api('/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setForm({
        senderRecipient: 'Manual Balance Top-up',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
      });
      setShowAddBalance(false);
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: (transactionId) =>
      api(`/transactions/${transactionId}`, {
        method: 'DELETE',
      }),
  });

  const deleteBill = useMutation({
    mutationFn: (billId) =>
      api(`/bills/${billId}`, {
        method: 'DELETE',
      }),
  });

  if (error) {
    return <ErrorState message={error.message} />;
  }

  const periodLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));

  const totalBudgetSpent = data?.budgets?.reduce((sum, item) => sum + item.spent, 0) || 0;
  const totalBudgetMax = data?.budgets?.reduce((sum, item) => sum + item.maximum, 0) || 0;

  const handleDeleteTransaction = async (transaction) => {
    await toastPromise(
      async () => {
        const result = await deleteTransaction.mutateAsync(transaction._id);
        queryClient.invalidateQueries({ queryKey: ['overview'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['budgets'] });
        return result;
      },
      {
        loading: `Deleting ${transaction.senderRecipient}...`,
        success: 'Transaction deleted',
        successDescription: `${transaction.senderRecipient} was removed from your records.`,
        error: 'Could not delete transaction',
      },
    );
  };

  const handleDeleteBill = async (bill) => {
    await toastPromise(
      async () => {
        const result = await deleteBill.mutateAsync(bill._id);
        queryClient.invalidateQueries({ queryKey: ['overview'] });
        queryClient.invalidateQueries({ queryKey: ['bills'] });
        return result;
      },
      {
        loading: `Deleting ${bill.title}...`,
        success: 'Bill deleted',
        successDescription: `${bill.title} was removed from recurring bills.`,
        error: 'Could not delete bill',
      },
    );
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Dashboard overview</h1>
          <p className="mt-2 text-sm text-finance-muted">Live metrics, budgets, pots, transactions, and recurring bills for {periodLabel}.</p>
        </div>
        <GlassButton className="w-full sm:w-auto" onClick={() => setShowAddBalance(true)}>
          <PlusCircle size={16} />
          Add balance
        </GlassButton>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <MetricCard label="Current Balance" value={data.metrics.currentBalance} icon={Wallet} />
            <MetricCard label="Total Spent" value={data.metrics.totalSpent} icon={ArrowDownCircle} />
            <MetricCard label="Total Saved" value={data.metrics.totalSaved} icon={PiggyBank} />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard>
          <SectionHeader title="Pot Savings" icon={PiggyBank} subtitle={isLoading ? 'Loading savings...' : `Total Saved: ${formatCurrency(data.potSavings.totalSaved)}`} />
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : (
            <div className="space-y-3">
              {data.potSavings.topPots.map((pot) => (
                <div key={pot._id} className="rounded-2xl bg-finance-line px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-finance-text">{pot.name}</p>
                    <p className="text-sm text-finance-muted">{formatCurrency(pot.saved)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Budgets" icon={Landmark} subtitle={isLoading ? 'Chart is loading...' : 'Overall spending vs total budget maximums'} />
          {isLoading ? <Skeleton className="h-36" /> : <DonutProgress spent={totalBudgetSpent} maximum={totalBudgetMax} />}
        </GlassCard>

        <GlassCard>
          <SectionHeader
            title="Bills"
            icon={ReceiptText}
            subtitle={isLoading ? 'Loading bills...' : `${periodLabel}: ${formatCurrency(data.bills.totalUpcomingThisMonth)}`}
            action={
              <Link to="/bills">
                <GlassButton className="px-3 py-2">See all Bills</GlassButton>
              </Link>
            }
          />
          {isLoading ? (
            <Skeleton className="h-36" />
          ) : (
            <BillsList
              items={data.bills.upcoming}
              compact
              onDelete={handleDeleteBill}
              deletingId={deleteBill.isPending ? deleteBill.variables : null}
            />
          )}
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <GlassCard>
          <SectionHeader title="Transactions overview" icon={ArrowDownCircle} subtitle={isLoading ? 'transactions are rendering...' : '5 most recent transactions'} />
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <TransactionRows
              items={data.transactions.recent}
              compact
              onDelete={handleDeleteTransaction}
              deletingId={deleteTransaction.isPending ? deleteTransaction.variables : null}
            />
          )}
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Upcoming Bills" icon={ReceiptText} subtitle={`Next 3 due bills in ${periodLabel}`} />
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <BillsList
              items={data.bills.upcoming}
              compact
              onDelete={handleDeleteBill}
              deletingId={deleteBill.isPending ? deleteBill.variables : null}
            />
          )}
        </GlassCard>
      </div>

      <Modal open={showAddBalance} title="Add balance" onClose={() => setShowAddBalance(false)}>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            addBalance.mutate({
              senderRecipient: form.senderRecipient,
              category: 'Income',
              date: form.date,
              amount: Number(form.amount),
            });
          }}
        >
          <Field label="Source">
            <GlassInput
              value={form.senderRecipient}
              onChange={(event) => setForm((current) => ({ ...current, senderRecipient: event.target.value }))}
              required
            />
          </Field>
          <Field label="Amount">
            <GlassInput
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              required
            />
          </Field>
          <Field label="Date">
            <DatePickerField
              value={form.date}
              onChange={(newDate) => setForm((current) => ({ ...current, date: newDate }))}
              required
            />
          </Field>
          <GlassButton type="submit" className="w-full" disabled={addBalance.isPending}>
            {addBalance.isPending ? 'Saving...' : 'Add balance'}
          </GlassButton>
        </form>
      </Modal>
    </div>
  );
}
