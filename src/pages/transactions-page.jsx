import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api';
import { ErrorState, Field, GlassButton, GlassCard, GlassInput, GlassSelect, Modal, SectionHeader, Skeleton, TransactionRows } from '../components/ui';
import { useTransactions } from '../lib/hooks';
import { usePeriod } from '../state/period-context';

export function TransactionsPage() {
  const queryClient = useQueryClient();
  const { month, year } = usePeriod();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    senderRecipient: '',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    type: 'expense',
  });

  const { data, isLoading, error } = useTransactions({ search, sort, category, page, limit: 10 });
  const createTransaction = useMutation({
    mutationFn: (payload) =>
      api('/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setForm({
        senderRecipient: '',
        category: '',
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        type: 'expense',
      });
      setPage(1);
      setShowModal(false);
    },
  });

  if (error) {
    return <ErrorState message={error.message} />;
  }

  const periodLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="mt-2 text-sm text-finance-muted">Search, filter, and sort transaction data for {periodLabel}.</p>
        </div>
        <GlassButton className="w-full sm:w-auto" onClick={() => setShowModal(true)}>
          <PlusCircle size={16} />
          Add new transaction
        </GlassButton>
      </div>

      <GlassCard>
        <SectionHeader title="Transactions" subtitle={periodLabel} />
        <div className="mb-4 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
          <label className="surface-inverse flex min-h-11 items-center gap-3 rounded-[2px] px-4 py-3">
            <Search size={18} className="text-finance-muted" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-finance-text outline-none placeholder:text-finance-muted"
              placeholder="Search Transaction"
              aria-label="Search Transaction"
            />
          </label>
          <GlassSelect
            aria-label="Sort transactions"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
          >
            <option value="latest">Sort by | Latest</option>
            <option value="oldest">Sort by | Oldest</option>
            <option value="a-z">Sort by | A-Z</option>
            <option value="z-a">Sort by | Z-A</option>
            <option value="highest">Sort by | Highest</option>
            <option value="lowest">Sort by | Lowest</option>
          </GlassSelect>
          <GlassSelect
            aria-label="Filter by category"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Category | All Transactions</option>
            {data?.categories?.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </GlassSelect>
        </div>

        {isLoading ? <Skeleton className="h-80" /> : <TransactionRows items={data.items} />}

        <div className="mt-5 flex justify-center md:justify-end">
          <div className="flex items-center gap-3">
            <GlassButton disabled={page <= 1} onClick={() => setPage((value) => Math.max(value - 1, 1))}>
              Prev
            </GlassButton>
            <span className="text-sm text-finance-muted">
              Page {data?.pagination?.page || 1} of {data?.pagination?.totalPages || 1}
            </span>
            <GlassButton
              disabled={page >= (data?.pagination?.totalPages || 1)}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      <Modal open={showModal} title="Add new transaction" onClose={() => setShowModal(false)}>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const numericAmount = Number(form.amount);
            createTransaction.mutate({
              senderRecipient: form.senderRecipient,
              category: form.category,
              date: form.date,
              amount: form.type === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount),
            });
          }}
        >
          <Field label="Recipient / Sender">
            <GlassInput
              value={form.senderRecipient}
              onChange={(event) => setForm((current) => ({ ...current, senderRecipient: event.target.value }))}
              required
            />
          </Field>
          <Field label="Category">
            <GlassInput value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date">
              <GlassInput type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} required />
            </Field>
            <Field label="Type">
              <GlassSelect value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </GlassSelect>
            </Field>
          </div>
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
          <GlassButton type="submit" className="w-full" disabled={createTransaction.isPending}>
            {createTransaction.isPending ? 'Saving...' : 'Add new transaction'}
          </GlassButton>
        </form>
      </Modal>
    </div>
  );
}
