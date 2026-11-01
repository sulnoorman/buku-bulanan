import { db } from '$lib/server/db';
import { expenses } from './expense.schema';
import { desc, eq } from 'drizzle-orm';

export async function getExpensesByCycle(cycleId: number) {
	return db
		.select()
		.from(expenses)
		.where(eq(expenses.cycleId, cycleId))
		.orderBy(desc(expenses.date), desc(expenses.id));
}

export async function createExpense(data: typeof expenses.$inferInsert) {
	await db.insert(expenses).values(data);
}

export async function deleteExpense(id: number) {
	await db.delete(expenses).where(eq(expenses.id, id));
}
