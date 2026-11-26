import { db } from '$lib/server/db';
import { monthlyBills } from './bill.schema';
import { cycles } from '../cycles/cycle.schema';
import { and, asc, eq, gt, inArray, lt, sql } from 'drizzle-orm';

export type InstallmentKind = 'pay' | 'skip';

const activeCycleIdSubquery = sql`(SELECT ${cycles.id} FROM ${cycles} WHERE ${cycles.status} = 'ACTIVE' LIMIT 1)`;

export async function getBillsByCycle(cycleId: number) {
	return db
		.select()
		.from(monthlyBills)
		.where(eq(monthlyBills.cycleId, cycleId))
		.orderBy(asc(monthlyBills.dueDay));
}

export async function getBillsForActiveCycle() {
	return db
		.select()
		.from(monthlyBills)
		.where(eq(monthlyBills.cycleId, activeCycleIdSubquery))
		.orderBy(asc(monthlyBills.dueDay));
}

export async function getBillsByCycleIds(cycleIds: number[]) {
	if (cycleIds.length === 0) return [];
	return db
		.select()
		.from(monthlyBills)
		.where(inArray(monthlyBills.cycleId, cycleIds))
		.orderBy(asc(monthlyBills.dueDay));
}

const { paidCount, skippedCount, installments } = monthlyBills;
const settled = sql`${paidCount} + ${skippedCount}`;

/**
 * Selesaikan SATU bagian tagihan: dibayar ('pay') atau dilewati ('skip').
 * Jika `customAmount` diberikan (untuk tagihan dengan nominal berubah-ubah),
 * perbarui juga nominal tagihan bulan ini sebelum menandai bayar.
 */
export async function settleInstallment(id: number, kind: InstallmentKind, customAmount?: number | null) {
	const status = sql`CASE WHEN ${settled} + 1 >= ${installments} THEN 'PAID' ELSE 'UNPAID' END`;
	const changes =
		kind === 'pay'
			? {
					...(customAmount && customAmount > 0 ? { amount: customAmount } : {}),
					paidCount: sql`${paidCount} + 1`,
					paidAt: new Date().toISOString(),
					status
				}
			: { skippedCount: sql`${skippedCount} + 1`, status };

	await db
		.update(monthlyBills)
		.set(changes)
		.where(and(eq(monthlyBills.id, id), lt(settled, installments)));
}

/** Batalkan SATU bagian yang sudah dibayar / dilewati (kalau salah klik). */
export async function undoInstallment(id: number, kind: InstallmentKind) {
	const column = kind === 'pay' ? paidCount : skippedCount;
	const changes =
		kind === 'pay'
			? { paidCount: sql`${paidCount} - 1`, status: 'UNPAID' as const }
			: { skippedCount: sql`${skippedCount} - 1`, status: 'UNPAID' as const };

	await db
		.update(monthlyBills)
		.set(changes)
		.where(and(eq(monthlyBills.id, id), gt(column, 0)));
}
