import { db } from '$lib/server/db';
import { cycles } from './cycle.schema';
import { eq, desc } from 'drizzle-orm';

export async function getActiveCycle() {
	return db.query.cycles.findFirst({ where: eq(cycles.status, 'ACTIVE') });
}

export async function getLatestCycle() {
	return db.query.cycles.findFirst({ orderBy: desc(cycles.cycleNumber) });
}

export async function getCompletedCycles() {
	return db.query.cycles.findMany({
		where: eq(cycles.status, 'COMPLETED'),
		orderBy: desc(cycles.cycleNumber)
	});
}
