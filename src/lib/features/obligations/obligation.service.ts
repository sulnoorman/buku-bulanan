import { db } from '$lib/server/db';
import { obligationsMaster } from './obligation.schema';
import { monthlyBills } from '../bills/bill.schema';
import { getActiveCycle } from '../cycles/cycle.queries';
import { and, eq, sql } from 'drizzle-orm';
import type { ObligationInput } from './obligation.queries';

/**
 * Buat master tagihan baru.
 * Jika `addToCurrentCycle` = true dan ada siklus aktif, langsung buat tagihannya untuk bulan ini.
 */
export async function createObligation(data: ObligationInput, addToCurrentCycle: boolean) {
	const active = addToCurrentCycle ? await getActiveCycle() : undefined;

	return db.transaction(async (tx) => {
		const [obligation] = await tx.insert(obligationsMaster).values(data).returning();

		if (active) {
			await tx.insert(monthlyBills).values({
				cycleId: active.id,
				obligationId: obligation.id,
				name: obligation.name,
				amount: obligation.amount,
				dueDay: obligation.dueDay,
				installments: obligation.installments
			});
		}

		return obligation;
	});
}

/**
 * Edit master tagihan.
 * Jika `applyToCurrentCycle` = true dan ada siklus aktif, perbarui juga tagihan di siklus berjalan.
 */
export async function updateObligationWithCycle(
	id: number,
	data: ObligationInput,
	applyToCurrentCycle: boolean
) {
	const active = applyToCurrentCycle ? await getActiveCycle() : undefined;

	return db.transaction(async (tx) => {
		await tx
			.update(obligationsMaster)
			.set({ ...data, updatedAt: new Date().toISOString() })
			.where(eq(obligationsMaster.id, id));

		if (active) {
			await tx
				.update(monthlyBills)
				.set({
					name: data.name,
					amount: data.amount,
					dueDay: data.dueDay,
					installments: data.installments,
					status: sql`CASE WHEN ${monthlyBills.paidCount} + ${monthlyBills.skippedCount} >= ${data.installments} THEN 'PAID' ELSE 'UNPAID' END`
				})
				.where(and(eq(monthlyBills.cycleId, active.id), eq(monthlyBills.obligationId, id)));
		}
	});
}
