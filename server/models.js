import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    senderRecipient: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    avatar: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
);

const categorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true, trim: true },
    maximum: { type: Number, required: true },
    spent: { type: Number, default: 0 },
    theme: { type: String, trim: true, default: 'cyan' },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000 },
  },
  { timestamps: true },
);

const potSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    target: { type: Number, required: true },
    saved: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

const billSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    isRecurring: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['paid', 'upcoming', 'missed'],
      default: 'upcoming',
    },
  },
  { timestamps: true },
);

budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
export const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);
export const Pot = mongoose.models.Pot || mongoose.model('Pot', potSchema);
export const Bill = mongoose.models.Bill || mongoose.model('Bill', billSchema);
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
