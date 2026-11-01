import { db } from '$lib/server/db';
import { cycles } from './cycle.schema';
import { monthlyBills } from '../bills/bill.schema';
import { incomes } from '../incomes/income.schema';
import { obligationsMaster } from '../obligations/obligation.schema';
import { eq } from 'drizzle-orm';
import { lastResetDate, todayISO } from '$lib/utils/date';
import type { Cycle } from './cycle.schema';

/**
 * Apakah dashboard perlu menampilkan "Pending Cycle Validation"?
 * - Belum ada siklus sama sekali → ya (onboarding)
 * - Siklus aktif dimulai sebelum tanggal reset terakhir → ya (sudah waktunya bulan baru)
 */
export function needsNewCycle(active: Cycle | undefined): boolean {
	if (!active) return true;
	return active.startDate < lastResetDate(active.dueDay);
}

/**
 * Dipanggil saat user klik "Ya, mulai siklus baru".
 * Semua langkah dibungkus transaction: kalau satu gagal, semua dibatalkan.
 */
export async function startNewCycle(input: {
	dueDay: number;
	incomeLabel: string;
	incomeAmount: number;
}) {
	return db.transaction(async (tx) => {
		const today = todayISO();

		// 1. Arsipkan siklus aktif (jika ada)
		await tx
			.update(cycles)
			.set({ status: 'COMPLETED', endDate: today, updatedAt: new Date().toISOString() })
			.where(eq(cycles.status, 'ACTIVE'));

		// 2. Buat siklus baru
		const latest = await tx.query.cycles.findFirst({
			orderBy: (c, { desc }) => desc(c.cycleNumber)
		});
		const [cycle] = await tx
			.insert(cycles)
			.values({
				cycleNumber: (latest?.cycleNumber ?? 0) + 1,
				dueDay: input.dueDay,
				startDate: today,
				status: 'ACTIVE'
			})
			.returning();

		// 3. Generate tagihan dari master yang aktif (snapshot nama/nominal/tanggal)
		const obligations = await tx
			.select()
			.from(obligationsMaster)
			.where(eq(obligationsMaster.isActive, true));

		if (obligations.length > 0) {
			await tx.insert(monthlyBills).values(
				obligations.map((ob) => ({
					cycleId: cycle.id,
					obligationId: ob.id,
					name: ob.name,
					amount: ob.amount,
					dueDay: ob.dueDay,
					installments: ob.installments
				}))
			);
		}

		// 4. Catat pemasukan utama
		await tx.insert(incomes).values({
			cycleId: cycle.id,
			label: input.incomeLabel,
			amount: input.incomeAmount,
			type: 'PRIMARY'
		});

		return cycle;
	});
}
