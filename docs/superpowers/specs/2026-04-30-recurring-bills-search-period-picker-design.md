# Design: Recurring Bills, Multi-field Search, and Period Picker Relocation

Date: 2026-04-30

## Overview

Three independent improvements to the personal finance app:

1. **Recurring bills template system** — bills auto-appear each month via templates
2. **Multi-field search** — search transactions and bills by any text field, not just name/title
3. **Period picker relocation** — move month selector from navbar into each page section

---

## Feature 1: Recurring Bills Template System

### Data Model

New model `BillTemplate` in `server/models.js`:

```
BillTemplate {
  userId:    String (indexed, required)
  title:     String (required, trimmed)
  amount:    Number (required, positive)
  dayOfMonth: Number (required, 1-31)
  timestamps: true
}
```

Existing `Bill` model stays unchanged as the monthly instance holder.

### How It Works

1. User creates a recurring bill → a `BillTemplate` is saved, and the first monthly `Bill` instance is created for the current period.
2. On `GET /api/bills`, the server finds all `BillTemplate` records, computes which `Bill` instances should exist for the requested month, and auto-creates any missing ones with `status: 'upcoming'` and `isRecurring: true`.
3. Marking a bill "paid" only updates that month's `Bill.status` — the template is untouched.
4. Editing a template updates the template and all future (unpaid) instances.
5. Deleting a template removes the template and all future instances. A past paid instance is preserved.

### Auto-generation Logic

```
For each BillTemplate:
  Compute day = min(template.dayOfMonth, daysInMonth(requestedYear, requestedMonth))
  Compute dueDate = new Date(requestedYear, requestedMonth - 1, day)
  Check if a Bill exists with matching userId, title, dueDate, and isRecurring: true
  If not, create: { userId, title, dueDate, amount: template.amount, isRecurring: true, status: 'upcoming' }
```

This runs on every `GET /api/bills` call — lightweight since it only creates missing instances per template per month.

### API Changes

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/bill-templates` | List all templates for user |
| `POST` | `/api/bill-templates` | Create template + first monthly instance |
| `PUT` | `/api/bill-templates/:id` | Update template, cascade to unpaid future instances |
| `DELETE` | `/api/bill-templates/:id` | Delete template + all unpaid future instances |
| `GET` | `/api/bills` | Unchanged signature, now auto-generates from templates |
| `PUT` | `/api/bills/:id` | Unchanged — marks individual instance as paid/upcoming |

### Frontend Changes

**Bills page (`bills-page.jsx`):**
- "Add Recurring Bill" modal changes:
  - When "Mark as recurring" checkbox is checked: the date picker toggles to a day-of-month selector (number input, 1-31)
  - When unchecked: full date picker remains (for one-off bills)
  - Submit goes to `POST /api/bill-templates` (recurring) or `POST /api/bills` (one-off)
- Bill creation goes through `POST /api/bill-templates` when `isRecurring` is checked
- One-off bills (non-recurring) still use `POST /api/bills` directly with a full date
- Delete recurring bill: confirmation warns "This removes all future instances. Past paid records are kept."
- Bill rows already show a "Recurring" badge — no change needed

**Hooks (`hooks.js`):**
- New `useBillTemplates()` hook
- `useBills()` unchanged

### Migration

On server start, run a one-time migration:
- For each unique `(userId, title, amount)` pair where `isRecurring: true` exists in the `Bill` collection, create a `BillTemplate` with `dayOfMonth` extracted from `dueDate`
- Use `$setOnInsert` / upsert pattern to make it idempotent

---

## Feature 2: Multi-field Search

### Transactions Search

Replace `server/routes.js` `GET /api/transactions` search logic:

**Before:** `query.senderRecipient = { $regex: search, $options: 'i' }`

**After:** Use `$or` across senderRecipient, category, and optionally amount:
```
if (search) {
  query.$or = [
    { senderRecipient: { $regex: search, $options: 'i' } },
    { category: { $regex: search, $options: 'i' } },
  ];
  const searchNum = Number(search);
  if (!Number.isNaN(searchNum)) {
    query.$or.push({ amount: searchNum });
  }
}
```

### Bills Search

Replace `GET /api/bills` search logic:

**Before:** `query.title = { $regex: search, $options: 'i' }`

**After:** Use `$or` across title and amount:
```
if (search) {
  query.$or = [
    { title: { $regex: search, $options: 'i' } },
  ];
  const searchNum = Number(search);
  if (!Number.isNaN(searchNum)) {
    query.$or.push({ amount: searchNum });
  }
}
```

### Frontend

No changes needed. The existing search inputs and dropdown filters continue working — search now matches broader fields while category/sort dropdowns remain as independent structured filters.

---

## Feature 3: Period Picker Relocation

### New Shared Component

Add `PeriodSelector` to `src/components/ui.jsx`:

```
< | April 2026 | >
```

- Left/right chevron buttons call `shiftMonth(-1)` / `shiftMonth(1)`
- Center label calls `goToCurrentMonth` on click
- Compact row layout, styled as a subtle chip (not a heavy navbar pill)
- Reads/writes from `PeriodContext`

### Page Placement

Add `PeriodSelector` to the header of each period-sensitive page, paired with the page title:

| Page | Placement |
|------|-----------|
| Overview | Right side of "Dashboard overview" header row |
| Transactions | Right side of "Transactions" header row |
| Budgets | Right side of "Budgets" header row |
| Bills | Right side of "Recurring Bills" header row |

### Navbar Changes

Remove from `app-shell.jsx`:
- Desktop: Delete the period control group (lines 88-113: chevrons + period label pill)
- Mobile: Delete the mobile period control group (lines 142-163)
- Keep the `usePeriod` import removed from app-shell since it's no longer used there

### State

`PeriodContext` and its shared state remain unchanged. All pages still sync to the same month. Only the location of the control changes.

---

## Implementation Order

1. **Multi-field search** — simplest, server-only change, immediate user benefit
2. **Period picker relocation** — moderate frontend change, no data model impact
3. **Recurring bills template system** — most complex, new model + routes + migration + frontend modal changes

---

## Testing

- **Search:** Verify searching by category name returns matching transactions. Verify numeric search matches amount. Verify search still works with combined sort/category filters.
- **Period picker:** Verify selector appears on each page. Verify month changes sync across pages. Verify navbar no longer shows period controls.
- **Recurring bills:** Verify templates auto-generate instances for new months. Verify marking paid doesn't affect template. Verify deleting template cleans up future instances. Verify migration runs correctly on existing data.
