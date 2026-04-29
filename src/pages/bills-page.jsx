import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, ReceiptText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { api } from '../lib/api';
import { formatCurrency, formatShortDate } from '../lib/format';
import { useBills } from '../lib/hooks';
import { usePeriod } from '../state/period-context';
import { useToast } from '../state/toast-context';
import { BillsList, ErrorState, Field, GlassButton, GlassCard, GlassInput, GlassSelect, Modal, PeriodSelector, SectionHeader, Skeleton } from '../components/ui';
import { DatePickerField } from '../components/date-picker-field';

export function BillsPage() {
  const queryClient = useQueryClient();
  const { toastPromise } = useToast();
  const { month, year } = usePeriod();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('due-date');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', dueDate: '', amount: '', isRecurring: true, dayOfMonth: '' });

  const bills = useBills({ search, sort });

  const createBill = useMutation({
    mutationFn: (payload) =>
      api('/bills', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      setShowModal(false);
      setForm({ title: '', dueDate: '', amount: '', isRecurring: true, dayOfMonth: '' });
    },
  });

  const createBillTemplate = useMutation({
    mutationFn: (payload) =>
      api('/bill-templates', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      setShowModal(false);
      setForm({ title: '', dueDate: '', amount: '', isRecurring: true, dayOfMonth: '' });
    },
  });

  const deleteBill = useMutation({
    mutationFn: (billId) =>
      api(`/bills/${billId}`, {
        method: 'DELETE',
      }),
  });

  const summary = useMemo(() => {
    const items = bills.data || [];
    return {
      totalThisMonth: items.reduce((sum, item) => sum + item.amount, 0),
      paid: items.filter((item) => item.computedStatus === 'paid'),
      upcoming: items.filter((item) => item.computedStatus === 'upcoming'),
      missed: items.filter((item) => item.computedStatus === 'missed'),
    };
  }, [bills.data]);

  if (bills.error) {
    return <ErrorState message={bills.error.message} />;
  }

  const periodLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));

  const handleDeleteBill = async (bill) => {
    await toastPromise(
      async () => {
        const result = await deleteBill.mutateAsync(bill._id);
        queryClient.invalidateQueries({ queryKey: ['bills'] });
        queryClient.invalidateQueries({ queryKey: ['overview'] });
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
          <h1 className="page-title">Recurring Bills</h1>
          <p className="mt-2 text-sm text-finance-muted">Monitor bills, payment status, and due dates for {periodLabel}.</p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelector />
          <GlassButton className="sm:w-auto" onClick={() => setShowModal(true)}>
            <PlusCircle size={16} />
            Add new Recurring Bill
          </GlassButton>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        <SummaryCard title={`Total bills in ${periodLabel}`} amount={formatCurrency(summary.totalThisMonth)} detail={`${(bills.data || []).length} bills`} dark />
        <SummaryCard
          title="Paid Bills"
          amount={formatCurrency(summary.paid.reduce((sum, item) => sum + item.amount, 0))}
          detail={`${summary.paid.length} paid`}
          tone="paid"
        />
        <SummaryCard
          title="Total Upcoming"
          amount={formatCurrency(summary.upcoming.reduce((sum, item) => sum + item.amount, 0))}
          detail={`${summary.upcoming.length} upcoming`}
        />
        <SummaryCard
          title="Missed"
          amount={formatCurrency(summary.missed.reduce((sum, item) => sum + item.amount, 0))}
          detail={`${summary.missed.length} missed`}
          tone="missed"
        />
      </div>

      <GlassCard>
        <SectionHeader title="Bills" icon={ReceiptText} subtitle={periodLabel} />
        <div className="mb-4 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <GlassInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search bills" aria-label="Search bills" />
          <GlassSelect aria-label="Sort bills" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="due-date">Sort by | Due Date</option>
            <option value="amount">Sort by | Amount</option>
            <option value="title">Sort by | Title</option>
          </GlassSelect>
        </div>

        {bills.isLoading ? (
          <Skeleton className="h-80" />
        ) : (
          <BillsList items={bills.data} onDelete={handleDeleteBill} deletingId={deleteBill.isPending ? deleteBill.variables : null} />
        )}
      </GlassCard>

      <Modal open={showModal} title="Add new Recurring Bill" onClose={() => setShowModal(false)}>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (form.isRecurring) {
              createBillTemplate.mutate({
                title: form.title,
                amount: Number(form.amount),
                dayOfMonth: Number(form.dayOfMonth),
              });
            } else {
              createBill.mutate({
                title: form.title,
                dueDate: form.dueDate,
                amount: Number(form.amount),
                isRecurring: false,
                status: 'upcoming',
              });
            }
          }}
        >
          <Field label="Bill Title">
            <GlassInput value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
          </Field>
          {form.isRecurring ? (
            <Field label="Day of Month">
              <GlassInput
                type="number"
                min="1"
                max="31"
                value={form.dayOfMonth}
                onChange={(event) => setForm((current) => ({ ...current, dayOfMonth: event.target.value }))}
                placeholder="e.g. 15"
                required
              />
            </Field>
          ) : (
            <Field label="Due Date">
              <DatePickerField
                value={form.dueDate}
                onChange={(newDate) => setForm((current) => ({ ...current, dueDate: newDate }))}
                required
              />
            </Field>
          )}
          <Field label="Amount">
            <GlassInput
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              required
            />
          </Field>
          <label className="flex items-center gap-3 text-sm text-finance-muted">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={(event) => setForm((current) => ({ ...current, isRecurring: event.target.checked }))}
            />
            Mark as recurring
          </label>
          <GlassButton type="submit" className="w-full" disabled={createBill.isPending || createBillTemplate.isPending}>
            {createBill.isPending || createBillTemplate.isPending ? 'Saving...' : 'Create Bill'}
          </GlassButton>
        </form>
      </Modal>
    </div>
  );
}

function SummaryCard({ title, amount, detail, dark = false, tone = 'default' }) {
  const toneClass =
    tone === 'paid' ? 'text-finance-teal' : tone === 'missed' ? 'text-finance-red' : 'text-finance-text';

  return (
    <section
      className={`min-w-[220px] flex-1 rounded-2xl border p-4 ${
        dark ? 'border-finance-charcoal bg-finance-charcoal text-finance-paper' : 'border-finance-line bg-finance-paper text-finance-text'
      }`}
    >
      <p className={`text-sm ${dark ? 'text-finance-paper/70' : 'text-finance-muted'}`}>{title}</p>
      <p className={`mt-3 font-display text-2xl font-bold tracking-[-0.04em] ${dark ? 'text-finance-paper' : toneClass}`}>{amount}</p>
      <p className={`mt-2 text-sm ${dark ? 'text-finance-paper/70' : 'text-finance-muted'}`}>{detail}</p>
    </section>
  );
}
