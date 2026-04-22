import { Bill, Budget, Pot, Transaction } from './models.js';

export async function syncModelIndexes() {
  await Promise.all([
    Transaction.syncIndexes(),
    Budget.syncIndexes(),
    Pot.syncIndexes(),
    Bill.syncIndexes(),
  ]);
}
