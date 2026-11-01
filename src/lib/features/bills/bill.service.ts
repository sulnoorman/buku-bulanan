import { billDueDate, daysUntil } from '$lib/utils/date';
import { DUE_SOON_DAYS } from '$lib/utils/constants';
import type { Bill } from './bill.schema';

export type BillUrgency = 'paid' | 'overdue' | 'soon' | 'normal';

export type BillView = Bill & {
	dueDate: string; // tanggal jatuh tempo aktual di siklus ini
	daysLeft: number;
	urgency: BillUrgency;
	paidAmount: number; // sudah keluar
	skippedAmount: number; // dilewati (tidak jadi keluar)
	remainingAmount: number; // masih akan keluar → memotong Safe-to-Spend
	nextAmount: number; // nominal tombol "Bayar" berikutnya
};

/**
 * Pembagian nominal bertahap. Contoh 2.000.000 ÷ 4 = 500.000 per bagian.
 * Sisa pembulatan (jika tidak habis dibagi) ditaruh di bagian terakhir.
 */
export function installmentAmounts(bill: Bill) {
	const n = bill.installments;
	const portion = Math.floor(bill.amount / n);
	const amountFor = (count: number) => (count >= n ? bill.amount : portion * count);

	const settled = bill.paidCount + bill.skippedCount;
	const paidAmount = amountFor(bill.paidCount);
	const settledAmount = amountFor(settled);

	return {
		paidAmount,
		skippedAmount: settledAmount - paidAmount,
		remainingAmount: bill.amount - settledAmount,
		nextAmount: settled + 1 >= n ? bill.amount - portion * (n - 1) : portion
	};
}

/** Tambahkan info jatuh tempo, urgensi, dan rincian nominal ke setiap tagihan */
export function toBillView(bill: Bill, cycleStart: string): BillView {
	const dueDate = billDueDate(cycleStart, bill.dueDay);
	const daysLeft = daysUntil(dueDate);

	let urgency: BillUrgency = 'normal';
	if (bill.status === 'PAID') urgency = 'paid';
	else if (daysLeft < 0) urgency = 'overdue';
	else if (daysLeft <= DUE_SOON_DAYS) urgency = 'soon';

	return { ...bill, dueDate, daysLeft, urgency, ...installmentAmounts(bill) };
}
