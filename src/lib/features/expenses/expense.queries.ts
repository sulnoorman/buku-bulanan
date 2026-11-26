import { db } from '$lib/server/db';
import { expenses } from './expense.schema';
import { cycles } from '../cycles/cycle.schema';
import { desc, eq, inArray, sql } from 'drizzle-orm';

const activeCycleIdSubquery = sql`(SELECT ${cycles.id} FROM ${cycles} WHERE ${cycles.status} = 'ACTIVE' LIMIT 1)`;

export async function getExpensesByCycle(cycleId: number) {
	return db
		.select()
		.from(expenses)
		.where(eq(expenses.cycleId, cycleId))
		.orderBy(desc(expenses.date), desc(expenses.id));
}

export async function getExpensesForActiveCycle() {
	return db
		.select()
		.from(expenses)
		.where(eq(expenses.cycleId, activeCycleIdSubquery))
		.orderBy(desc(expenses.date), desc(expenses.id));
}

export async function getExpensesByCycleIds(cycleIds: number[]) {
	if (cycleIds.length === 0) return [];
	return db
		.select()
		.from(expenses)
		.where(inArray(expenses.cycleId, cycleIds))
		.orderBy(desc(expenses.date), desc(expenses.id));
}

export async function createExpense(data: typeof expenses.$inferInsert) {
	await db.insert(expenses).values(data);
}

export async function deleteExpense(id: number) {
	await db.delete(expenses).where(eq(expenses.id, id));
}
