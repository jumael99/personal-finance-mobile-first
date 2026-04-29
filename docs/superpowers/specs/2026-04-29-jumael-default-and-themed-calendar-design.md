# Jumael Default and Themed Calendar Design

## Summary

Add a reusable themed date picker across the app and prefill new sender/recipient-style transaction forms with `Jumael`. Keep the current API contract and database schema unchanged. Existing saved records remain untouched.

## Goals

- Prefill new transaction sender/recipient inputs with `Jumael`
- Keep the field editable before save
- Replace native browser date inputs with a custom calendar that matches the app theme
- Add a visible date field to the transaction modal
- Preserve the existing request payload shape and backend behavior

## Non-Goals

- No migration of existing saved transaction names
- No backend schema changes
- No edit-transaction feature
- No change to the balance source default of `Manual Balance Top-up`

## Current State

- Transactions already store a date in form state, but the add-transaction modal does not expose a visible date field (`src/pages/transactions-page.jsx`)
- Overview balance form uses a native `type="date"` input (`src/pages/overview-page.jsx`)
- Bills form uses a native `type="date"` input (`src/pages/bills-page.jsx`)
- Transaction sender/recipient currently starts empty for new transactions (`src/pages/transactions-page.jsx`)
- The backend already accepts and persists transaction `senderRecipient`, transaction `date`, and bill `dueDate` without needing contract changes (`server/models.js`, `server/routes.js`)

## Recommended Approach

Use a reusable frontend date picker component built on `react-day-picker` and style it to match the existing finance theme.

### Why this approach

- Gives a modern, consistent calendar UI across the app
- Avoids hand-rolling calendar math and accessibility details
- Keeps the implementation focused on styling and integration instead of rebuilding date logic
- Minimizes backend risk by preserving the current payload format

## Architecture

### Backend

No backend changes.

The frontend will continue submitting date values in the same format already used by the current forms. Transactions will still send `date`, bills will still send `dueDate`, and the server will continue storing them in the existing Mongoose models.

### Frontend

Add a reusable date picker component and use it in all visible date-entry flows:

- Transaction modal date field
- Overview add-balance date field
- Bills due date field

Add a shared constant or helper for the default transaction counterparty name:

- New transaction form default sender/recipient: `Jumael`
- Overview balance source remains `Manual Balance Top-up`

## Components and File Responsibilities

### New files

- `src/components/date-picker-field.jsx`
  - Reusable controlled date picker field
  - Renders a styled trigger/input shell and themed `react-day-picker` calendar popover
  - Accepts a string value plus an `onChange` callback returning the normalized string value

- `src/lib/date-picker.js`
  - Shared date conversion helpers between `Date` objects and `YYYY-MM-DD` strings
  - Validation helpers for empty or invalid dates

- `src/lib/form-defaults.js`
  - Shared constants/helpers for frontend form defaults
  - Includes the `Jumael` transaction sender/recipient default

### Modified files

- `src/pages/transactions-page.jsx`
  - Change initial sender/recipient value from empty string to `Jumael`
  - Add visible date field to the transaction modal
  - Keep submitted payload shape unchanged

- `src/pages/overview-page.jsx`
  - Keep `senderRecipient` default as `Manual Balance Top-up`
  - Replace native balance date input with reusable themed date picker

- `src/pages/bills-page.jsx`
  - Replace native due date input with reusable themed date picker

- `src/styles.css`
  - Add component-level styles for the themed calendar popover and day states

- `package.json`
  - Add `react-day-picker` dependency

## UX Design

### Calendar behavior

- Clicking the date field opens a themed calendar popover
- The calendar opens to the currently selected date when present
- If no date is selected, it opens to the current month
- Selecting a day updates the parent form state and closes the popover
- The selected date remains displayed in the field using a readable formatted label
- The stored form value stays normalized to `YYYY-MM-DD`

### Visual direction

The calendar should visually match the existing app language:

- glass/paper surfaces
- rounded corners
- finance theme colors from Tailwind tokens
- subtle shadows and muted borders
- clear selected/today states
- mobile-friendly tap targets

### Default-name behavior

- New transaction modal opens with `Jumael` prefilled
- Users can freely edit the field before submit
- Resetting/closing and reopening the transaction modal restores the default `Jumael`
- Existing transaction rows and stored values are not rewritten

### Overview balance form

- Source remains `Manual Balance Top-up`
- Only the date input UI changes

## Data Flow

### Transaction flow

1. Open add-transaction modal
2. Initialize form with:
   - `senderRecipient: 'Jumael'`
   - current date string for `date`
3. User optionally edits the name and/or date
4. Submit existing payload shape to `/transactions`

### Overview balance flow

1. Open add-balance modal
2. Initialize form with:
   - `senderRecipient: 'Manual Balance Top-up'`
   - current date string for `date`
3. User picks a date via custom calendar
4. Submit existing payload shape to `/transactions`

### Bills flow

1. Open add-bill modal
2. User picks due date via custom calendar
3. Submit existing payload shape to `/bills`

## Error Handling and Edge Cases

- Invalid or empty date values should not be emitted from the picker as a valid selection
- If a field somehow has no valid date string, the calendar should fall back to the current month
- Selecting a date should not break modal layout or scrolling on mobile
- Existing server-side validation remains the final guard for required fields
- If users never edit the default transaction name, the saved value will be `Jumael` by design
- Existing stored transaction names continue rendering exactly as saved

## Accessibility

- Calendar trigger remains keyboard reachable
- Selected date state should be visually clear
- Popover should be usable inside existing modal layouts without trapping or hiding important controls
- Use the accessible defaults provided by `react-day-picker` rather than rebuilding keyboard behavior manually

## Testing and Verification

### Functional verification

- Add a new transaction and confirm the sender/recipient starts as `Jumael`
- Edit the transaction sender/recipient and confirm the edited value is saved instead of being overwritten
- Close and reopen the transaction modal and confirm `Jumael` is restored as the default
- Add a new transaction with a custom selected date and confirm it saves correctly
- Add balance and confirm the source remains `Manual Balance Top-up`
- Add balance with a selected date and confirm it saves correctly
- Add a bill with a selected due date and confirm it saves correctly

### Regression verification

- Existing transaction lists still render sender/recipient names and dates correctly
- Overview page still renders recent transactions and bills correctly
- Bills page sorting/filtering still works after creating a bill with the custom date picker
- Budget and overview calculations continue working because transaction payload structure is unchanged

## Risks and Mitigations

### Risk: calendar styling feels disconnected from the app
Mitigation: style the shared component with existing finance color tokens and glass surfaces in `src/styles.css`

### Risk: date conversion bugs between UI and payload
Mitigation: centralize parsing/formatting in `src/lib/date-picker.js` instead of repeating conversion logic in each form

### Risk: inconsistent defaults between forms
Mitigation: centralize the transaction default name in `src/lib/form-defaults.js`

## Implementation Readiness

This design is scoped to a single frontend feature set:

- one new shared date picker component
- one small shared defaults helper
- one small shared date helper module
- targeted page integrations
- no API or schema work

It is ready to move into implementation planning once reviewed.
