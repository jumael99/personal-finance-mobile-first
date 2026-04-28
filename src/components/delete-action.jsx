import { Trash2 } from 'lucide-react';

export function DeleteAction({ label, onClick, disabled = false, busy = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="group inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-finance-line bg-finance-paper/85 text-[#97959f] transition duration-200 hover:border-finance-red/25 hover:bg-finance-red/10 hover:text-finance-red disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash2 size={17} className={busy ? 'animate-pulse text-finance-red' : 'text-current'} />
    </button>
  );
}
