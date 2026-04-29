import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PenSquare, PlusCircle, Wallet2, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api';
import { budgetThemes, getBudgetTheme } from '../lib/budget-themes';
import { useBudgets, useCategories, useTransactions } from '../lib/hooks';
import { formatCurrency, formatShortDate } from '../lib/format';
import {
  ErrorState,
  Field,
  GlassButton,
  GlassCard,
  GlassInput,
  HelperText,
  Modal,
  PeriodSelector,
  SectionHeader,
  SelectField,
  Skeleton,
} from '../components/ui';
import { DeleteAction } from '../components/delete-action';
import { usePeriod } from '../state/period-context';
import { useToast } from '../state/toast-context';

function getInitialForm() {
  return {
    category: '',
    maximum: '',
    theme: '',
  };
}

export function BudgetsPage() {
  const queryClient = useQueryClient();
  const { toastPromise } = useToast();
  const { month, year } = usePeriod();
  const budgets = useBudgets();
  const categories = useCategories();
  const spending = useTransactions({ type: 'expense', limit: 5, sort: 'latest', page: 1 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [form, setForm] = useState(getInitialForm);

  const categoryOptions = categories.data?.map((item) => item.name) || [];
  const selectedTheme = getBudgetTheme(form.theme);

  const invalidateAppData = () => {
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
    queryClient.invalidateQueries({ queryKey: ['overview'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const resetModalState = () => {
    setForm(getInitialForm());
    setNewCategoryName('');
    setShowNewCategoryInput(false);
    setEditingBudget(null);
  };

  const closeAddModal = () => {
    resetModalState();
    setShowAddModal(false);
  };

  const closeEditModal = () => {
    resetModalState();
  };

  const openAddModal = () => {
    resetModalState();
    setShowAddModal(true);
  };

  const openEditModal = (budget) => {
    setShowAddModal(false);
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    setEditingBudget(budget);
    setForm({
      category: budget.category,
      maximum: String(budget.maximum),
      theme: budget.theme || 'cyan',
    });
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

  const createBudget = useMutation({
    mutationFn: (payload) =>
      api('/budgets', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      invalidateAppData();
      closeAddModal();
    },
  });

  const updateBudget = useMutation({
    mutationFn: ({ id, payload }) =>
      api(`/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      invalidateAppData();
      closeEditModal();
    },
  });

  const deleteBudget = useMutation({
    mutationFn: (budgetId) =>
      api(`/budgets/${budgetId}`, {
        method: 'DELETE',
      }),
  });

  if (budgets.error) {
    return <ErrorState message={budgets.error.message} />;
  }

  if (categories.error) {
    return <ErrorState message={categories.error.message} />;
  }

  if (spending.error) {
    return <ErrorState message={spending.error.message} />;
  }

  const periodLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));

  const submitBudget = (mode) => {
    const payload = {
      category: form.category,
      maximum: Number(form.maximum),
      spent: editingBudget?.spent || 0,
      month,
      year,
      theme: form.theme,
    };

    if (mode === 'edit' && editingBudget) {
      updateBudget.mutate({ id: editingBudget._id, payload });
      return;
    }

    createBudget.mutate(payload);
  };

  const handleDeleteBudget = async (budget) => {
    await toastPromise(
      async () => {
        const result = await deleteBudget.mutateAsync(budget._id);
        invalidateAppData();
        return result;
      },
      {
        loading: `Deleting ${budget.category} budget...`,
        success: 'Budget deleted',
        successDescription: `${budget.category} budget was removed.`,
        error: 'Could not delete budget',
      },
    );
  };

  const isSubmitting = createBudget.isPending || updateBudget.isPending;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="mt-2 text-sm text-finance-muted">Track category maximums against live spending totals for {periodLabel}.</p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelector />
          <GlassButton className="sm:w-auto" onClick={openAddModal}>
            <PlusCircle size={16} />
            Add New Budget
          </GlassButton>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
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
              budgets.data.map((budget) => {
                const theme = getBudgetTheme(budget.theme);

                return (
                  <article key={budget._id} className="rounded-2xl border border-finance-line bg-finance-paper p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-full ${theme.dotClassName}`} />
                          <h3 className="font-medium text-finance-text">{budget.category}</h3>
                        </div>
                        <p className="mt-1 text-sm text-finance-muted">Maximum: {formatCurrency(budget.maximum)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${budget.remaining < 0 ? 'text-finance-red' : 'text-finance-text'}`}>
                          Remaining: {formatCurrency(budget.remaining)}
                        </p>
                        <GlassButton
                          type="button"
                          className="border-finance-line bg-finance-paper px-3 py-2 text-finance-text"
                          onClick={() => openEditModal(budget)}
                        >
                          <PenSquare size={15} />
                          Edit
                        </GlassButton>
                        <DeleteAction
                          label={`Delete budget for ${budget.category}`}
                          onClick={() => {
                            void handleDeleteBudget(budget);
                          }}
                          disabled={deleteBudget.isPending && deleteBudget.variables === budget._id}
                          busy={deleteBudget.isPending && deleteBudget.variables === budget._id}
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-finance-muted">
                      <div className="flex items-center justify-between gap-3">
                        <p>Spent: {formatCurrency(budget.spent)}</p>
                        <p className="inline-flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${theme.dotClassName}`} />
                          {theme.label}
                        </p>
                      </div>
                      <div className="h-2 rounded-full bg-finance-line">
                        <div className={`h-2 rounded-full ${theme.progressClassName}`} style={{ width: `${Math.min(budget.progress, 100)}%` }} />
                      </div>
                    </div>
                  </article>
                );
              })
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
                <article key={item._id} className="rounded-2xl border border-finance-line bg-finance-paper p-4">
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

      <BudgetModal
        open={showAddModal}
        title="Add New Budget"
        description="Choose a category to set a spending budget. These categories can help you monitor spending."
        form={form}
        setForm={setForm}
        categoryOptions={categoryOptions}
        selectedTheme={selectedTheme}
        showNewCategoryInput={showNewCategoryInput}
        setShowNewCategoryInput={setShowNewCategoryInput}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        createCategory={createCategory}
        submitError={createBudget.error}
        isSubmitting={isSubmitting}
        onClose={closeAddModal}
        onSubmit={(event) => {
          event.preventDefault();
          submitBudget('create');
        }}
        submitLabel={createBudget.isPending ? 'Saving...' : 'Add Budget'}
      />

      <BudgetModal
        open={Boolean(editingBudget)}
        title="Edit Budget"
        description="Update the category, maximum spend, or theme to keep this budget aligned with your spending plan."
        form={form}
        setForm={setForm}
        categoryOptions={categoryOptions}
        selectedTheme={selectedTheme}
        showNewCategoryInput={showNewCategoryInput}
        setShowNewCategoryInput={setShowNewCategoryInput}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        createCategory={createCategory}
        submitError={updateBudget.error}
        isSubmitting={isSubmitting}
        onClose={closeEditModal}
        onSubmit={(event) => {
          event.preventDefault();
          submitBudget('edit');
        }}
        submitLabel={updateBudget.isPending ? 'Saving...' : 'Update Budget'}
      />
    </div>
  );
}

function BudgetModal({
  open,
  title,
  description,
  form,
  setForm,
  categoryOptions,
  selectedTheme,
  showNewCategoryInput,
  setShowNewCategoryInput,
  newCategoryName,
  setNewCategoryName,
  createCategory,
  submitError,
  isSubmitting,
  onClose,
  onSubmit,
  submitLabel,
}) {
  return (
    <Modal open={open} title={title} description={description} onClose={onClose} maxWidthClassName="max-w-xl">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-3">
          <Field label="Budget Category">
            <SelectField
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              required
            >
              <option value="" disabled>
                Select A Budget Category
              </option>
              {categoryOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>
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
                <GlassInput value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} placeholder="New category name" />
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

        <Field label="Maximum Spend">
          <GlassInput
            type="number"
            min="0.01"
            step="0.01"
            value={form.maximum}
            onChange={(event) => setForm((current) => ({ ...current, maximum: event.target.value }))}
            placeholder="e.g. 2000"
            required
          />
        </Field>

        <Field label="Theme">
          <div className="relative">
            {form.theme ? <span className={`pointer-events-none absolute left-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ${selectedTheme.dotClassName}`} /> : null}
            <SelectField
              value={form.theme}
              onChange={(event) => setForm((current) => ({ ...current, theme: event.target.value }))}
              className={form.theme ? 'pl-10' : ''}
              required
            >
              <option value="" disabled>
                Select A Theme
              </option>
              {budgetThemes.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </SelectField>
          </div>
          <HelperText>Theme controls the budget accent color throughout the budget views.</HelperText>
        </Field>

        {submitError ? <ErrorState message={submitError.message} /> : null}

        <GlassButton type="submit" className="w-full" disabled={isSubmitting || createCategory.isPending}>
          {submitLabel}
        </GlassButton>
      </form>
    </Modal>
  );
}
