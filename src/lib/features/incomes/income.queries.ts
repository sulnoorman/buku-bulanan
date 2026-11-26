import { db } from '$lib/server/db';
import { incomes } from './income.schema';
import { cycles } from '../cycles/cycle.schema';
import { asc, eq, inArray, sql } from 'drizzle-orm';

const activeCycleIdSubquery = sql`(SELECT ${cycles.id} FROM ${cycles} WHERE ${cycles.status} = 'ACTIVE' LIMIT 1)`;

export async function getIncomesByCycle(cycleId: number) {
	return db
		.select()
		.from(incomes)
		.where(eq(incomes.cycleId, cycleId))
		.orderBy(asc(incomes.createdAt));
}

export async function getIncomesForActiveCycle() {
	return db
		.select()
		.from(incomes)
		.where(eq(incomes.cycleId, activeCycleIdSubquery))
		.orderBy(asc(incomes.createdAt));
}

export async function getIncomesByCycleIds(cycleIds: number[]) {
	if (cycleIds.length === 0) return [];
	return db
		.select()
		.from(incomes)
		.where(inArray(incomes.cycleId, cycleIds))
		.orderBy(asc(incomes.createdAt));
}

export async function createIncome(data: typeof incomes.$inferInsert) {
	await db.insert(incomes).values(data);
}

export async function deleteIncome(id: number) {
	await db.delete(incomes).where(eq(incomes.id, id));
}
