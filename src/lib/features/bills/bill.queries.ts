import { db } from '$lib/server/db';
import { monthlyBills } from './bill.schema';
import { and, asc, eq, gt, lt, sql } from 'drizzle-orm';

export type InstallmentKind = 'pay' | 'skip';

export async function getBillsByCycle(cycleId: number) {
	return db
		.select()
		.from(monthlyBills)
		.where(eq(monthlyBills.cycleId, cycleId))
		.orderBy(asc(monthlyBills.dueDay));
}

const { paidCount, skippedCount, installments } = monthlyBills;
const settled = sql`${paidCount} + ${skippedCount}`;

/**
 * Selesaikan SATU bagian tagihan: dibayar ('pay') atau dilewati ('skip').
 * Satu query UPDATE + kondisi WHERE → aman walau tombol terklik dua kali.
 */
export async function settleInstallment(id: number, kind: InstallmentKind) {
	const status = sql`CASE WHEN ${settled} + 1 >= ${installments} THEN 'PAID' ELSE 'UNPAID' END`;
	const changes =
		kind === 'pay'
			? { paidCount: sql`${paidCount} + 1`, paidAt: new Date().toISOString(), status }
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
