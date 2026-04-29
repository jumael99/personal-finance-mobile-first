import { Bill, BillTemplate } from './models.js';

export async function migrateRecurringBills() {
  try {
    // Find all recurring bills grouped by userId, title, and amount
    const recurringBills = await Bill.find({ isRecurring: true }).lean();

    if (recurringBills.length === 0) {
      return;
    }

    // Group by userId + title + amount to deduplicate
    const groups = new Map();

    for (const bill of recurringBills) {
      const key = `${bill.userId}::${bill.title}::${bill.amount}`;

      if (!groups.has(key)) {
        groups.set(key, bill);
      }
    }

    let created = 0;

    for (const bill of groups.values()) {
      const dayOfMonth = new Date(bill.dueDate).getDate();

      const existing = await BillTemplate.findOne({
        userId: bill.userId,
        title: bill.title,
      });

      if (!existing) {
        await BillTemplate.create({
          userId: bill.userId,
          title: bill.title,
          amount: bill.amount,
          dayOfMonth,
        });
        created++;
      }
    }

    if (created > 0) {
      console.log(`Migrated ${created} recurring bills to templates`);
    }
  } catch (error) {
    console.error('Recurring bill migration failed:', error.message);
  }
}
