import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api';
import {
  ErrorState,
  Field,
  GlassButton,
  GlassCard,
  GlassInput,
  HelperText,
  Modal,
  PeriodSelector,
  RadioCard,
  SearchableSelect,
  SectionHeader,
  SelectField,
  Skeleton,
  TransactionRows,
} from '../components/ui';
import { DatePickerField } from '../components/date-picker-field';
import { DEFAULT_SENDER_RECIPIENT } from '../lib/form-defaults';
import { useCategories, useTransactions } from '../lib/hooks';
import { usePeriod } from '../state/period-context';
import { useToast } from '../state/toast-context';

function getInitialForm() {
  return {
    senderRecipient: DEFAULT_SENDER_RECIPIENT,
    category: '',
    amount: '',
    avatar: '',
    transactionType: 'sent',
    date: new Date().toISOString().slice(0, 10),
  };
}

export function TransactionsPage() {
  const queryClient = useQueryClient();
  const { toastPromise } = useToast();
  const { month, year } = usePeriod();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [form, setForm] = useState(getInitialForm);

  const { data, isLoading, error } = useTransactions({ search, sort, category, page, limit: 10 });
  const categories = useCategories();

  const resetModalState = () => {
    setForm(getInitialForm());
    setNewCategoryName('');
    setShowNewCategoryInput(false);
  };

  const closeModal = () => {
    resetModalState();
    setShowModal(false);
  };

  const invalidateAppData = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['overview'] });
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const createCategory = useMutation({
    mutationFn: (name) =>
      api('/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    onSuccess: (createdCategory) => {
      invalidateAppData();
      setForm((current) => ({ ...current, category: createdCategory.name }));
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    },
  });

  const createTransaction = useMutation({
    mutationFn: (payload) =>
      api('/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      invalidateAppData();
      setPage(1);
      closeModal();
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: (transactionId) =>
      api(`/transactions/${transactionId}`, {
        method: 'DELETE',
      }),
  });

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (categories.error) {
    return <ErrorState message={categories.error.message} />;
  }

  const periodLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));

  const categoryOptions = categories.data?.map((item) => item.name) || [];

  const handleDeleteTransaction = async (transaction) => {
    await toastPromise(
      async () => {
        const result = await deleteTransaction.mutateAsync(transaction._id);
        invalidateAppData();
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

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="mt-2 text-sm text-finance-muted">Search, filter, and sort transaction data for {periodLabel}.</p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelector />
          <GlassButton className="sm:w-auto" onClick={() => setShowModal(true)}>
            <PlusCircle size={16} />
            Add New Transaction
          </GlassButton>
        </div>
      </div>

      <GlassCard>
        <SectionHeader title="Transactions" subtitle={periodLabel} />
        <div className="mb-4 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
          <label className="glass flex min-h-11 items-center gap-3 rounded-2xl px-4 py-3">
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
          <SelectField
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
          </SelectField>
          <SelectField
            aria-label="Filter by category"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Category | All Transactions</option>
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>
        </div>

        {isLoading ? (
          <Skeleton className="h-80" />
        ) : (
          <TransactionRows
            items={data.items}
            onDelete={handleDeleteTransaction}
            deletingId={deleteTransaction.isPending ? deleteTransaction.variables : null}
          />
        )}

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

      <Modal
        open={showModal}
        title="Add New Transaction"
        description="Add a new transaction to track your spending. This helps you monitor your spending habits."
        onClose={closeModal}
        maxWidthClassName="max-w-xl"
      >
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            const numericAmount = Number(form.amount);

            createTransaction.mutate({
              senderRecipient: form.senderRecipient.trim(),
              category: form.category,
              date: form.date,
              avatar: form.avatar.trim(),
              amount: form.transactionType === 'sent' ? -Math.abs(numericAmount) : Math.abs(numericAmount),
            });
          }}
        >
          <Field label="Recipient / Sender Name">
            <GlassInput
              value={form.senderRecipient}
              onChange={(event) => setForm((current) => ({ ...current, senderRecipient: event.target.value }))}
              placeholder="e.g. Rainy Days"
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

          <div className="space-y-3">
            <Field label="Category">
              <SearchableSelect
                options={categoryOptions}
                value={form.category}
                onChange={(newValue) => setForm((current) => ({ ...current, category: newValue }))}
                placeholder="Search or select a category..."
                required
              />
            </Field>

            <div className="space-y-3 rounded-2xl border border-dashed border-finance-line p-3">
              <GlassButton
                type="button"
                className="w-full border-finance-line bg-finance-paper text-finance-text"
                onClick={() => setShowNewCategoryInput((current) => !current)}
              >
                <PlusCircle size={16} />
                Add New Category
              </GlassButton>

              {showNewCategoryInput ? (
                <div className="space-y-3">
                  <GlassInput
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    placeholder="New category name"
                  />
                  <div className="flex gap-3">
                    <GlassButton
                      type="button"
                      className="flex-1"
                      disabled={!newCategoryName.trim() || createCategory.isPending}
                      onClick={() => createCategory.mutate(newCategoryName.trim())}
                    >
                      {createCategory.isPending ? 'Saving...' : 'Save Category'}
                    </GlassButton>
                    <GlassButton
                      type="button"
                      className="flex-1 border-finance-line bg-finance-paper text-finance-text"
                      onClick={() => {
                        setShowNewCategoryInput(false);
                        setNewCategoryName('');
                      }}
                    >
                      Cancel
                    </GlassButton>
                  </div>
                  {createCategory.error ? <ErrorState message={createCategory.error.message} /> : null}
                </div>
              ) : null}
            </div>
          </div>

          <Field label="Amount">
            <GlassInput
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              placeholder="e.g. 500"
              required
            />
          </Field>

          <Field label="Avatar">
            <GlassInput
              type="url"
              value={form.avatar}
              onChange={(event) => setForm((current) => ({ ...current, avatar: event.target.value }))}
              placeholder="Paste an image URL for now"
            />
            <HelperText>Cloudinary upload can plug into this field later.</HelperText>
          </Field>

          <div className="space-y-2">
            <p className="text-sm text-finance-muted">Transaction Type</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <RadioCard
                name="transactionType"
                value="sent"
                checked={form.transactionType === 'sent'}
                onChange={(event) => setForm((current) => ({ ...current, transactionType: event.target.value }))}
                label="Sent"
                description="Adds this as money going out."
              />
              <RadioCard
                name="transactionType"
                value="received"
                checked={form.transactionType === 'received'}
                onChange={(event) => setForm((current) => ({ ...current, transactionType: event.target.value }))}
                label="Received"
                description="Adds this as money coming in."
              />
            </div>
          </div>

          {createTransaction.error ? <ErrorState message={createTransaction.error.message} /> : null}

          <GlassButton type="submit" className="w-full" disabled={createTransaction.isPending || createCategory.isPending}>
            {createTransaction.isPending ? 'Saving...' : 'Add Transaction'}
          </GlassButton>
        </form>
      </Modal>
    </div>
  );
}
