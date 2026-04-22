import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MinusCircle, PiggyBank, PlusCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { api } from '../lib/api';
import { usePots } from '../lib/hooks';
import { formatCurrency } from '../lib/format';
import { ErrorState, Field, GlassButton, GlassCard, GlassInput, Modal, ProgressBar, SectionHeader, Skeleton } from '../components/ui';

export function PotsPage() {
  const queryClient = useQueryClient();
  const pots = usePots();
  const [showCompact, setShowCompact] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [form, setForm] = useState({ name: '', target: '', amount: '' });

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

          const nextSaved =
            payload.type === 'withdraw' ? Math.max(pot.saved - Number(payload.amount), 0) : pot.saved + Number(payload.amount);

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

  if (pots.error) {
    return <ErrorState message={pots.error.message} />;
  }

  const submitModal = async (event) => {
    event.preventDefault();

    if (activeModal?.type === 'create') {
      await upsertPot.mutateAsync({ type: 'create', name: form.name, target: form.target });
      setForm({ name: '', target: '', amount: '' });
      setActiveModal(null);
      return;
    }

    await upsertPot.mutateAsync({ type: activeModal.type, id: activeModal.id, amount: form.amount });
    setForm((current) => ({ ...current, amount: '' }));
    setActiveModal(null);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Pots</h1>
          <p className="mt-2 text-sm text-finance-muted">Manage savings goals with instant UI updates.</p>
        </div>
        <GlassButton className="w-full sm:w-auto" onClick={() => setActiveModal({ type: 'create' })}>
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

            return (
              <GlassCard key={pot._id}>
                <SectionHeader title={pot.name} icon={PiggyBank} subtitle={`Target: ${formatCurrency(pot.target)}`} />
                <div className="space-y-3">
                  <p className="font-display text-3xl font-bold tracking-[-0.04em]">{formatCurrency(pot.saved)}</p>
                  <p className="text-sm text-finance-muted">Progress: {Math.round(progress)}%</p>
                  <ProgressBar value={progress} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <GlassButton onClick={() => setActiveModal({ type: 'add', id: pot._id, name: pot.name })}>
                      <PlusCircle size={16} />
                      Add Money
                    </GlassButton>
                    <GlassButton onClick={() => setActiveModal({ type: 'withdraw', id: pot._id, name: pot.name })}>
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
        title={activeModal?.type === 'create' ? 'Add new Pot' : `${activeModal?.type === 'withdraw' ? 'Withdraw' : 'Add Money'} • ${activeModal?.name || ''}`}
        onClose={() => setActiveModal(null)}
      >
        <form className="space-y-4" onSubmit={submitModal}>
          {activeModal?.type === 'create' ? (
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
            {upsertPot.isPending ? 'Saving...' : 'Submit'}
          </GlassButton>
        </form>
      </Modal>
    </div>
  );
}
