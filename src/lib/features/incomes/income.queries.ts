import { db } from '$lib/server/db';
import { incomes } from './income.schema';
import { asc, eq } from 'drizzle-orm';

export async function getIncomesByCycle(cycleId: number) {
	return db
		.select()
		.from(incomes)
		.where(eq(incomes.cycleId, cycleId))
		.orderBy(asc(incomes.createdAt));
}

export async function createIncome(data: typeof incomes.$inferInsert) {
	await db.insert(incomes).values(data);
}

export async function deleteIncome(id: number) {
	await db.delete(incomes).where(eq(incomes.id, id));
}
