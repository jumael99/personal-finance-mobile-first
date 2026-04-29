import 'react-day-picker/style.css';
import { Calendar } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { dateStringToDate, dateToDateString, formatDateDisplay } from '../lib/date-picker';

export function DatePickerField({ value, onChange, required = false }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const popoverRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const selected = dateStringToDate(value);
  const display = formatDateDisplay(value);

  const handleSelect = (date) => {
    onChange(dateToDateString(date));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="glass touch-target interactive flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-finance-text"
      >
        <Calendar size={18} className="shrink-0 text-finance-muted" />
        <span className={value ? 'text-finance-text' : 'text-finance-muted'}>{display}</span>
      </button>

      {required && <input type="text" required value={value} readOnly className="sr-only" tabIndex={-1} />}

      {open && (
        <>
          <div ref={popoverRef} className="calendar-popover">
            <div className="calendar-card">
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={handleSelect}
                defaultMonth={selected || new Date()}
              />
            </div>
          </div>
          <div aria-hidden="true" className="h-[22rem]" />
        </>
      )}
    </div>
  );
}
