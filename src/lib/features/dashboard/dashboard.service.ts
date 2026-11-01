import { getBillsByCycle } from '../bills/bill.queries';
import { toBillView } from '../bills/bill.service';
import { getIncomesByCycle } from '../incomes/income.queries';
import { getExpensesByCycle } from '../expenses/expense.queries';
import type { Cycle } from '../cycles/cycle.schema';

const sum = (rows: { amount: number }[]) => rows.reduce((total, r) => total + r.amount, 0);

/**
 * Ringkasan keuangan satu siklus.
 *
 * balance     = uang yang (seharusnya) masih ada sekarang
 *             = pemasukan - tagihan yang SUDAH dibayar - pengeluaran
 * safeToSpend = balance - tagihan yang BELUM dibayar
 *
 * Jadi tombol "Bayar" memindahkan nominal dari "akan keluar" ke "sudah keluar":
 * Safe-to-Spend tidak berubah (tidak dihitung dobel), tapi balance turun.
 */
export async function getCycleSummary(cycle: Cycle) {
	const [rawBills, incomes, expenses] = await Promise.all([
		getBillsByCycle(cycle.id),
		getIncomesByCycle(cycle.id),
		getExpensesByCycle(cycle.id)
	]);

	const bills = rawBills.map((b) => toBillView(b, cycle.startDate));
	const doneCount = bills.filter((b) => b.status === 'PAID').length;

	const totalIncome = sum(incomes);
	// Untuk tagihan bertahap, yang dihitung adalah bagian yang sudah dibayar / masih tersisa.
	// Bagian yang "dilewati" tidak dihitung di mana pun → uangnya kembali ke Safe-to-Spend.
	const totalPaid = bills.reduce((s, b) => s + b.paidAmount, 0);
	const totalUnpaid = bills.reduce((s, b) => s + b.remainingAmount, 0);
	const totalExpenses = sum(expenses);
	const balance = totalIncome - totalPaid - totalExpenses;

	return {
		cycle,
		bills,
		incomes,
		expenses,
		totals: {
			income: totalIncome,
			paid: totalPaid,
			unpaid: totalUnpaid,
			expenses: totalExpenses,
			balance,
			safeToSpend: balance - totalUnpaid
		},
		counts: { paid: doneCount, total: bills.length }
	};
}

export type CycleSummary = Awaited<ReturnType<typeof getCycleSummary>>;
