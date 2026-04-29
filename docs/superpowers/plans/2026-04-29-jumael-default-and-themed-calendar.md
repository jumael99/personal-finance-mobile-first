# Jumael Default and Themed Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable themed date picker across all date-entry forms and prefill new transaction sender/recipient with 'Jumael'.

**Architecture:** Create a shared `DatePickerField` component wrapping `react-day-picker` v9 styled with the app's glassmorphism theme. Add `src/lib/form-defaults.js` for the shared default name and `src/lib/date-picker.js` for date conversion helpers. Replace all native `<input type="date">` fields and add the missing date field to the transaction modal. No backend changes.

**Tech Stack:** React 18, react-day-picker v9, date-fns v4, Tailwind CSS 3, Vite

---

### Task 1: Install react-day-picker and create shared helpers

**Files:**
- Modify: `package.json`
- Create: `src/lib/date-picker.js`
- Create: `src/lib/form-defaults.js`

- [ ] **Step 1: Install react-day-picker**

```bash
npm install react-day-picker
```
Run: `npm install react-day-picker`
Expected: package.json updated with `"react-day-picker": "^9.x"` or similar

- [ ] **Step 2: Create date-picker helper lib**

Create file `src/lib/date-picker.js`:

```js
import { format, parse, isValid } from 'date-fns';

/**
 * Convert a YYYY-MM-DD string to a Date object.
 * Returns undefined if the string is empty or invalid so react-day-picker
 * shows no selection (consistent with the existing empty-string initial state).
 */
export function dateStringToDate(str) {
  if (!str) return undefined;
  const parsed = parse(str, 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : undefined;
}

/**
 * Convert a Date object (or undefined) back to YYYY-MM-DD string.
 * Returns empty string when undefined so form state stays a string.
 */
export function dateToDateString(date) {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format a YYYY-MM-DD string for display in the trigger button.
 * e.g. "2025-03-15" → "15 Mar 2025"
 */
export function formatDateDisplay(str) {
  const d = dateStringToDate(str);
  return d ? format(d, 'dd MMM yyyy') : 'Pick a date';
}
```

- [ ] **Step 3: Create form-defaults lib**

Create file `src/lib/form-defaults.js`:

```js
export const DEFAULT_SENDER_RECIPIENT = 'Jumael';
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/date-picker.js src/lib/form-defaults.js
git commit -m "feat: add react-day-picker dependency and shared date/defaults helpers"
```

---

### Task 2: Create the themed DatePickerField component

**Files:**
- Create: `src/components/date-picker-field.jsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Add calendar CSS to styles.css**

Append to `src/styles.css`:

```css
/* ── Themed Calendar ── */
.calendar-popover {
  @apply absolute left-0 z-50 mt-2;
}

.calendar-card {
  @apply glass rounded-2xl p-4;
  background: #FFFFFF;
  box-shadow: 0 16px 48px rgba(39, 39, 48, 0.14), 0 0 0 1px rgba(0,0,0,0.04);
}

/* Override react-day-picker's default look */
.calendar-card .rdp-root {
  --rdp-accent-color: #201F24;
  --rdp-accent-background-color: #201F24;
  --rdp-day-width: 40px;
  --rdp-day-height: 40px;
  --rdp-font-family: 'Inter', sans-serif;
}

.calendar-card .rdp-day_button {
  @apply rounded-xl text-sm font-medium transition-colors;
  color: #201F24;
}

.calendar-card .rdp-day_button:hover {
  background: #F3F3F3;
}

.calendar-card .rdp-selected .rdp-day_button {
  background: #201F24;
  color: #FFFFFF;
}

.calendar-card .rdp-today .rdp-day_button {
  box-shadow: inset 0 0 0 2px #82C9D7;
}

.calendar-card .rdp-month_caption {
  @apply px-1 py-2;
}

.calendar-card .rdp-month_caption_label {
  @apply text-sm font-semibold text-finance-text;
}

.calendar-card .rdp-weekday {
  @apply text-xs font-medium text-finance-muted;
}

.calendar-card .rdp-nav_button {
  @apply grid h-9 w-9 place-items-center rounded-xl text-finance-muted transition-colors hover:bg-finance-line hover:text-finance-text;
}

.calendar-card .rdp-nav_button svg {
  width: 16px;
  height: 16px;
}

