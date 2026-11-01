import { db } from '$lib/server/db';
import { obligationsMaster } from './obligation.schema';
import { asc, desc, eq } from 'drizzle-orm';

export type ObligationInput = { name: string; amount: number; dueDay: number; installments: number };

export async function getAllObligations() {
	return db
		.select()
		.from(obligationsMaster)
		.orderBy(desc(obligationsMaster.isActive), asc(obligationsMaster.dueDay));
}

export async function updateObligation(id: number, data: ObligationInput) {
	await db
		.update(obligationsMaster)
		.set({ ...data, updatedAt: new Date().toISOString() })
		.where(eq(obligationsMaster.id, id));
}

/** Soft delete: nonaktif = tidak ikut di-generate ke siklus berikutnya */
export async function setObligationActive(id: number, isActive: boolean) {
	await db
		.update(obligationsMaster)
		.set({ isActive, updatedAt: new Date().toISOString() })
		.where(eq(obligationsMaster.id, id));
}
