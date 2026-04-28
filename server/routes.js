import express from 'express';
import { requireAuth } from './auth.js';
import { monthDateRange, normalizeBillStatus, parseNumber, resolvePeriod } from './utils.js';
import { Bill, Budget, Category, Pot, Transaction } from './models.js';

export const router = express.Router();

function stripUserId(payload) {
  const { userId, ...safePayload } = payload;
  return safePayload;
}

async function ensureCategory(userId, name) {
  const normalizedName = String(name || '').trim();

  if (!normalizedName) {
    return null;
  }

  return Category.findOneAndUpdate(
    { userId, name: normalizedName },
    { $setOnInsert: { userId, name: normalizedName } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
}

router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

router.use(requireAuth);

router.get('/overview', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month, year } = resolvePeriod(req.query);
    const { start, end } = monthDateRange(month, year);
    const [transactions, pots, budgets, bills] = await Promise.all([
      Transaction.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: -1 }).lean(),
      Pot.find({ userId }).sort({ saved: -1 }).lean(),
      Budget.find({ userId, month, year }).sort({ category: 1 }).lean(),
      Bill.find({ userId, dueDate: { $gte: start, $lte: end } }).sort({ dueDate: 1 }).lean(),
    ]);

    const currentBalance = transactions.reduce((sum, item) => sum + item.amount, 0);
    const totalSpent = transactions.filter((item) => item.amount < 0).reduce((sum, item) => sum + Math.abs(item.amount), 0);
    const totalSaved = pots.reduce((sum, item) => sum + item.saved, 0);

    const upcomingBills = bills
      .map((bill) => ({ ...bill, computedStatus: normalizeBillStatus(bill) }))
      .filter((bill) => bill.computedStatus !== 'paid')
      .slice(0, 3);

    const budgetSpentByCategory = transactions
      .filter((item) => item.amount < 0)
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + Math.abs(item.amount);
        return acc;
      }, {});

    const budgetSummary = budgets.map((budget) => {
      const spent = budgetSpentByCategory[budget.category] || budget.spent || 0;
      return {
        ...budget,
        spent,
        remaining: budget.maximum - spent,
        progress: budget.maximum ? Math.min((spent / budget.maximum) * 100, 100) : 0,
      };
    });

    res.json({
      metrics: {
        currentBalance,
        totalSpent,
        totalSaved,
      },
      potSavings: {
        totalSaved,
        topPots: pots.slice(0, 3),
      },
      budgets: budgetSummary,
      bills: {
        totalUpcomingThisMonth: bills.reduce((sum, bill) => sum + bill.amount, 0),
        upcoming: upcomingBills,
      },
      transactions: {
        recent: transactions.slice(0, 5),
      },
      period: {
        month,
        year,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month, year } = resolvePeriod(req.query);
    const { start, end } = monthDateRange(month, year);
    const search = (req.query.search || '').trim();
    const sort = req.query.sort || 'latest';
    const category = req.query.category || '';
    const type = req.query.type || '';
    const page = Math.max(parseNumber(req.query.page, 1), 1);
    const limit = Math.max(parseNumber(req.query.limit, 10), 1);

    const query = { userId, date: { $gte: start, $lte: end } };

    if (search) {
      query.senderRecipient = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (type === 'expense') {
      query.amount = { $lt: 0 };
    } else if (type === 'income') {
      query.amount = { $gt: 0 };
    }

    const sortOptions = {
      latest: { date: -1 },
      oldest: { date: 1 },
      'a-z': { senderRecipient: 1 },
      'z-a': { senderRecipient: -1 },
      highest: { amount: -1 },
      lowest: { amount: 1 },
    };

    const [items, total, transactionCategories, budgetCategories, savedCategories] = await Promise.all([
      Transaction.find(query)
        .sort(sortOptions[sort] || sortOptions.latest)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(query),
      Transaction.distinct('category', { userId, date: { $gte: start, $lte: end } }),
      Budget.distinct('category', { userId }),
      Category.find({ userId }).sort({ name: 1 }).lean(),
    ]);

    const categories = [...new Set([...transactionCategories, ...budgetCategories, ...savedCategories.map((item) => item.name)])].sort((left, right) =>
      left.localeCompare(right),
    );

    res.json({
      items,
      categories: categories.sort(),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      period: {
        month,
        year,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/transactions', async (req, res, next) => {
  try {
    const payload = stripUserId(req.body);
    await ensureCategory(req.user.id, payload.category);
    const transaction = await Transaction.create({
      ...payload,
      userId: req.user.id,
    });
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

router.put('/transactions/:id', async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      stripUserId(req.body),
      { new: true, runValidators: true },
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.json(transaction);
  } catch (error) {
    return next(error);
  }
});

router.delete('/transactions/:id', async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get('/budgets', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month, year } = resolvePeriod(req.query);
    const { start, end } = monthDateRange(month, year);
    const [budgets, expenses] = await Promise.all([
      Budget.find({ userId, month, year }).sort({ category: 1 }).lean(),
      Transaction.find({ userId, amount: { $lt: 0 }, date: { $gte: start, $lte: end } }).lean(),
    ]);

    const spentByCategory = expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Math.abs(item.amount);
      return acc;
    }, {});

    res.json(
      budgets.map((budget) => {
        const spent = spentByCategory[budget.category] || budget.spent || 0;
        return {
          ...budget,
          spent,
          remaining: budget.maximum - spent,
          progress: budget.maximum ? Math.min((spent / budget.maximum) * 100, 100) : 0,
        };
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [savedCategories, budgetCategories, transactionCategories] = await Promise.all([
      Category.find({ userId }).sort({ name: 1 }).lean(),
      Budget.distinct('category', { userId }),
      Transaction.distinct('category', { userId }),
    ]);

    const categories = [...new Set([...savedCategories.map((item) => item.name), ...budgetCategories, ...transactionCategories])].sort((left, right) =>
      left.localeCompare(right),
    );

    res.json(categories.map((name) => ({ name })));
  } catch (error) {
    next(error);
  }
});

router.post('/categories', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = await ensureCategory(req.user.id, name);
    return res.status(201).json(category);
  } catch (error) {
    return next(error);
  }
});

router.post('/budgets', async (req, res, next) => {
  try {
    await ensureCategory(req.user.id, req.body?.category);
    const budget = await Budget.create({
      ...stripUserId(req.body),
      userId: req.user.id,
    });
    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
});

router.put('/budgets/:id', async (req, res, next) => {
  try {
    await ensureCategory(req.user.id, req.body?.category);
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      stripUserId(req.body),
      { new: true, runValidators: true },
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    return res.json(budget);
  } catch (error) {
    return next(error);
  }
});

router.delete('/budgets/:id', async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get('/pots', async (req, res, next) => {
  try {
    const pots = await Pot.find({ userId: req.user.id }).sort({ saved: -1 }).lean();
    res.json(pots);
  } catch (error) {
    next(error);
  }
});

router.post('/pots', async (req, res, next) => {
  try {
    const pot = await Pot.create({
      ...stripUserId(req.body),
      userId: req.user.id,
    });
    res.status(201).json(pot);
  } catch (error) {
    next(error);
  }
});

router.delete('/pots/:id', async (req, res, next) => {
  try {
    const pot = await Pot.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!pot) {
      return res.status(404).json({ message: 'Pot not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.put('/pots/:id', async (req, res, next) => {
  try {
    const { amount, action, saved, name, target } = stripUserId(req.body);
    const pot = await Pot.findOne({ _id: req.params.id, userId: req.user.id });

    if (!pot) {
      return res.status(404).json({ message: 'Pot not found' });
    }

    if (typeof name === 'string' && name.trim()) {
      pot.name = name.trim();
    }

    if (target !== undefined) {
      pot.target = Math.max(parseNumber(target, pot.target), 0);
    }

    if (typeof saved === 'number') {
      pot.saved = Math.min(Math.max(saved, 0), pot.target);
    } else {
      const delta = Math.abs(parseNumber(amount, 0));
      pot.saved = action === 'withdraw' ? Math.max(pot.saved - delta, 0) : Math.min(pot.saved + delta, pot.target);
    }

    await pot.save();
    return res.json(pot);
  } catch (error) {
    return next(error);
  }
});

router.get('/bills', async (req, res, next) => {
  try {
    const { month, year } = resolvePeriod(req.query);
    const { start, end } = monthDateRange(month, year);
    const search = (req.query.search || '').trim();
    const sort = req.query.sort || 'due-date';
    const query = { userId: req.user.id, dueDate: { $gte: start, $lte: end } };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const sortOptions = {
      'due-date': { dueDate: 1 },
      amount: { amount: -1 },
      title: { title: 1 },
    };

    const bills = await Bill.find(query).sort(sortOptions[sort] || sortOptions['due-date']).lean();

    res.json(
      bills.map((bill) => ({
        ...bill,
        computedStatus: normalizeBillStatus(bill),
      })),
    );
  } catch (error) {
    next(error);
  }
});

router.post('/bills', async (req, res, next) => {
  try {
    const bill = await Bill.create({
      ...stripUserId(req.body),
      userId: req.user.id,
    });
    res.status(201).json(bill);
  } catch (error) {
    next(error);
  }
});

router.put('/bills/:id', async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      stripUserId(req.body),
      { new: true, runValidators: true },
    );

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    return res.json(bill);
  } catch (error) {
    return next(error);
  }
});

router.delete('/bills/:id', async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});