.calendar-card .rdp-range_start .rdp-day_button,
.calendar-card .rdp-range_end .rdp-day_button {
  background: #201F24;
  color: #FFFFFF;
}

.calendar-card .rdp-range_middle .rdp-day_button {
  background: #F3F3F3;
  border-radius: 0;
}
```

- [ ] **Step 2: Create DatePickerField component**

Create file `src/components/date-picker-field.jsx`:

```jsx
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
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
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
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/date-picker-field.jsx src/styles.css
git commit -m "feat: add themed DatePickerField component with glassmorphism calendar"
```

---

### Task 3: Integrate into transactions page (date field + Jumael default)

**Files:**
- Modify: `src/pages/transactions-page.jsx`

- [ ] **Step 1: Update imports and `getInitialForm`**

In `src/pages/transactions-page.jsx`, change the import block (lines 1-21) to add the new imports:

```jsx
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
  RadioCard,
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
```

Change `getInitialForm` (lines 23-32) to use the default:

```jsx
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
```

- [ ] **Step 2: Add the Date field to the form**

Insert a `Field` with `DatePickerField` after the Recipient/Sender field (after line 251). The form section should look like:

```jsx
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
```

Insert these lines between the existing `</Field>` on line 251 (closing of Recipient / Sender Name) and the `<div className="space-y-3">` on line 253 (Category section).

- [ ] **Step 3: Commit**

```bash
git add src/pages/transactions-page.jsx
git commit -m "feat: add date field to transaction modal and default senderRecipient to Jumael"
```

---

### Task 4: Integrate into overview page (replace native date input)

**Files:**
- Modify: `src/pages/overview-page.jsx`

- [ ] **Step 1: Update imports**

In `src/pages/overview-page.jsx`, add `DatePickerField` to the component imports (line 9):

```jsx
import { BillsList, DonutProgress, ErrorState, Field, GlassButton, GlassCard, GlassInput, MetricCard, Modal, SectionHeader, Skeleton, TransactionRows } from '../components/ui';
import { DatePickerField } from '../components/date-picker-field';
```

- [ ] **Step 2: Replace the native date input**

Replace lines 245-252 (the `<Field label="Date">` block with the native `<GlassInput type="date">`) with:

```jsx
          <Field label="Date">
            <DatePickerField
              value={form.date}
              onChange={(newDate) => setForm((current) => ({ ...current, date: newDate }))}
              required
            />
          </Field>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/overview-page.jsx
git commit -m "feat: replace native date input with DatePickerField in overview balance form"
```

---

### Task 5: Integrate into bills page (replace native date input)

**Files:**
- Modify: `src/pages/bills-page.jsx`

- [ ] **Step 1: Update imports**

In `src/pages/bills-page.jsx`, add `DatePickerField` to the component imports (line 9):

```jsx
import { BillsList, ErrorState, Field, GlassButton, GlassCard, GlassInput, GlassSelect, Modal, SectionHeader, Skeleton } from '../components/ui';
import { DatePickerField } from '../components/date-picker-field';
```

- [ ] **Step 2: Replace the native date input**

Replace lines 148-150 (the `<Field label="Due Date">` block with `<GlassInput type="date">`) with:

```jsx
          <Field label="Due Date">
            <DatePickerField
              value={form.dueDate}
              onChange={(newDate) => setForm((current) => ({ ...current, dueDate: newDate }))}
              required
            />
          </Field>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/bills-page.jsx
git commit -m "feat: replace native date input with DatePickerField in bills form"
```

---

### Task 6: Verification

- [ ] **Step 1: Build check**

```bash
npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Step 2: Verify all integrations manually**

Start the dev server and check:
1. Open **Transactions** page → Add New Transaction → sender/recipient prefills `Jumael`
2. Transaction modal now has a visible **Date** field with the themed calendar
3. Click the date trigger → calendar popover opens, styled with glass theme
4. Pick a date → popover closes, date displays in trigger
5. Open **Overview** page → Add balance → Date field uses themed calendar (not native)
6. Source field still shows `Manual Balance Top-up`
7. Open **Bills** page → Add new bill → Due Date uses themed calendar (not native)
8. Submit forms with calendar-selected dates → transactions/bills save correctly
9. Close and reopen modals → defaults reset (`Jumael` for transactions, current date for all)
```

Run: manual verification in browser at http://localhost:5173

- [ ] **Step 3: Commit any final fixes**

```bash
git add -A
git commit -m "chore: final verification fixes"
```
