import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MinusCircle, PenSquare, PiggyBank, PlusCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { api } from '../lib/api';
import { usePots } from '../lib/hooks';
import { formatCurrency } from '../lib/format';
import { DeleteAction } from '../components/delete-action';
import { ErrorState, Field, GlassButton, GlassCard, GlassInput, Modal, ProgressBar, SectionHeader, Skeleton } from '../components/ui';
import { useToast } from '../state/toast-context';

export function PotsPage() {
  const queryClient = useQueryClient();
  const { toastPromise } = useToast();
  const pots = usePots();
  const [showCompact, setShowCompact] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [form, setForm] = useState({ name: '', target: '', amount: '' });

  const closeModal = () => {
    setActiveModal(null);
    setForm({ name: '', target: '', amount: '' });
  };

  const openCreateModal = () => {
    setForm({ name: '', target: '', amount: '' });
    setActiveModal({ type: 'create' });
  };

  const openEditModal = (pot) => {
    setForm({ name: pot.name, target: String(pot.target), amount: '' });
    setActiveModal({ type: 'edit', id: pot._id, name: pot.name });
  };

  const openActionModal = (type, pot) => {
    setForm({ name: '', target: '', amount: '' });
    setActiveModal({ type, id: pot._id, name: pot.name });
  };

  const visiblePots = useMemo(() => {
    if (!showCompact) {
      return pots.data || [];
    }
    return (pots.data || []).slice(0, 2);
  }, [pots.data, showCompact]);

  const upsertPot = useMutation({
    mutationFn: async (payload) => {
      if (payload.type === 'create') {
        return api('/pots', {
          method: 'POST',
          body: JSON.stringify({
            name: payload.name,
            target: Number(payload.target),
            saved: 0,
          }),
        });
      }

      if (payload.type === 'edit') {
        return api(`/pots/${payload.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: payload.name,
            target: Number(payload.target),
          }),
        });
      }

      return api(`/pots/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          amount: Number(payload.amount),
          action: payload.type,
        }),
      });
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['pots'] });
      const previous = queryClient.getQueryData(['pots']);

      queryClient.setQueryData(['pots'], (current = []) => {
        if (payload.type === 'create') {
          return current;
        }

        return current.map((pot) => {
          if (pot._id !== payload.id) {
            return pot;
          }

          if (payload.type === 'edit') {
            const nextTarget = Number(payload.target);
            return {
              ...pot,
              name: payload.name,
              target: nextTarget,
              saved: Math.min(pot.saved, nextTarget),
            };
          }

          const nextSaved =
            payload.type === 'withdraw'
              ? Math.max(pot.saved - Number(payload.amount), 0)
              : Math.min(pot.saved + Number(payload.amount), pot.target);

          return { ...pot, saved: nextSaved };
        });
      });

      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['pots'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pots'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
    },
  });

  const deletePot = useMutation({
    mutationFn: (potId) =>
      api(`/pots/${potId}`, {
        method: 'DELETE',
      }),
  });

  const handleDeletePot = async (pot) => {
    await toastPromise(
      async () => {
        const result = await deletePot.mutateAsync(pot._id);
        queryClient.invalidateQueries({ queryKey: ['pots'] });
        queryClient.invalidateQueries({ queryKey: ['overview'] });
        return result;
      },
      {
        loading: `Deleting ${pot.name}...`,
        success: 'Pot deleted',
        successDescription: `${pot.name} was removed.`,
        error: 'Could not delete pot',
      },
    );
  };

  if (pots.error) {
    return <ErrorState message={pots.error.message} />;
  }

  const submitModal = async (event) => {
    event.preventDefault();

    if (activeModal?.type === 'create') {
      await upsertPot.mutateAsync({ type: 'create', name: form.name, target: form.target });
      closeModal();
      return;
    }

    if (activeModal?.type === 'edit') {
      await upsertPot.mutateAsync({ type: 'edit', id: activeModal.id, name: form.name, target: form.target });
      closeModal();
      return;
    }

    await upsertPot.mutateAsync({ type: activeModal.type, id: activeModal.id, amount: form.amount });
    closeModal();
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Pots</h1>
          <p className="mt-2 text-sm text-finance-muted">Manage savings goals with instant UI updates.</p>
        </div>
        <GlassButton className="w-full sm:w-auto" onClick={openCreateModal}>
          <PlusCircle size={16} />
          Add new Pot
        </GlassButton>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pots.isLoading ? (
          <>
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </>
        ) : (
          visiblePots.map((pot) => {
            const progress = pot.target ? Math.min((pot.saved / pot.target) * 100, 100) : 0;
            const isFull = progress >= 100;

            return (
              <GlassCard key={pot._id}>
                <SectionHeader
                  title={pot.name}
                  icon={PiggyBank}
                  subtitle={`Target: ${formatCurrency(pot.target)}`}
                  action={
                    <div className="flex items-center gap-1">
                      <GlassButton
                        type="button"
                        className="border-finance-line bg-finance-paper px-2.5 sm:px-3 py-2 text-finance-text text-xs sm:text-sm"
                        onClick={() => openEditModal(pot)}
                      >
                        <PenSquare size={14} className="sm:size-[15px]" />
                        <span className="hidden sm:inline">Edit</span>
                      </GlassButton>
                      <DeleteAction
                        label={`Delete pot ${pot.name}`}
                        onClick={() => {
                          void handleDeletePot(pot);
                        }}
                        disabled={deletePot.isPending && deletePot.variables === pot._id}
                        busy={deletePot.isPending && deletePot.variables === pot._id}
                      />
                    </div>
                  }
                />
                <div className="space-y-3">
                  <p className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.04em]">{formatCurrency(pot.saved)}</p>
                  <p className="text-sm text-finance-muted">Progress: {Math.round(progress)}%</p>
                  <ProgressBar value={progress} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <GlassButton
                      onClick={() => openActionModal('add', pot)}
                      disabled={isFull}
                      className={isFull ? 'line-through decoration-[1.5px] opacity-100' : ''}
                    >
                      <PlusCircle size={16} />
                      Add Money
                    </GlassButton>
                    <GlassButton onClick={() => openActionModal('withdraw', pot)}>
                      <MinusCircle size={16} />
                      Withdraw
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      <div className="md:hidden">
        <GlassButton className="w-full" onClick={() => setShowCompact((value) => !value)}>
          {showCompact ? 'Show All Pots' : 'Minimize Menu'}
        </GlassButton>
      </div>

      <Modal
        open={Boolean(activeModal)}
        title={
          activeModal?.type === 'create'
            ? 'Add new Pot'
            : activeModal?.type === 'edit'
              ? `Edit Pot • ${activeModal?.name || ''}`
              : `${activeModal?.type === 'withdraw' ? 'Withdraw' : 'Add Money'} • ${activeModal?.name || ''}`
        }
        onClose={closeModal}
      >
        <form className="space-y-4" onSubmit={submitModal}>
          {activeModal?.type === 'create' || activeModal?.type === 'edit' ? (
            <>
              <Field label="Pot Name">
                <GlassInput value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              </Field>
              <Field label="Target Amount">
                <GlassInput
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.target}
                  onChange={(event) => setForm((current) => ({ ...current, target: event.target.value }))}
                  required
                />
              </Field>
            </>
          ) : (
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
          )}
          <GlassButton type="submit" className="w-full" disabled={upsertPot.isPending}>
            {upsertPot.isPending ? 'Saving...' : activeModal?.type === 'edit' ? 'Update Pot' : 'Submit'}
          </GlassButton>
        </form>
      </Modal>
    </div>
  );
}
